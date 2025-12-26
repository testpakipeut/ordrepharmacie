import mongoose from 'mongoose';

const partnershipSchema = new mongoose.Schema({
  entreprise: {
    type: String,
    required: true,
    trim: true
  },
  nom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  telephone: {
    type: String,
    required: true,
    trim: true
  },
  typePartenariat: {
    type: String,
    required: true,
    enum: ['distributeur', 'fournisseur', 'ong', 'technologique', 'autre']
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['nouveau', 'en_cours', 'accepte', 'refuse'],
    default: 'nouveau'
  },
  metadata: {
    userAgent: String,
    ip: String,
    referrer: String
  }
}, {
  timestamps: true
});

// Index pour les recherches
partnershipSchema.index({ email: 1 });
partnershipSchema.index({ status: 1 });
partnershipSchema.index({ createdAt: -1 });

const Partnership = mongoose.model('Partnership', partnershipSchema);

export default Partnership;

