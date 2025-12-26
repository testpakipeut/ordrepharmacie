import Contact from '../../models/Contact.js';
import { validationResult } from 'express-validator';
import { sendContactEmail, sendContactConfirmationEmail } from '../../config/email.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Contact');

export const sendMessage = async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('❌ Erreurs de validation message contact', { errors: errors.array() });
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { name, email, phone, subject, message } = req.body;

    logger.info('📬 Nouveau message contact reçu', { from: email, name, subject });

    // Créer un nouveau message de contact
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        referrer: req.headers['referer'] || req.headers['referrer']
      }
    });

    await newContact.save();

    logger.info('✅ Message contact sauvegardé avec succès', { contactId: newContact._id, from: email });

    // Envoyer l'email à l'entreprise
    try {
      await sendContactEmail({ name, email, phone, subject, message });
      logger.info('✅ Email de contact envoyé à l\'entreprise', { contactId: newContact._id });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email contact (message sauvegardé)', { contactId: newContact._id, error: emailError.message });
      // On continue même si l'email échoue, le message est sauvegardé
    }

    // Envoyer l'email de confirmation au client
    try {
      await sendContactConfirmationEmail({ name, email, phone, subject, message });
      logger.info('✅ Email de confirmation contact envoyé au client', { contactId: newContact._id, email });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email confirmation contact (message sauvegardé)', { 
        contactId: newContact._id, 
        email,
        error: emailError.message 
      });
      // On continue même si l'email de confirmation échoue
    }

    res.status(201).json({
      message: 'Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.',
      contactId: newContact._id
    });

  } catch (error) {
    logger.error('❌ Erreur lors de l\'envoi du message contact', { error: error.message, stack: error.stack });
    
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.' 
    });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { status, subject, limit = 50, skip = 0 } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (subject) filter.subject = subject;

    const messages = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Contact.countDocuments(filter);

    res.status(200).json({
      messages,
      total,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    logger.error('❌ Erreur récupération messages contact', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des messages.' 
    });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    // Marquer comme lu automatiquement
    await message.markAsRead();

    res.status(200).json({ message });

  } catch (error) {
    logger.error('❌ Erreur récupération message contact', { id, error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du message.' 
    });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['nouveau', 'lu', 'en_cours', 'resolu', 'archive'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const message = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.status(200).json({ 
      message: 'Statut mis à jour avec succès',
      contact: message 
    });

  } catch (error) {
    logger.error('❌ Erreur mise à jour statut message contact', { id, status, error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la mise à jour du statut.' 
    });
  }
};

export const respondToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ error: 'La réponse est requise' });
    }

    const message = await Contact.findById(id);

    if (!message) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    await message.respond(response);

    res.status(200).json({ 
      message: 'Réponse enregistrée avec succès',
      contact: message 
    });

  } catch (error) {
    logger.error('❌ Erreur envoi réponse contact', { id, error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de l\'envoi de la réponse.' 
    });
  }
};

export const getContactStats = async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'nouveau' });
    const resolvedMessages = await Contact.countDocuments({ status: 'resolu' });
    const inProgressMessages = await Contact.countDocuments({ status: 'en_cours' });

    // Messages par sujet
    const messagesBySubject = await Contact.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      stats: {
        total: totalMessages,
        nouveau: newMessages,
        resolu: resolvedMessages,
        enCours: inProgressMessages
      },
      messagesBySubject
    });

  } catch (error) {
    logger.error('❌ Erreur récupération stats contact', { error: error.message, stack: error.stack });
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques.' 
    });
  }
};

