import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: false // Optionnel pour candidatures spontanées
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
  message: {
    type: String,
    required: true
  },
  cvPath: {
    type: String
  },
  statut: {
    type: String,
    enum: ['nouvelle', 'en_cours', 'acceptée', 'refusée', 'archivée'],
    default: 'nouvelle'
  },
  notes: {
    type: String
  },
  dateEntretien: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour recherche
applicationSchema.index({ jobId: 1, createdAt: -1 });
applicationSchema.index({ email: 1 });
applicationSchema.index({ statut: 1, createdAt: -1 });

// Populate automatique du job (si jobId existe)
applicationSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'jobId',
    select: 'titre departement type localisation'
  });
  next();
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;

