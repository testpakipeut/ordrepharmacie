import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
    // Index créé explicitement plus bas, pas besoin de index: true ici
  },
  excerpt: {
    type: String,
    required: [true, 'L\'extrait est requis'],
    maxlength: [300, 'L\'extrait ne peut pas dépasser 300 caractères']
  },
  content: {
    type: String,
    required: [true, 'Le contenu est requis']
  },
  
  // Image principale
  featuredImage: {
    type: String,
    required: [true, 'L\'image principale est requise']
  },
  
  // Catégorie
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: [
      'pedagogique',      // Articles pédagogiques
      'actualites',       // Actualités du secteur
      'comparatifs',      // Comparatifs produits
      'innovations',      // Innovations technologiques
      'communiques',      // Communiqués officiels
      'partenariats'      // Partenariats annoncés
    ]
  },
  
  // Pôle associé (optionnel)
  pole: {
    type: String,
    enum: ['energie', 'geospatial', 'drone', 'sante', 'securite', 'general'],
    default: 'general'
  },
  
  // Auteur
  author: {
    name: {
      type: String,
      default: 'Équipe CIPS'
    },
    role: {
      type: String,
      default: 'Rédaction'
    },
    avatar: String
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Tags
  tags: [{
    type: String,
    trim: true
  }],
  
  // Dates
  publishedAt: {
    type: Date,
    default: Date.now
  },
  visibleFrom: {
    type: Date,
    default: Date.now
  },
  visibleUntil: {
    type: Date,
    default: null // null = toujours visible
  },
  
  // Statistiques
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number, // En minutes
    default: 5
  },
  
  // Statut
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  
  // Mise en avant
  featured: {
    type: Boolean,
    default: false
  },
  priorite: {
    type: Number,
    default: 0
  },
  
  // Partages sociaux (optionnel - pour tracking)
  shares: {
    facebook: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    linkedin: { type: Number, default: 0 }
  }
  
}, {
  timestamps: true
});

// Index pour recherche et tri
articleSchema.index({ category: 1, status: 1, publishedAt: -1 });
articleSchema.index({ featured: -1, priorite: -1, publishedAt: -1 });
// slug a déjà un index unique automatique via unique: true, pas besoin de l'indexer à nouveau
articleSchema.index({ tags: 1 });

// Méthode pour générer le slug automatiquement
articleSchema.pre('save', function(next) {
  // Générer le slug si le titre a changé ou si le slug est vide
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);

export default Article;

