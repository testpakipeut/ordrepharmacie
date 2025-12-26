import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Veuillez fournir un email valide'
    ]
  },
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'website_popup'
  },
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
// Note: email a déjà un index via unique: true
newsletterSchema.index({ subscribedAt: -1 });

// Méthode pour désactiver un abonnement
newsletterSchema.methods.unsubscribe = function() {
  this.isActive = false;
  return this.save();
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;

