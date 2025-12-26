import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
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
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Le sujet est requis'],
    trim: true,
    minlength: [2, 'Le sujet doit contenir au moins 2 caractères'],
    maxlength: [200, 'Le sujet ne peut pas dépasser 200 caractères']
  },
  message: {
    type: String,
    required: [true, 'Le message est requis'],
    trim: true,
    minlength: [10, 'Le message doit contenir au moins 10 caractères'],
    maxlength: [2000, 'Le message ne peut pas dépasser 2000 caractères']
  },
  status: {
    type: String,
    enum: ['nouveau', 'lu', 'en_cours', 'resolu', 'archive'],
    default: 'nouveau'
  },
  response: {
    type: String,
    trim: true
  },
  respondedAt: {
    type: Date
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
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ subject: 1 });

// Méthode pour marquer comme lu
contactSchema.methods.markAsRead = function() {
  if (this.status === 'nouveau') {
    this.status = 'lu';
  }
  return this.save();
};

// Méthode pour répondre
contactSchema.methods.respond = function(responseText) {
  this.response = responseText;
  this.respondedAt = new Date();
  this.status = 'resolu';
  return this.save();
};

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;

