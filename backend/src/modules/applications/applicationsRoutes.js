import express from 'express';
import * as applicationsController from './applicationsController.js';
import uploadCV from '../../config/multerCV.js';

const router = express.Router();

// Route publique (avec upload de CV)
router.post('/', uploadCV.single('cv'), applicationsController.submitApplication);

// Routes admin (à protéger avec middleware d'authentification plus tard)
router.get('/', applicationsController.getAllApplications);
router.get('/stats', applicationsController.getApplicationStats);
router.get('/:id', applicationsController.getApplicationById);
router.patch('/:id/status', applicationsController.updateApplicationStatus);
router.delete('/:id', applicationsController.deleteApplication);

export default router;

