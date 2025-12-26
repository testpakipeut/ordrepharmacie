import mongoose from 'mongoose';

const simulationSchema = new mongoose.Schema({
  // Informations utilisateur (optionnelles - peut être anonyme)
  user: {
    name: String,
    email: String,
    phone: String
  },

  // Type d'usage
  usage: {
    type: String,
    enum: ['residentiel', 'professionnel', 'mixte'],
    required: true
  },

  // Appareils sélectionnés
  appareils: {
    refrigerateur: Boolean,
    television: Boolean,
    climatisation: Boolean,
    ordinateur: Boolean,
    eclairage: Boolean,
    chargeurs: Boolean,
    congelateur: Boolean,
    ventilateurs: Boolean
  },

  // Informations complémentaires
  nombrePersonnes: {
    type: String,
    required: true
  },
  heuresUtilisation: {
    type: String,
    required: true
  },
  budget: {
    type: String,
    required: true
  },

  // Localisation
  ville: {
    type: String,
    required: true
  },
  pays: {
    type: String,
    required: true,
    default: 'GABON'
  },

  // Kit recommandé (résultat)
  kitRecommande: {
    nom: String,
    puissance: String,
    prix: Number,
    economiesAnnuelles: Number,
    description: String,
    contenu: [String],
    adapte: [String]
  },

  // Métadonnées analytics
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String,
    sessionId: String
  },

  // Statut du suivi
  status: {
    type: String,
    enum: ['nouveau', 'contacte', 'converti', 'archive'],
    default: 'nouveau'
  },

  // Notes internes admin
  notes: String,

  // Si converti en devis
  convertedToQuote: {
    type: Boolean,
    default: false
  },
  quoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quote'
  }

}, {
  timestamps: true
});

// Index pour optimiser les recherches
simulationSchema.index({ createdAt: -1 });
simulationSchema.index({ status: 1 });
simulationSchema.index({ 'user.email': 1 });
simulationSchema.index({ ville: 1 });
simulationSchema.index({ pays: 1 });

const Simulation = mongoose.model('Simulation', simulationSchema);

export default Simulation;

