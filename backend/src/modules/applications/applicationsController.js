import Application from '../../models/Application.js';
import Job from '../../models/Job.js';
import { sendApplicationEmail, sendApplicationConfirmationEmail } from '../../config/email.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Application');

// Soumettre une candidature
export const submitApplication = async (req, res) => {
  try {
    const { jobId, nom, email, telephone, message } = req.body;

    logger.info('📨 Nouvelle candidature reçue', { nom, email, jobId: jobId || 'spontanée', hasCV: !!req.file });

    // Si jobId fourni, vérifier que le job existe et est actif
    let job = null;
    if (jobId) {
      job = await Job.findById(jobId);
      if (!job || !job.estValide()) {
        logger.warn('❌ Offre non disponible pour candidature', { jobId });
        return res.status(404).json({
          success: false,
          message: 'Cette offre d\'emploi n\'est plus disponible'
        });
      }
      logger.info('✅ Offre trouvée', { jobTitle: job.titre, jobId });
    } else {
      logger.info('✅ Candidature spontanée (pas d\'offre spécifique)');
    }

    // Créer la candidature
    const application = await Application.create({
      jobId,
      nom,
      email,
      telephone,
      message,
      cvPath: req.file ? req.file.filename : null // Stocker juste le nom du fichier
    });

    logger.info('✅ Candidature sauvegardée avec succès', { applicationId: application._id, email, jobId });

    // Envoyer l'email de notification à l'entreprise
    try {
      const jobData = job ? {
        titre: job.titre,
        departement: job.departement,
        type: job.type,
        localisation: job.localisation
      } : {
        titre: 'Candidature spontanée',
        departement: 'Général',
        type: 'Candidature spontanée',
        localisation: 'Non spécifié'
      };
      await sendApplicationEmail({ nom, email, telephone, message }, jobData, req.file);
      logger.info('✅ Email de candidature envoyé à l\'entreprise', { applicationId: application._id });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email candidature (candidature sauvegardée)', { 
        applicationId: application._id, 
        error: emailError.message 
      });
      // On continue même si l'email échoue, la candidature est sauvegardée
    }

    // Envoyer l'email de confirmation au candidat
    try {
      const jobData = job ? {
        titre: job.titre,
        departement: job.departement,
        type: job.type
      } : {
        titre: 'Candidature spontanée',
        departement: 'Général',
        type: 'Candidature spontanée'
      };
      await sendApplicationConfirmationEmail({ nom, email, telephone, message }, jobData);
      logger.info('✅ Email de confirmation candidature envoyé au candidat', { 
        applicationId: application._id, 
        email 
      });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email confirmation candidature (candidature sauvegardée)', { 
        applicationId: application._id, 
        email,
        error: emailError.message 
      });
      // On continue même si l'email de confirmation échoue
    }

    res.status(201).json({
      success: true,
      message: 'Votre candidature a été envoyée avec succès ! Nous vous contacterons bientôt.',
      data: {
        id: application._id,
        cvStored: !!req.file
      }
    });
  } catch (error) {
    logger.error('❌ Erreur lors de l\'envoi de la candidature', { error: error.message, stack: error.stack });
    res.status(400).json({
      success: false,
      message: 'Erreur lors de l\'envoi de votre candidature',
      error: error.message
    });
  }
};

// Récupérer toutes les candidatures (admin)
export const getAllApplications = async (req, res) => {
  try {
    const { jobId, statut } = req.query;
    
    const filters = {};
    if (jobId) filters.jobId = jobId;
    if (statut) filters.statut = statut;

    const applications = await Application.find(filters)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des candidatures',
      error: error.message
    });
  }
};

// Récupérer une candidature par ID (admin)
export const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la candidature:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la candidature',
      error: error.message
    });
  }
};

// Mettre à jour le statut d'une candidature (admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { statut, notes, dateEntretien } = req.body;

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { statut, notes, dateEntretien },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Statut de la candidature mis à jour',
      data: application
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Supprimer une candidature (admin)
export const deleteApplication = async (req, res) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Candidature non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidature supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Statistiques des candidatures (admin)
export const getApplicationStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$statut',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Application.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        parStatut: stats,
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

