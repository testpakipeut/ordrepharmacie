import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  patchProject,
  deleteProject,
  projectValidation,
  idValidation
} from './projectsController.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllProjects);
router.get('/:id', idValidation, getProjectById);

// Routes admin (à protéger avec middleware d'authentification plus tard)
router.post('/', projectValidation, createProject);
router.put('/:id', [...idValidation, ...projectValidation], updateProject);
router.patch('/:id', idValidation, patchProject); // Route PATCH pour mises à jour partielles
router.delete('/:id', idValidation, deleteProject);

export default router;

