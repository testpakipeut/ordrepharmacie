import Simulation from '../../models/Simulation.js';
import { sendSimulationEmail, sendSimulationConfirmationEmail } from '../../config/email.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Simulation');

// Enregistrer une nouvelle simulation
export const saveSimulation = async (req, res) => {
  try {
    const {
      usage,
      appareils,
      nombrePersonnes,
      heuresUtilisation,
      budget,
      ville,
      pays,
      prenom,
      nom,
      email,
      telephone,
      kitRecommande,
      user
    } = req.body;

    // Validation
    if (!usage || !nombrePersonnes || !heuresUtilisation || !budget || !ville || !pays) {
      return res.status(400).json({
        success: false,
        message: 'Données de simulation incomplètes'
      });
    }

    // Validation des informations de contact
    if (!prenom || !nom || !email || !telephone) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez remplir tous les champs de contact (prénom, nom, email, téléphone)'
      });
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide'
      });
    }

    // Construire l'objet user avec les informations de contact
    const userData = user || {};
    if (prenom || nom || email || telephone) {
      userData.name = `${prenom || ''} ${nom || ''}`.trim();
      userData.email = email || userData.email;
      userData.phone = telephone || userData.phone;
    }

    // Créer la simulation
    const simulation = new Simulation({
      usage,
      appareils: appareils || {},
      nombrePersonnes,
      heuresUtilisation,
      budget,
      ville,
      pays,
      kitRecommande: kitRecommande || {},
      user: userData,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        referrer: req.headers['referer'] || req.headers['referrer']
      }
    });

    await simulation.save();

    // Envoyer notification email à l'admin
    try {
      await sendSimulationNotificationEmail(simulation);
      logger.info('✅ Email de notification simulation envoyé', { simulationId: simulation._id });
    } catch (emailError) {
      logger.error('❌ Erreur envoi email notification simulation', { simulationId: simulation._id, error: emailError.message });
      // Ne pas bloquer la requête si l'email échoue
    }

    // Envoyer l'email de confirmation au client
    try {
      await sendSimulationConfirmationEmail(simulation);
      logger.info('✅ Email de confirmation simulation envoyé au client', { 
        simulationId: simulation._id, 
        email: simulation.user?.email 
      });
    } catch (emailError) {
      logger.error('⚠️ Erreur envoi email confirmation simulation (simulation sauvegardée)', { 
        simulationId: simulation._id, 
        email: simulation.user?.email,
        error: emailError.message 
      });
      // On continue même si l'email de confirmation échoue
    }

    res.json({
      success: true,
      message: 'Simulation enregistrée avec succès',
      simulationId: simulation._id
    });

  } catch (error) {
    logger.error('❌ Erreur sauvegarde simulation', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'enregistrement de la simulation',
      error: error.message
    });
  }
};

// Récupérer toutes les simulations (admin)
export const getAllSimulations = async (req, res) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;

    const query = status ? { status } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [simulations, total] = await Promise.all([
      Simulation.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Simulation.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: simulations,
      count: simulations.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    logger.error('❌ Erreur récupération simulations', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des simulations',
      error: error.message
    });
  }
};

// Récupérer une simulation par ID (admin)
export const getSimulationById = async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await Simulation.findById(id);

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation non trouvée'
      });
    }

    res.json({
      success: true,
      data: simulation
    });

  } catch (error) {
    logger.error('❌ Erreur récupération simulation', { id, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la simulation',
      error: error.message
    });
  }
};

// Mettre à jour le statut d'une simulation (admin)
export const updateSimulationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const simulation = await Simulation.findByIdAndUpdate(
      id,
      { status, notes },
      { new: true }
    );

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Statut mis à jour',
      data: simulation
    });

  } catch (error) {
    logger.error('❌ Erreur mise à jour simulation', { id, status, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message
    });
  }
};

