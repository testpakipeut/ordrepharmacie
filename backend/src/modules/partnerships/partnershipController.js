import Partnership from '../../models/Partnership.js';
import { validationResult } from 'express-validator';
import { sendPartnershipEmail, sendPartnershipConfirmationEmail } from '../../config/email.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Partenariat');

export const submitPartnership = async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn('❌ Erreurs de validation demande partenariat', { errors: errors.array() });
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { entreprise, nom, email, telephone, typePartenariat, message } = req.body;

    logger.info('🤝 Nouvelle demande de partenariat reçue', { 
      from: email, 
      entreprise, 
      type: typePartenariat 
    });

    // Créer une nouvelle demande de partenariat
    const newPartnership = new Partnership({
      entreprise,
      nom,
      email,
      telephone,
      typePartenariat,
      message,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        referrer: req.headers['referer'] || req.headers['referrer']
      }
    });

    await newPartnership.save();

    logger.info('✅ Demande de partenariat sauvegardée avec succès', { 
      partnershipId: newPartnership._id, 
      from: email 
    });

    // Envoyer l'email à l'entreprise
    try {
      await sendPartnershipEmail({ 
        entreprise, 
        nom, 
        email, 
        telephone, 
        typePartenariat, 
        message 
      });
      logger.info('✅ Email de demande de partenariat envoyé à l\'entreprise', { 
        partnershipId: newPartnership._id 
      });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email partenariat (demande sauvegardée)', { 
        partnershipId: newPartnership._id, 
        error: emailError.message 
      });
      // On continue même si l'email échoue, la demande est sauvegardée
    }

    // Envoyer l'email de confirmation au client
    try {
      await sendPartnershipConfirmationEmail({ 
        entreprise, 
        nom, 
        email, 
        telephone, 
        typePartenariat, 
        message 
      });
      logger.info('✅ Email de confirmation partenariat envoyé au client', { 
        partnershipId: newPartnership._id, 
        email 
      });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email confirmation partenariat (demande sauvegardée)', { 
        partnershipId: newPartnership._id, 
        email,
        error: emailError.message 
      });
      // On continue même si l'email de confirmation échoue
    }

    res.status(201).json({
      success: true,
      message: 'Votre demande de partenariat a été envoyée avec succès! Nous vous contacterons bientôt.',
      partnershipId: newPartnership._id
    });

  } catch (error) {
    logger.error('❌ Erreur lors de l\'envoi de la demande de partenariat', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({
      error: 'Une erreur est survenue lors de l\'envoi de votre demande. Veuillez réessayer.'
    });
  }
};

// Récupérer toutes les demandes de partenariat (admin)
export const getAllPartnerships = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    
    const query = status ? { status } : {};
    const skip = (page - 1) * limit;

    const partnerships = await Partnership.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Partnership.countDocuments(query);

    logger.info('📋 Récupération demandes partenariat', { 
      count: partnerships.length, 
      total, 
      page, 
      status 
    });

    res.json({
      success: true,
      data: partnerships,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    logger.error('❌ Erreur récupération demandes partenariat', { error: error.message });
    res.status(500).json({
      error: 'Erreur lors de la récupération des demandes de partenariat'
    });
  }
};

// Mettre à jour le statut d'une demande de partenariat
export const updatePartnershipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['nouveau', 'en_cours', 'accepte', 'refuse'].includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide'
      });
    }

    const partnership = await Partnership.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!partnership) {
      return res.status(404).json({
        error: 'Demande de partenariat non trouvée'
      });
    }

    logger.info('✅ Statut demande partenariat mis à jour', { 
      partnershipId: id, 
      newStatus: status 
    });

    res.json({
      success: true,
      data: partnership
    });

  } catch (error) {
    logger.error('❌ Erreur mise à jour statut partenariat', { error: error.message });
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du statut'
    });
  }
};

// Supprimer une demande de partenariat
export const deletePartnership = async (req, res) => {
  try {
    const { id } = req.params;

    const partnership = await Partnership.findByIdAndDelete(id);

    if (!partnership) {
      return res.status(404).json({
        error: 'Demande de partenariat non trouvée'
      });
    }

    logger.info('🗑️ Demande de partenariat supprimée', { partnershipId: id });

    res.json({
      success: true,
      message: 'Demande de partenariat supprimée avec succès'
    });

  } catch (error) {
    logger.error('❌ Erreur suppression demande partenariat', { error: error.message });
    res.status(500).json({
      error: 'Erreur lors de la suppression de la demande'
    });
  }
};

