import mongoose from 'mongoose';

const pageViewSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  title: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // en secondes
    default: 0
  }
}, { _id: false });

const analyticsSessionSchema = new mongoose.Schema({
  // Identificateur unique de session (généré côté frontend)
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Identificateur utilisateur (optionnel, pour tracking multi-sessions)
  userId: {
    type: String,
    index: true
  },

  // Informations de navigation
  landingPage: {
    type: String,
    required: true
  },
  referrer: {
    type: String,
    default: '(direct)'
  },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  utmTerm: String,
  utmContent: String,

  // Informations appareil et navigateur
  device: {
    type: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet'],
      default: 'desktop'
    },
    vendor: String,
    model: String,
    os: String,
    osVersion: String,
    browser: String,
    browserVersion: String
  },

  // Informations géographiques
  location: {
    country: String,
    countryCode: String,
    region: String,
    city: String,
    timezone: String,
    language: String
  },

  // Informations réseau
  network: {
    ip: String,
    isp: String
  },

  // Écran
  screen: {
    width: Number,
    height: Number,
    colorDepth: Number
  },

  // Pages visitées
  pageViews: [pageViewSchema],

  // Événements personnalisés
  events: [{
    name: String,
    category: String,
    label: String,
    value: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Statistiques de session
  stats: {
    totalPageViews: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number, // en secondes
      default: 0
    },
    bounceRate: {
      type: Boolean,
      default: true // true si une seule page visitée
    }
  },

  // Dates
  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,

  // Session active ou terminée
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Index composites pour requêtes performantes
analyticsSessionSchema.index({ startedAt: -1 });
analyticsSessionSchema.index({ 'location.country': 1, startedAt: -1 });
analyticsSessionSchema.index({ 'device.type': 1, startedAt: -1 });
analyticsSessionSchema.index({ referrer: 1, startedAt: -1 });
analyticsSessionSchema.index({ isActive: 1, lastActivityAt: 1 });

// Méthode pour ajouter une page vue
analyticsSessionSchema.methods.addPageView = function(pageData) {
  this.pageViews.push(pageData);
  this.stats.totalPageViews = this.pageViews.length;
  this.stats.bounceRate = this.pageViews.length === 1;
  this.lastActivityAt = new Date();
  return this.save();
};

// Méthode pour ajouter un événement
analyticsSessionSchema.methods.addEvent = function(eventData) {
  this.events.push(eventData);
  this.lastActivityAt = new Date();
  return this.save();
};

// Méthode pour terminer une session
analyticsSessionSchema.methods.endSession = function() {
  this.isActive = false;
  this.endedAt = new Date();
  
  // Calculer le temps total passé
  this.stats.totalTimeSpent = this.pageViews.reduce((total, page) => total + (page.timeSpent || 0), 0);
  
  return this.save();
};

// Méthode statique pour nettoyer les vieilles sessions
// 🔥 AVEC HEARTBEAT : Session morte si pas de ping depuis 3 minutes
analyticsSessionSchema.statics.cleanupInactiveSessions = async function() {
  // 3 minutes = 180 secondes (2x le délai du heartbeat de 60s + marge)
  const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
  
  const result = await this.updateMany(
    {
      isActive: true,
      lastActivityAt: { $lt: threeMinutesAgo }
    },
    {
      $set: {
        isActive: false,
        endedAt: new Date()
      }
    }
  );
  
  console.log(`[Analytics] Cleanup: ${result.modifiedCount} sessions inactives fermées`);
  
  return result;
};

const AnalyticsSession = mongoose.model('AnalyticsSession', analyticsSessionSchema);

export default AnalyticsSession;

