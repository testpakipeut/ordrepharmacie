import express from 'express';
import * as jobsController from './jobsController.js';
import { protect, optionalAuth } from '../../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', jobsController.getAllJobs);
router.get('/stats', jobsController.getJobStats);
// Route pour récupérer un job : publique mais avec auth optionnelle pour permettre aux admins d'accéder aux jobs inactifs
router.get('/:id', optionalAuth, jobsController.getJobById);

// Routes admin (protégées)
router.post('/', protect, jobsController.createJob);
router.put('/:id', protect, jobsController.updateJob);
router.patch('/:id/deactivate', protect, jobsController.deactivateJob);
router.delete('/:id', protect, jobsController.deleteJob);

export default router;

