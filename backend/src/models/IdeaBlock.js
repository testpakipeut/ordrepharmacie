import mongoose from 'mongoose';

const ideaBlockSchema = new mongoose.Schema({
  // Titre de l'idée
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  
  // Description de l'idée
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  
  // Catégorie de l'idée
  category: {
    type: String,
    enum: [
      'pedagogique',
      'actualites',
      'comparatifs',
      'innovations',
      'communiques',
      'partenariats'
    ],
    default: 'pedagogique'
  },
  
  // Pôle associé
  pole: {
    type: String,
    enum: ['energie', 'geospatial', 'drone', 'sante', 'securite', 'general'],
    default: 'general'
  },
  
  // Date suggérée de publication
  suggestedDate: {
    type: Date
  },
  
  // Priorité (1-5, 5 = très importante)
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  
  // Statut de l'idée
  status: {
    type: String,
    enum: ['new', 'in_progress', 'converted', 'rejected'],
    default: 'new'
  },
  
  // Lien vers l'article créé (si converti)
  articleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    default: null
  },
  
  // Tags pour organisation
  tags: [{
    type: String,
    trim: true
  }],
  
  // Notes internes
  notes: {
    type: String,
    trim: true
  },
  
  // Créé par
  createdBy: {
    type: String,
    default: 'Admin'
  }
  
}, {
  timestamps: true
});

// Index pour recherche et tri
ideaBlockSchema.index({ status: 1, priority: -1, createdAt: -1 });
ideaBlockSchema.index({ category: 1, pole: 1 });
ideaBlockSchema.index({ suggestedDate: 1 });

const IdeaBlock = mongoose.model('IdeaBlock', ideaBlockSchema);

export default IdeaBlock;












