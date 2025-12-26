import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  // Informations de base
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est requise'],
    maxlength: [5000, 'La description ne peut pas dépasser 5000 caractères']
  },
  shortDescription: {
    type: String,
    required: [true, 'La description courte est requise'],
    maxlength: [300, 'La description courte ne peut pas dépasser 300 caractères']
  },
  
  // Pôle d'activité
  pole: {
    type: String,
    required: [true, 'Le pôle est requis'],
    enum: ['energie', 'geospatial', 'drone', 'sante', 'securite'],
  },
  
  // Médias
  mainImage: {
    type: String,
    required: [true, 'L\'image principale est requise']
  },
  images: [{
    url: String,
    caption: String
  }],
  videos: [{
    url: String,
    title: String,
    thumbnail: String
  }],
  
  // Comparaison avant/après
  beforeAfter: {
    before: {
      image: String,
      description: String
    },
    after: {
      image: String,
      description: String
    }
  },
  
  // Localisation
  location: {
    city: {
      type: String,
      required: [true, 'La ville est requise']
    },
    country: {
      type: String,
      default: 'Gabon'
    },
    coordinates: {
      lat: {
        type: Number,
        required: false
      },
      lng: {
        type: Number,
        required: false
      }
    }
  },
  
  // Client et témoignage
  client: {
    name: String,
    company: String,
    logo: String
  },
  testimonial: {
    text: String,
    author: String,
    position: String,
    photo: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Résultats et métriques
  results: [{
    metric: String,
    value: String,
    icon: String
  }],
  
  // Détails du projet
  duration: String, // Ex: "3 mois"
  budget: String, // Ex: "500 000 FCFA"
  team: String, // Ex: "5 ingénieurs"
  date: {
    type: Date,
    default: Date.now
  },
  
  // Dates de visibilité (calendrier éditorial)
  visibleFrom: {
    type: Date,
    default: Date.now
  },
  visibleUntil: {
    type: Date,
    default: null // null = toujours visible
  },
  
  // Cas d'usage détaillé
  caseStudy: {
    challenge: String, // Le défi
    solution: String, // La solution apportée
    impact: String // L'impact/résultat
  },
  
  // Statut
  status: {
    type: String,
    enum: ['termine', 'en_cours', 'pilote'],
    default: 'termine'
  },
  
  // Visibilité
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  },
  priorite: {
    type: Number,
    default: 0
  },
  
  // Tags
  tags: [String]
  
}, {
  timestamps: true
});

// Index pour recherche et filtrage
projectSchema.index({ pole: 1, status: 1, published: 1 });
projectSchema.index({ featured: -1, priorite: -1, date: -1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;

