import Quote from '../../models/Quote.js';
import { validationResult } from 'express-validator';
import { sendQuoteEmail, sendQuoteConfirmationEmail } from '../../config/email.js';
import { generateQuotePDF } from '../../services/pdfService.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Devis');

export const submitQuote = async (req, res) => {
  try {
    logger.debug('📋 Réception demande de devis - Données brutes', {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city,
      country: req.body.country,
      projectDescription: req.body.projectDescription?.substring(0, 50) + '...',
      privacyConsent: req.body.privacyConsent
    });

    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('❌ Erreurs de validation demande devis', { errors: errors.array() });
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    logger.info('✅ Validation réussie - Nouvelle demande de devis reçue', { from: req.body.email });

    // Parser les champs JSON
    const poles = req.body.poles ? JSON.parse(req.body.poles) : [];
    const specificServices = req.body.specificServices ? JSON.parse(req.body.specificServices) : [];
    const additionalServices = req.body.additionalServices ? JSON.parse(req.body.additionalServices) : [];
    const contactPreference = req.body.contactPreference ? JSON.parse(req.body.contactPreference) : [];

    const quoteData = {
      fullName: req.body.fullName,
      company: req.body.company,
      email: req.body.email,
      phone: req.body.phone,
      city: req.body.city,
      country: req.body.country,
      poles,
      specificServices,
      projectDescription: req.body.projectDescription,
      desiredDate: req.body.desiredDate ? new Date(req.body.desiredDate) : null,
      estimatedBudget: req.body.estimatedBudget,
      additionalServices,
      contactPreference,
      callbackTime: req.body.callbackTime,
      privacyConsent: req.body.privacyConsent === 'true',
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        referrer: req.headers['referer'] || req.headers['referrer']
      }
    };

    // Gérer les fichiers attachés
    if (req.files && req.files.length > 0) {
      quoteData.attachments = req.files.map(file => ({
        filename: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size
      }));
      logger.info('📎 Fichiers joints reçus', { count: quoteData.attachments.length });
    }

    const newQuote = new Quote(quoteData);
    await newQuote.save();

    logger.info('✅ Demande de devis sauvegardée avec succès', { quoteId: newQuote._id, from: quoteData.email });

    // Générer le PDF du devis
    let pdfData = null;
    try {
      pdfData = await generateQuotePDF(quoteData);
      logger.info('✅ PDF de devis généré avec succès', { filename: pdfData.filename, quoteId: newQuote._id });
    } catch (pdfError) {
      logger.error('⚠️ Erreur génération PDF de devis', { quoteId: newQuote._id, error: pdfError.message });
    }

    // Envoyer l'email à l'entreprise avec les pièces jointes et le PDF
    try {
      await sendQuoteEmail(quoteData, req.files || [], pdfData);
      logger.info('✅ Email de devis envoyé à l\'entreprise', { quoteId: newQuote._id });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email devis (demande sauvegardée)', { quoteId: newQuote._id, error: emailError.message });
      // On continue même si l'email échoue, la demande est sauvegardée
    }

    // Envoyer l'email de confirmation au client
    try {
      await sendQuoteConfirmationEmail(quoteData);
      logger.info('✅ Email de confirmation devis envoyé au client', { quoteId: newQuote._id, email: quoteData.email });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email confirmation devis (demande sauvegardée)', { 
        quoteId: newQuote._id, 
        email: quoteData.email,
        error: emailError.message 
      });
      // On continue même si l'email de confirmation échoue
    }

    res.status(201).json({
      message: 'Votre demande de devis a été envoyée avec succès! Nous vous contacterons dans les plus brefs délais.',
      quoteId: newQuote._id
    });

  } catch (error) {
    logger.error('❌ Erreur lors du traitement de la demande de devis', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.' 
    });
  }
};

export const getAllQuotes = async (req, res) => {
  try {
    const { status, pole, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (pole) filter.poles = pole;

    const quotes = await Quote.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Quote.countDocuments(filter);

    res.status(200).json({
      quotes,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    logger.error('❌ Erreur récupération devis', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des devis.' 
    });
  }
};

export const getQuoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);

    if (!quote) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.status(200).json({ quote });

  } catch (error) {
    logger.error('❌ Erreur récupération devis', { id, error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du devis.' 
    });
  }
};

export const updateQuoteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['nouveau', 'en_cours', 'devis_envoye', 'accepte', 'refuse', 'archive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const quote = await Quote.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({ error: 'Devis non trouvé' });
    }

    res.status(200).json({ 
      message: 'Statut mis à jour',
      quote 
    });

  } catch (error) {
    logger.error('❌ Erreur mise à jour devis', { id, status, error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour.' 
    });
  }
};

export const getQuoteStats = async (req, res) => {
  try {
    const total = await Quote.countDocuments();
    const nouveau = await Quote.countDocuments({ status: 'nouveau' });
    const enCours = await Quote.countDocuments({ status: 'en_cours' });
    const devisEnvoye = await Quote.countDocuments({ status: 'devis_envoye' });
    const accepte = await Quote.countDocuments({ status: 'accepte' });

    // Devis par pôle
    const quotesByPole = await Quote.aggregate([
      { $unwind: '$poles' },
      {
        $group: {
          _id: '$poles',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      stats: {
        total,
        nouveau,
        enCours,
        devisEnvoye,
        accepte
      },
      quotesByPole
    });

  } catch (error) {
    logger.error('❌ Erreur récupération stats devis', { error: error.message, stack: error.stack });
    res.status(500).json({
      error: 'Erreur lors de la récupération des statistiques.'
    });
  }
};

