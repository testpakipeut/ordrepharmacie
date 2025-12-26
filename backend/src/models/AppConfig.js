import mongoose from 'mongoose';

const appConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['logLevel', 'maintenance', 'features']
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour recherche rapide
appConfigSchema.index({ key: 1 });

// Méthode statique pour obtenir une valeur de config
appConfigSchema.statics.get = async function(key, defaultValue = null) {
  try {
    const config = await this.findOne({ key });
    return config ? config.value : defaultValue;
  } catch (error) {
    console.error(`Erreur lecture config ${key}:`, error);
    return defaultValue;
  }
};

// Méthode statique pour définir une valeur de config
appConfigSchema.statics.set = async function(key, value, description = '') {
  try {
    const config = await this.findOneAndUpdate(
      { key },
      { value, description, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return config;
  } catch (error) {
    console.error(`Erreur écriture config ${key}:`, error);
    throw error;
  }
};

const AppConfig = mongoose.model('AppConfig', appConfigSchema);

export default AppConfig;

