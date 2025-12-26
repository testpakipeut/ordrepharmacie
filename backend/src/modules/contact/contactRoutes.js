import express from 'express';
import { body } from 'express-validator';
import { 
  sendMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  respondToMessage,
  getContactStats
} from './contactController.js';

const router = express.Router();

// Validation middleware pour l'envoi de message
const sendMessageValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Le sujet est requis')
    .isLength({ min: 2, max: 200 })
    .withMessage('Le sujet doit contenir entre 2 et 200 caractères'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Le message doit contenir entre 10 et 2000 caractères')
];

// Routes publiques
router.post('/send', sendMessageValidation, sendMessage);

// Routes pour l'administration (à protéger avec authentification en production)
router.get('/messages', getAllMessages);
router.get('/messages/:id', getMessageById);
router.patch('/messages/:id/status', updateMessageStatus);
router.post('/messages/:id/respond', respondToMessage);
router.get('/stats', getContactStats);

export default router;

