import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
  // Source de l'erreur
  source: {
    type: String,
    enum: ['frontend', 'backend'],
    required: true
  },
  
  // Niveau de sévérité
  level: {
    type: String,
    enum: ['error', 'warn', 'info', 'debug'],
    required: true,
    default: 'error'
  },
  
  // Message d'erreur
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Stack trace (pour les erreurs JavaScript)
  stack: {
    type: String,
    trim: true
  },
  
  // Module/Composant où l'erreur s'est produite
  module: {
    type: String,
    trim: true
  },
  
  // URL/Route où l'erreur s'est produite (frontend)
  url: {
    type: String,
    trim: true
  },
  
  // Méthode HTTP (backend)
  method: {
    type: String,
    trim: true
  },
  
  // Endpoint/Route (backend)
  endpoint: {
    type: String,
    trim: true
  },
  
  // Métadonnées utilisateur
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    userId: String,
    sessionId: String,
    browser: String,
    os: String,
    device: String
  },
  
  // Données additionnelles (objet JSON)
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Statut de l'erreur
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved', 'ignored'],
    default: 'new'
  },
  
  // Nombre d'occurrences (pour grouper les erreurs similaires)
  count: {
    type: Number,
    default: 1
  },
  
  // Hash pour identifier les erreurs similaires
  errorHash: {
    type: String
  },
  
  // Dernière occurrence
  lastOccurredAt: {
    type: Date,
    default: Date.now
  },
  
  // Email d'alerte envoyé
  alertSent: {
    type: Boolean,
    default: false
  },
  
  // Date d'envoi de l'alerte
  alertSentAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
errorLogSchema.index({ source: 1, level: 1 });
errorLogSchema.index({ createdAt: -1 });
errorLogSchema.index({ status: 1 });
errorLogSchema.index({ errorHash: 1 });
errorLogSchema.index({ level: 1, alertSent: 1 });

// Méthode pour générer un hash d'erreur (pour grouper les erreurs similaires)
errorLogSchema.methods.generateErrorHash = function() {
  const crypto = require('crypto');
  const hashString = `${this.source}-${this.module}-${this.message?.substring(0, 100)}-${this.stack?.substring(0, 200)}`;
  return crypto.createHash('md5').update(hashString).digest('hex');
};

// Méthode statique pour trouver ou créer une erreur similaire
errorLogSchema.statics.findOrCreateSimilar = async function(errorData) {
  const ErrorLog = this;
  
  // Générer le hash
  const tempError = new ErrorLog(errorData);
  const errorHash = tempError.generateErrorHash();
  
  // Chercher une erreur similaire non résolue
  const similarError = await ErrorLog.findOne({
    errorHash,
    status: { $ne: 'resolved' }
  });
  
  if (similarError) {
    // Incrémenter le compteur et mettre à jour la date
    similarError.count += 1;
    similarError.lastOccurredAt = new Date();
    await similarError.save();
    return similarError;
  }
  
  // Créer une nouvelle erreur
  errorData.errorHash = errorHash;
  return await ErrorLog.create(errorData);
};

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

export default ErrorLog;




