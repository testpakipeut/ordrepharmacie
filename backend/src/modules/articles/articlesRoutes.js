import express from 'express';
import {
  getAllArticles,
  getArticleByIdOrSlug,
  getSimilarArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  articleValidation,
  idValidation
} from './articlesController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.get('/', getAllArticles);
router.get('/:identifier', getArticleByIdOrSlug);
router.get('/:identifier/similar', getSimilarArticles);

// Routes admin (protégées)
router.post('/', protect, articleValidation, createArticle);
// Pour PUT, on utilise une validation optionnelle pour permettre les mises à jour partielles (ex: juste le statut)
router.put('/:id', protect, idValidation, updateArticle);
router.delete('/:id', protect, idValidation, deleteArticle);

export default router;

