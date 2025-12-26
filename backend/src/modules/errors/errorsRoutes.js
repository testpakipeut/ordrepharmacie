import express from 'express';
import {
  logFrontendError,
  getCriticalErrors,
  getErrorStats,
  updateErrorStatus,
  deleteError
} from './errorsController.js';

const router = express.Router();

// Recevoir une erreur frontend
router.post('/frontend', logFrontendError);

// Récupérer les erreurs critiques
router.get('/critical', getCriticalErrors);

// Obtenir les statistiques
router.get('/stats', getErrorStats);

// Mettre à jour le statut d'une erreur
router.patch('/:id/status', updateErrorStatus);

// Supprimer une erreur
router.delete('/:id', deleteError);

export default router;











