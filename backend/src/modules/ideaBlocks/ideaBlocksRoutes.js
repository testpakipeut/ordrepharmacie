import express from 'express';
import {
  getAllIdeaBlocks,
  getIdeaBlockById,
  createIdeaBlock,
  updateIdeaBlock,
  deleteIdeaBlock,
  convertToArticle,
  ideaBlockValidation,
  idValidation
} from './ideaBlocksController.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Toutes les routes sont protégées (admin uniquement)
router.get('/', protect, getAllIdeaBlocks);
router.get('/:id', protect, idValidation, getIdeaBlockById);
router.post('/', protect, ideaBlockValidation, createIdeaBlock);
router.put('/:id', protect, [...idValidation, ...ideaBlockValidation], updateIdeaBlock);
router.delete('/:id', protect, idValidation, deleteIdeaBlock);
router.post('/:id/convert', protect, idValidation, convertToArticle);

export default router;












