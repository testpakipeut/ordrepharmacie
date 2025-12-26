import Job from '../../models/Job.js';

// Récupérer toutes les offres d'emploi actives (ou toutes si all=true pour admin)
export const getAllJobs = async (req, res) => {
  try {
    const { departement, type, all } = req.query;
    
    let jobs;
    
    if (all === 'true') {
      // Pour l'admin : récupérer toutes les offres
      const filters = {};
      if (departement) filters.departement = departement;
      if (type) filters.type = type;
      
      jobs = await Job.find(filters).sort({ priorite: -1, datePublication: -1 });
    } else {
      // Pour le public : uniquement les offres actives
      const filters = {};
      if (departement) filters.departement = departement;
      if (type) filters.type = type;
      
      // Debug : log des filtres et du nombre d'offres trouvées
      const now = new Date();
      console.log('🔍 Filtrage public des offres:');
      console.log('  - Date actuelle:', now.toISOString());
      console.log('  - Filtres:', filters);
      
      jobs = await Job.getOffresActives(filters);
      
      console.log(`  - Offres trouvées: ${jobs.length}`);
      if (jobs.length > 0) {
        jobs.forEach(job => {
          console.log(`    ✓ ${job.titre} - Actif: ${job.actif}, Pub: ${job.datePublication?.toISOString()}, Exp: ${job.dateExpiration?.toISOString() || 'N/A'}`);
        });
      }
    }

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des offres d\'emploi',
      error: error.message
    });
  }
};

// Récupérer une offre d'emploi par ID
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    // Si l'utilisateur est authentifié (admin), on lui permet d'accéder même aux jobs inactifs
    // Sinon (public), on vérifie que le job est valide
    if (!req.user && !job.estValide()) {
      return res.status(410).json({
        success: false,
        message: 'Cette offre d\'emploi n\'est plus disponible'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'offre d\'emploi',
      error: error.message
    });
  }
};

// Créer une nouvelle offre d'emploi (admin)
export const createJob = async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Offre d\'emploi créée avec succès',
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la création de l\'offre d\'emploi',
      error: error.message
    });
  }
};

// Mettre à jour une offre d'emploi (admin)
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offre d\'emploi mise à jour avec succès',
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre:', error);
    res.status(400).json({
      success: false,
      message: 'Erreur lors de la mise à jour de l\'offre d\'emploi',
      error: error.message
    });
  }
};

// Supprimer une offre d'emploi (admin)
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offre d\'emploi supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'offre d\'emploi',
      error: error.message
    });
  }
};

// Désactiver une offre d'emploi (soft delete)
export const deactivateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { actif: false },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Offre d\'emploi non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Offre d\'emploi désactivée avec succès',
      data: job
    });
  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation de l\'offre d\'emploi',
      error: error.message
    });
  }
};

// Obtenir les statistiques des offres
export const getJobStats = async (req, res) => {
  try {
    const stats = await Job.aggregate([
      {
        $match: { actif: true }
      },
      {
        $group: {
          _id: '$departement',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalActives = await Job.countDocuments({ actif: true });
    const totalInactives = await Job.countDocuments({ actif: false });

    res.status(200).json({
      success: true,
      data: {
        parDepartement: stats,
        totalActives,
        totalInactives,
        total: totalActives + totalInactives
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

