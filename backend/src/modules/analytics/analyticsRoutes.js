import express from 'express';
import { 
  getAnalyticsStats,
  trackSession,
  getDetailedAnalytics,
  cleanupSessions
} from './analyticsController.js';

const router = express.Router();

// Routes Google Analytics (existantes)
// GET /api/analytics/stats?period=30
router.get('/stats', getAnalyticsStats);

// Nouvelles routes - Analytics détaillées (notre système)
// POST /api/analytics/session - Tracker une session
router.post('/session', trackSession);

// GET /api/analytics/detailed?period=30 - Récupérer analytics détaillées
router.get('/detailed', getDetailedAnalytics);

// POST /api/analytics/cleanup - Nettoyer les sessions inactives
router.post('/cleanup', cleanupSessions);

export default router;

