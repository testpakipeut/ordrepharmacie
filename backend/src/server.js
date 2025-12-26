import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import newsletterRoutes from './modules/newsletter/newsletterRoutes.js';
import contactRoutes from './modules/contact/contactRoutes.js';
import quotesRoutes from './modules/quotes/quotesRoutes.js';
import jobsRoutes from './modules/jobs/jobsRoutes.js';
import applicationsRoutes from './modules/applications/applicationsRoutes.js';
import projectsRoutes from './modules/projects/projectsRoutes.js';
import articlesRoutes from './modules/articles/articlesRoutes.js';
import ideaBlocksRoutes from './modules/ideaBlocks/ideaBlocksRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import uploadRoutes from './modules/upload/uploadRoutes.js';
import analyticsRoutes from './modules/analytics/analyticsRoutes.js';
import simulationsRoutes from './modules/simulations/simulationsRoutes.js';
import logsRoutes from './modules/logs/logsRoutes.js';
import errorsRoutes from './modules/errors/errorsRoutes.js';
import partnershipRoutes from './modules/partnerships/partnershipRoutes.js';
import chatbotRoutes from './modules/chatbot/chatbotRoutes.js';
import seoRoutes from './modules/seo/seoRoutes.js';
import logger from './config/logger.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à MongoDB
connectDB();

// Initialiser le logger
logger.info('🚀 Démarrage du serveur CIPS Backend', { module: 'Server' });

// Middleware de sécurité avec configuration CSP pour Google Maps et Google Fonts
// Configuration différente selon l'environnement
const isProduction = process.env.NODE_ENV === 'production';

const cspDirectives = isProduction ? {
  // PRODUCTION : CSP permissive pour images (autorise toutes les sources d'images)
  defaultSrc: ["'self'"],
  frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com"],
  scriptSrc: [
    "'self'",
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
    // Nonces pour scripts inline (à implémenter si nécessaire)
  ],
  styleSrc: [
    "'self'",
    "https://fonts.googleapis.com",
    "https://maps.googleapis.com",
    "https://ray.st",
    // Nonces pour styles inline (à implémenter si nécessaire)
  ],
  fontSrc: ["'self'", "https://fonts.gstatic.com", "https://ray.st"],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "*", // Autorise toutes les images de tous les domaines (Cloudinary, Unsplash, etc.)
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://res.cloudinary.com",
    "https://*.cloudinary.com",
    "https://images.unsplash.com",
    "https://*.unsplash.com"
  ],
  connectSrc: [
    "'self'",
    "https://maps.googleapis.com",
    "https://*.railway.app",
    "https://*.up.railway.app",
    "https://api.cloudinary.com",
    "https://*.cloudinary.com"
  ]
} : {
  // DÉVELOPPEMENT : CSP permissive (nécessaire pour Vite)
  defaultSrc: ["'self'"],
  frameSrc: ["'self'", "https://www.google.com", "https://maps.google.com"],
  scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
  styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://maps.googleapis.com", "https://ray.st"],
  fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://ray.st"],
  imgSrc: [
    "'self'",
    "data:",
    "blob:",
    "*", // Autorise toutes les images en développement aussi
    "https://maps.googleapis.com",
    "https://maps.gstatic.com",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://res.cloudinary.com",
    "https://images.unsplash.com"
  ],
  connectSrc: ["'self'", "https://maps.googleapis.com", "http://localhost:3001", "https://*.railway.app", "https://*.up.railway.app"]
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...cspDirectives
    }
  }
}));

// Rate limiting (seulement en production)
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limite chaque IP à 100 requêtes par windowMs
  });
  app.use('/api/', limiter);
  logger.info('🔒 Rate limiting activé (production)', { module: 'Server' });
} else {
  logger.info('🔓 Rate limiting désactivé (développement)', { module: 'Server' });
}

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API CIPS fonctionnelle' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/quotes', quotesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/idea-blocks', ideaBlocksRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/simulations', simulationsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/errors', errorsRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/', seoRoutes); // Sitemap à la racine (/sitemap.xml)

// Servir les fichiers statiques du frontend (en production)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath, {
  maxAge: '1y', // Cache 1 an pour les assets statiques
  etag: true,
  lastModified: true,
  immutable: true // Les fichiers avec hash dans le nom peuvent être mis en cache indéfiniment
}));

// Pour le routing côté client (React Router), servir index.html pour toutes les routes non-API
app.get('*', (req, res, next) => {
  // Ignorer les routes API
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Route non trouvée' });
  }
  // Servir index.html pour toutes les autres routes
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  logger.error('Erreur serveur interne', { 
    module: 'Server', 
    error: err.message, 
    stack: err.stack,
    endpoint: req.path,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent']
  });
  res.status(500).json({ error: 'Erreur serveur interne' });
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  logger.info(`🚀 Express running → On PORT : ${server.address().port}`, { module: 'Server' });
});

export default app;

