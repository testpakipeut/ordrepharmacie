import IdeaBlock from '../../models/IdeaBlock.js';
import { body, param, validationResult } from 'express-validator';

// Récupérer tous les blocs d'idées
export const getAllIdeaBlocks = async (req, res) => {
  try {
    const { status, category, pole, priority } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (pole) filter.pole = pole;
    if (priority) filter.priority = parseInt(priority);
    
    const ideaBlocks = await IdeaBlock.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .populate('articleId', 'title status');
    
    res.json({
      success: true,
      count: ideaBlocks.length,
      data: ideaBlocks
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des blocs d\'idées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des blocs d\'idées'
    });
  }
};

// Récupérer un bloc d'idée par ID
export const getIdeaBlockById = async (req, res) => {
  try {
    const ideaBlock = await IdeaBlock.findById(req.params.id)
      .populate('articleId', 'title status visibleFrom');
    
    if (!ideaBlock) {
      return res.status(404).json({
        success: false,
        error: 'Bloc d\'idée non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: ideaBlock
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du bloc d\'idée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du bloc d\'idée'
    });
  }
};

// Créer un bloc d'idée
export const createIdeaBlock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const ideaBlock = await IdeaBlock.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Bloc d\'idée créé avec succès',
      data: ideaBlock
    });
  } catch (error) {
    console.error('Erreur lors de la création du bloc d\'idée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du bloc d\'idée'
    });
  }
};

// Mettre à jour un bloc d'idée
export const updateIdeaBlock = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const ideaBlock = await IdeaBlock.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!ideaBlock) {
      return res.status(404).json({
        success: false,
        error: 'Bloc d\'idée non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Bloc d\'idée mis à jour avec succès',
      data: ideaBlock
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du bloc d\'idée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour du bloc d\'idée'
    });
  }
};

// Supprimer un bloc d'idée
export const deleteIdeaBlock = async (req, res) => {
  try {
    const ideaBlock = await IdeaBlock.findByIdAndDelete(req.params.id);
    
    if (!ideaBlock) {
      return res.status(404).json({
        success: false,
        error: 'Bloc d\'idée non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Bloc d\'idée supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du bloc d\'idée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression du bloc d\'idée'
    });
  }
};

// Convertir un bloc d'idée en article (créer un brouillon)
export const convertToArticle = async (req, res) => {
  try {
    const ideaBlock = await IdeaBlock.findById(req.params.id);
    
    if (!ideaBlock) {
      return res.status(404).json({
        success: false,
        error: 'Bloc d\'idée non trouvé'
      });
    }
    
    // Importer le modèle Article
    const Article = (await import('../../models/Article.js')).default;
    
    // Créer un article brouillon simple à partir de l'idée
    const article = await Article.create({
      title: ideaBlock.title,
      excerpt: '', // À compléter par l'utilisateur
      content: '', // À compléter par l'utilisateur
      category: ideaBlock.category, // Catégorie pré-remplie
      pole: 'general', // Par défaut
      tags: [],
      status: 'draft', // Toujours en brouillon
      featured: false,
      author: {
        name: 'Équipe CIPS',
        role: 'Rédaction'
      },
      seo: {
        metaTitle: ideaBlock.title, // Titre pré-rempli comme metaTitle
        metaDescription: '',
        keywords: []
      },
      visibleFrom: new Date(), // Date actuelle par défaut
      visibleUntil: '',
      readTime: 5,
      priorite: 0, // Priorité normale
      featuredImage: '' // À compléter par l'utilisateur
    });
    
    // Mettre à jour le bloc d'idée
    ideaBlock.status = 'converted';
    ideaBlock.articleId = article._id;
    await ideaBlock.save();
    
    res.json({
      success: true,
      message: 'Bloc d\'idée converti en article avec succès',
      data: {
        ideaBlock,
        article
      }
    });
  } catch (error) {
    console.error('Erreur lors de la conversion du bloc d\'idée:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la conversion du bloc d\'idée'
    });
  }
};

// Validations
export const ideaBlockValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ max: 200 }).withMessage('Le titre ne peut pas dépasser 200 caractères'),
  body('category')
    .optional()
    .isIn(['pedagogique', 'actualites', 'comparatifs', 'innovations', 'communiques', 'partenariats'])
    .withMessage('Catégorie invalide'),
  body('priority')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('La priorité doit être entre 1 et 5'),
  body('status')
    .optional()
    .isIn(['new', 'in_progress', 'converted', 'rejected'])
    .withMessage('Statut invalide')
];

export const idValidation = [
  param('id').isMongoId().withMessage('ID invalide')
];

