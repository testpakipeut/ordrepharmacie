import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  // Informations personnelles
  fullName: {
    type: String,
    required: [true, 'Le nom complet est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [200, 'Le nom de l\'entreprise ne peut pas dépasser 200 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Veuillez fournir un email valide'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'La ville est requise'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Le pays est requis'],
    trim: true
  },

  // Type de projet
  poles: [{
    type: String,
    enum: ['energie', 'geospatial', 'drone', 'securite', 'sante']
  }],
  specificServices: [{
    type: String
  }],

  // Détails du projet
  projectDescription: {
    type: String,
    required: [true, 'La description du projet est requise'],
    trim: true,
    minlength: [20, 'La description doit contenir au moins 20 caractères'],
    maxlength: [3000, 'La description ne peut pas dépasser 3000 caractères']
  },
  desiredDate: {
    type: Date
  },
  estimatedBudget: {
    type: String,
    trim: true
  },

  // Services complémentaires
  additionalServices: [{
    type: String
  }],

  // Préférences de contact
  contactPreference: [{
    type: String,
    enum: ['Email', 'Téléphone', 'WhatsApp']
  }],
  callbackTime: {
    type: String,
    enum: ['Matin', 'Après-midi', 'Soirée', '']
  },

  // Consentement
  privacyConsent: {
    type: Boolean,
    required: true
  },
  
  // Ancien champ supprimé - garder pour compatibilité avec anciennes données
  dataConsent: {
    type: Boolean,
    required: false,
    default: true
  },

  // Fichiers attachés
  attachments: [{
    filename: String,
    path: String, // URL Cloudinary
    cloudinaryId: String, // ID Cloudinary pour suppression
    mimetype: String,
    size: Number
  }],

  // Statut de la demande
  status: {
    type: String,
    enum: ['nouveau', 'en_cours', 'devis_envoye', 'accepte', 'refuse', 'archive'],
    default: 'nouveau'
  },

  // Montant du devis (si calculé)
  quoteAmount: {
    type: Number
  },
  quoteCurrency: {
    type: String,
    default: 'FCFA'
  },

  // Réponse / Notes internes
  internalNotes: {
    type: String
  },
  responseMessage: {
    type: String
  },
  respondedAt: {
    type: Date
  },

  // Métadonnées
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
quoteSchema.index({ email: 1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ poles: 1 });

// Méthode pour marquer comme traité
quoteSchema.methods.markAsProcessing = function() {
  this.status = 'en_cours';
  return this.save();
};

// Méthode pour envoyer le devis
quoteSchema.methods.sendQuote = function(amount, message) {
  this.status = 'devis_envoye';
  this.quoteAmount = amount;
  this.responseMessage = message;
  this.respondedAt = new Date();
  return this.save();
};

const Quote = mongoose.model('Quote', quoteSchema);

export default Quote;

