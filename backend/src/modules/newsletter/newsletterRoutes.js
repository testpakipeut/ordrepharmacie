import express from 'express';
import { body } from 'express-validator';
import { 
  subscribeNewsletter, 
  unsubscribeNewsletter,
  getNewsletterStats 
} from './newsletterController.js';

const router = express.Router();

// Validation middleware
const subscribeValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .escape()
];

const unsubscribeValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail()
];

// Routes publiques
router.post('/subscribe', subscribeValidation, subscribeNewsletter);
router.post('/unsubscribe', unsubscribeValidation, unsubscribeNewsletter);

// Route pour les statistiques (à protéger en production avec authentification)
router.get('/stats', getNewsletterStats);

export default router;

