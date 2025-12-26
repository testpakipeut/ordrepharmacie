import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'],
    default: 'CDI'
  },
  localisation: {
    type: String,
    required: true,
    default: 'Libreville, Gabon'
  },
  departement: {
    type: String,
    required: true,
    enum: [
      'Pôle Énergie',
      'Pôle Traitement de Données Géospatiales',
      'ODS - Services Drones',
      'Pôle Sécurité Numérique',
      'Pôle Santé',
      'Direction Générale',
      'Ressources Humaines',
      'Administration'
    ]
  },
  description: {
    type: String,
    required: true
  },
  competences: [{
    type: String,
    required: true
  }],
  experience: {
    type: String,
    required: true,
    default: '0-2 ans'
  },
  missions: [{
    type: String
  }],
  profil: {
    type: String
  },
  salaire: {
    min: Number,
    max: Number,
    devise: {
      type: String,
      default: 'FCFA'
    },
    afficher: {
      type: Boolean,
      default: false
    }
  },
  avantages: [{
    type: String
  }],
  actif: {
    type: Boolean,
    default: true
  },
  datePublication: {
    type: Date,
    default: Date.now
  },
  dateExpiration: {
    type: Date
  },
  priorite: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index pour recherche et tri
jobSchema.index({ actif: 1, priorite: -1, datePublication: -1 });
jobSchema.index({ departement: 1, actif: 1 });
jobSchema.index({ type: 1, actif: 1 });

// Méthode pour vérifier si l'offre est toujours valide
jobSchema.methods.estValide = function() {
  if (!this.actif) return false;
  const now = new Date();
  // L'offre doit être publiée (datePublication <= maintenant)
  if (this.datePublication && this.datePublication > now) return false;
  // L'offre ne doit pas être expirée
  if (this.dateExpiration && this.dateExpiration < now) return false;
  return true;
};

// Static method pour obtenir les offres actives
jobSchema.statics.getOffresActives = function(filters = {}) {
  const now = new Date();
  
  // Construction de la requête avec $and pour combiner toutes les conditions
  const conditions = [
    { actif: true },
    // L'offre doit être publiée (datePublication <= maintenant, ou non définie/null = toujours visible)
    {
      $or: [
        { datePublication: { $lte: now } },
        { datePublication: { $exists: false } },
        { datePublication: null }
      ]
    },
    // L'offre ne doit pas être expirée
    {
      $or: [
        { dateExpiration: { $exists: false } },
        { dateExpiration: null },
        { dateExpiration: { $gte: now } }
      ]
    }
  ];
  
  const query = { $and: conditions };

  if (filters.departement) {
    query.departement = filters.departement;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  return this.find(query).sort({ priorite: -1, datePublication: -1 });
};

const Job = mongoose.model('Job', jobSchema);

export default Job;