// Supprimer une simulation (admin)
export const deleteSimulation = async (req, res) => {
  try {
    const { id } = req.params;

    const simulation = await Simulation.findByIdAndDelete(id);

    if (!simulation) {
      return res.status(404).json({
        success: false,
        message: 'Simulation non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Simulation supprimée'
    });

  } catch (error) {
    logger.error('❌ Erreur suppression simulation', { id, error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

// Statistiques des simulations (admin)
export const getSimulationStats = async (req, res) => {
  try {
    const total = await Simulation.countDocuments();
    const nouveau = await Simulation.countDocuments({ status: 'nouveau' });
    const contacte = await Simulation.countDocuments({ status: 'contacte' });
    const converti = await Simulation.countDocuments({ status: 'converti' });

    // Top villes
    const topVilles = await Simulation.aggregate([
      { $group: { _id: '$ville', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top kits recommandés
    const topKits = await Simulation.aggregate([
      { $group: { _id: '$kitRecommande.nom', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        parStatut: { nouveau, contacte, converti },
        topVilles: topVilles.map(v => ({ ville: v._id, count: v.count })),
        topKits: topKits.map(k => ({ kit: k._id, count: k.count }))
      }
    });

  } catch (error) {
    logger.error('❌ Erreur récupération stats simulations', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// Fonction helper pour envoyer l'email de notification
const sendSimulationNotificationEmail = async (simulation) => {
  const appareilsList = Object.entries(simulation.appareils)
    .filter(([_, selected]) => selected)
    .map(([nom]) => nom.charAt(0).toUpperCase() + nom.slice(1))
    .join(', ') || 'Aucun';

  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #002F6C 0%, #003d73 100%); color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">🔧 Nouvelle Simulation</h1>
        <p style="margin: 10px 0 0 0;">Simulateur CIPS</p>
      </div>
      
      <div style="padding: 30px; background: #f8f9fa;">
        <h2 style="color: #002F6C; margin-top: 0;">Informations de la simulation</h2>
        
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <tr style="background: #002F6C; color: white;">
            <td colspan="2" style="padding: 12px; font-weight: bold;">📋 Détails</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Usage:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${simulation.usage}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Appareils:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${appareilsList}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nb personnes:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${simulation.nombrePersonnes}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Heures/jour:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${simulation.heuresUtilisation}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Budget:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${parseInt(simulation.budget).toLocaleString()} FCFA</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Localisation:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${simulation.ville}, ${simulation.pays}</td>
          </tr>
        </table>

        ${simulation.kitRecommande ? `
        <h2 style="color: #002F6C; margin-top: 30px;">✨ Kit Recommandé</h2>
        
        <div style="background: white; border-radius: 8px; padding: 20px; border: 2px solid #002F6C;">
          <h3 style="color: #002F6C; margin-top: 0;">${simulation.kitRecommande.nom}</h3>
          <p style="color: #666; font-style: italic;">${simulation.kitRecommande.description}</p>
          
          <div style="background: #002F6C; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 15px 0;">
            <div style="font-size: 12px; opacity: 0.9;">PRIX INSTALLATION COMPLÈTE</div>
            <div style="font-size: 28px; font-weight: bold; color: #FFD700;">${simulation.kitRecommande.prix.toLocaleString()} FCFA</div>
            <div style="font-size: 14px; margin-top: 10px; color: #4ade80;">
              💰 Économies annuelles : ${simulation.kitRecommande.economiesAnnuelles.toLocaleString()} FCFA
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
              ⏱️ ROI : ${Math.round(simulation.kitRecommande.prix / simulation.kitRecommande.economiesAnnuelles * 12)} mois
            </div>
          </div>
        </div>
        ` : ''}

        ${simulation.user?.email ? `
        <h2 style="color: #002F6C; margin-top: 30px;">👤 Contact Client</h2>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nom complet:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${simulation.user.name || 'Non renseigné'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;"><a href="mailto:${simulation.user.email}" style="color: #002F6C;">${simulation.user.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold;">Téléphone:</td>
            <td style="padding: 10px;"><a href="tel:${simulation.user.phone}" style="color: #002F6C;">${simulation.user.phone || 'Non renseigné'}</a></td>
          </tr>
        </table>
        ` : ''}

        <div style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
          <strong>🔔 Action requise</strong><br>
          Consultez l'admin pour plus de détails et contacter le client.
        </div>
      </div>
      
      <div style="background: #002F6C; color: white; padding: 20px; text-align: center;">
        <p style="margin: 0; font-size: 14px;">
          C.I.P.S - Conception Innovante pour la Sécurité<br>
          <a href="https://csip.up.railway.app/admin/simulations" style="color: #FFD700;">Voir dans l'admin →</a>
        </p>
      </div>
    </div>
  `;

  await sendSimulationEmail({
    to: process.env.COMPANY_EMAIL || 'tizi.lion@gmail.com',
    subject: `🔧 Nouvelle Simulation - ${simulation.kitRecommande?.nom || 'Kit'} - ${simulation.ville}`,
    html: emailContent
  });
};

export default {
  saveSimulation,
  getAllSimulations,
  getSimulationById,
  updateSimulationStatus,
  deleteSimulation,
  getSimulationStats
};

