import express from 'express';
import {
  saveSimulation,
  getAllSimulations,
  getSimulationById,
  updateSimulationStatus,
  deleteSimulation,
  getSimulationStats
} from './simulationsController.js';

const router = express.Router();

// Routes publiques
router.post('/save', saveSimulation);

// Routes admin
router.get('/all', getAllSimulations);
router.get('/stats', getSimulationStats);
router.get('/:id', getSimulationById);
router.put('/:id/status', updateSimulationStatus);
router.delete('/:id', deleteSimulation);

export default router;

