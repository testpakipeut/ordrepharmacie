import Newsletter from '../../models/Newsletter.js';
import { validationResult } from 'express-validator';
import { sendNewsletterConfirmationEmail, sendNewsletterNotificationEmail } from '../../config/email.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Newsletter');

export const subscribeNewsletter = async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: errors.array() 
      });
    }

    const { email, name } = req.body;

    // Vérifier si l'email existe déjà
    const existingSubscriber = await Newsletter.findOne({ email });
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(409).json({ 
          error: 'Cet email est déjà inscrit à notre newsletter.' 
        });
      } else {
        // Réactiver l'abonnement si précédemment désactivé
        existingSubscriber.isActive = true;
        existingSubscriber.name = name;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();
        
        // Ne pas envoyer d'email de confirmation pour la réactivation (éviter les doublons)
        
        return res.status(200).json({ 
          message: 'Votre abonnement à la newsletter a été réactivé avec succès!',
          subscriber: {
            email: existingSubscriber.email,
            name: existingSubscriber.name
          }
        });
      }
    }

    // Créer un nouvel abonné
    const newSubscriber = new Newsletter({
      email,
      name,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        referrer: req.headers['referer'] || req.headers['referrer']
      }
    });

    await newSubscriber.save();

    // Envoyer l'email de confirmation à l'utilisateur
    try {
      await sendNewsletterConfirmationEmail({ 
        email: newSubscriber.email, 
        name: newSubscriber.name 
      });
      logger.info('✅ Email de confirmation newsletter envoyé', { email: newSubscriber.email });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email confirmation newsletter (inscription réussie)', { 
        email: newSubscriber.email, 
        error: emailError.message 
      });
      // On continue même si l'email échoue, l'inscription est réussie
    }

    // Envoyer l'email de notification à l'entreprise
    try {
      await sendNewsletterNotificationEmail({ 
        email: newSubscriber.email, 
        name: newSubscriber.name 
      });
      logger.info('✅ Email de notification newsletter envoyé à l\'entreprise', { email: newSubscriber.email });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email notification newsletter (inscription réussie)', { 
        email: newSubscriber.email, 
        error: emailError.message 
      });
      // On continue même si l'email de notification échoue
    }

    res.status(201).json({
      message: 'Inscription réussie! Merci de vous être inscrit à notre newsletter.',
      subscriber: {
        email: newSubscriber.email,
        name: newSubscriber.name
      }
    });

  } catch (error) {
    logger.error('❌ Erreur lors de l\'inscription à la newsletter', { error: error.message, stack: error.stack });
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'Cet email est déjà inscrit.' 
      });
    }

    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.' 
    });
  }
};

export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({ 
        error: 'Aucun abonnement trouvé pour cet email.' 
      });
    }

    await subscriber.unsubscribe();

    res.status(200).json({ 
      message: 'Vous avez été désinscrit de notre newsletter.' 
    });

  } catch (error) {
    console.error('Erreur lors de la désinscription:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la désinscription.' 
    });
  }
};

export const getNewsletterStats = async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true });
    const totalInactive = await Newsletter.countDocuments({ isActive: false });
    const recentSubscribers = await Newsletter.find({ isActive: true })
      .sort({ subscribedAt: -1 })
      .limit(10)
      .select('email name subscribedAt');

    res.status(200).json({
      stats: {
        totalActive: totalSubscribers,
        totalInactive,
        total: totalSubscribers + totalInactive
      },
      recentSubscribers
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des statistiques.' 
    });
  }
};

