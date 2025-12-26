import Article from '../../models/Article.js';
import { body, param, validationResult } from 'express-validator';

// Récupérer tous les articles (avec filtres)
export const getAllArticles = async (req, res) => {
  try {
    const { category, pole, tag, search, featured, all } = req.query;
    
    // Construction du filtre
    const filter = {};
    
    // Si all=true (pour admin), récupérer tous les articles
    // Sinon, filtrer uniquement les articles publiés et visibles
    if (all !== 'true') {
      filter.status = 'published';
      
      // Filtrer par dates de visibilité
      const now = new Date();
      filter.visibleFrom = { $lte: now }; // Déjà visible
      filter.$or = [
        { visibleUntil: null }, // Toujours visible
        { visibleUntil: { $gte: now } } // Pas encore expiré
      ];
    }
    
    if (category) filter.category = category;
    if (pole) filter.pole = pole;
    if (tag) filter.tags = tag;
    if (featured) filter.featured = featured === 'true';
    if (search) {
      // Déplacer le $or existant dans $and si nécessaire
      const searchFilter = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { excerpt: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      };
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, searchFilter];
        delete filter.$or;
      } else {
        filter.$or = searchFilter.$or;
      }
    }
    
    const articles = await Article.find(filter)
      .sort({ featured: -1, priorite: -1, publishedAt: -1 }) // Articles mis en avant d'abord, puis par priorité, puis par date
      .select('-content -__v'); // Exclure le contenu complet pour la liste
    
    res.json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des articles'
    });
  }
};

// Récupérer un article par ID ou slug
export const getArticleByIdOrSlug = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Chercher par ID ou slug
    let article;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // C'est un ID MongoDB
      article = await Article.findById(identifier);
    } else {
      // C'est un slug
      article = await Article.findOne({ slug: identifier });
    }
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    // Incrémenter les vues
    article.views += 1;
    await article.save();
    
    res.json({
      success: true,
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'article'
    });
  }
};

// Récupérer les articles similaires
export const getSimilarArticles = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Trouver l'article actuel
    let article;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(identifier);
    } else {
      article = await Article.findOne({ slug: identifier });
    }
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    // Trouver des articles similaires (même catégorie ou même pôle)
    const similarArticles = await Article.find({
      _id: { $ne: article._id },
      status: 'published',
      $or: [
        { category: article.category },
        { pole: article.pole },
        { tags: { $in: article.tags } }
      ]
    })
      .limit(3)
      .sort({ publishedAt: -1 })
      .select('-content -__v');
    
    res.json({
      success: true,
      count: similarArticles.length,
      data: similarArticles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des articles similaires:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des articles similaires'
    });
  }
};

// Créer un article (Admin)
export const createArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    // Générer le slug à partir du titre si non fourni
    if (!req.body.slug && req.body.title) {
      req.body.slug = req.body.title
        .toLowerCase()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      console.log('📝 [ARTICLE] Slug généré:', req.body.slug);
    }
    
    const article = await Article.create(req.body);
    
    console.log('✅ [ARTICLE] Article créé:', article._id);
    
    res.status(201).json({
      success: true,
      message: 'Article créé avec succès',
      data: article
    });
  } catch (error) {
    console.error('❌ [ARTICLE] Erreur lors de la création:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création de l\'article'
    });
  }
};

// Mettre à jour un article (Admin)
export const updateArticle = async (req, res) => {
  try {
    // Pour les mises à jour partielles (ex: juste le statut), on n'applique pas toutes les validations
    // Seulement valider les champs présents dans req.body
    const errors = validationResult(req);
    const hasOnlyPartialFields = Object.keys(req.body).length <= 3 && (req.body.status || req.body.visibleFrom || req.body.visibleUntil);
    
    // Si ce n'est pas une mise à jour partielle et qu'il y a des erreurs, les retourner
    if (!hasOnlyPartialFields && !errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Données invalides',
        details: errors.array()
      });
    }
    
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: !hasOnlyPartialFields } // Ne pas valider tous les champs si mise à jour partielle
    );
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Article mis à jour avec succès',
      data: article
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la mise à jour de l\'article',
      details: error.message
    });
  }
};

// Supprimer un article (Admin)
export const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article non trouvé'
      });
    }
    
    res.json({
      success: true,
      message: 'Article supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression de l\'article'
    });
  }
};

// Validations pour création/modification
export const articleValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ max: 200 }).withMessage('Le titre ne peut pas dépasser 200 caractères'),
  body('excerpt')
    .trim()
    .notEmpty().withMessage('L\'extrait est requis')
    .isLength({ max: 300 }).withMessage('L\'extrait ne peut pas dépasser 300 caractères'),
  body('content')
    .trim()
    .notEmpty().withMessage('Le contenu est requis'),
  body('category')
    .notEmpty().withMessage('La catégorie est requise')
    .isIn(['pedagogique', 'actualites', 'comparatifs', 'innovations', 'communiques', 'partenariats'])
    .withMessage('Catégorie invalide'),
  body('featuredImage')
    .notEmpty().withMessage('L\'image principale est requise')
];

// Validation pour ID
export const idValidation = [
  param('id').isMongoId().withMessage('ID invalide')
];

