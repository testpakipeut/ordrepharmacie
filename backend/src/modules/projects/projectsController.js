import Project from '../../models/Project.js';
import { body, param, validationResult } from 'express-validator';

// Récupérer tous les projets (avec filtres optionnels)
export const getAllProjects = async (req, res) => {
  try {
    const { pole, status, featured, all } = req.query;
    
    // Construction du filtre
    const filter = {};
    
    // Si all=true (pour admin), récupérer tous les projets
    // Sinon, filtrer uniquement les projets publiés et visibles
    if (all !== 'true') {
      filter.published = true;
      
      // Filtrer par dates de visibilité
      const now = new Date();
      filter.visibleFrom = { $lte: now };
      filter.$or = [
        { visibleUntil: null },
        { visibleUntil: { $gte: now } }
      ];
    }
    
    if (pole) filter.pole = pole;
    if (status) filter.status = status;
    if (featured) filter.featured = featured === 'true';
    
    const projects = await Project.find(filter)
      .sort({ featured: -1, priorite: -1, date: -1 }) // Projets mis en avant d'abord, puis par priorité, puis par date
      .select('-__v');
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des projets'
    });
  }
};

// Récupérer un projet par ID
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du projet'
    });
  }
};

// Créer un nouveau projet (Admin)
export const createProject = async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const project = await Project.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du projet'
    });
  }
};

// Mettre à jour un projet (Admin) - Mise à jour complète avec validation
export const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du projet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du projet'
    });
  }
};

// Mettre à jour partiellement un projet (Admin) - Pour toggle featured/published
export const patchProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false } // Pas de validation complète pour les mises à jour partielles
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Projet mis à jour avec succès',
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour partielle du projet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du projet'
    });
  }
};

// Supprimer un projet (Admin)
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Projet non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Projet supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du projet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du projet'
    });
  }
};

// Validations pour création/modification
export const projectValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ max: 200 }).withMessage('Le titre ne peut pas dépasser 200 caractères'),
  body('description')
    .trim()
    .notEmpty().withMessage('La description est requise')
    .isLength({ max: 5000 }).withMessage('La description ne peut pas dépasser 5000 caractères'),
  body('shortDescription')
    .trim()
    .notEmpty().withMessage('La description courte est requise')
    .isLength({ max: 300 }).withMessage('La description courte ne peut pas dépasser 300 caractères'),
  body('pole')
    .notEmpty().withMessage('Le pôle est requis')
    .isIn(['energie', 'geospatial', 'drone', 'sante', 'securite']).withMessage('Pôle invalide'),
  body('mainImage')
    .notEmpty().withMessage('L\'image principale est requise'),
  body('location.city')
    .notEmpty().withMessage('La ville est requise')
];

// Validation pour ID
export const idValidation = [
  param('id').isMongoId().withMessage('ID invalide')
];

