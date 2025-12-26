import express from 'express';
import { body } from 'express-validator';
import upload from '../../config/multer.js';
import { 
  submitQuote,
  getAllQuotes,
  getQuoteById,
  updateQuoteStatus,
  getQuoteStats
} from './quotesController.js';

const router = express.Router();

// Validation middleware
const submitQuoteValidation = [
  body('fullName')
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
    .trim()
    .notEmpty()
    .withMessage('Le téléphone est requis'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('La ville est requise'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Le pays est requis'),
  body('projectDescription')
    .trim()
    .notEmpty()
    .withMessage('La description du projet est requise')
    .isLength({ min: 20, max: 3000 })
    .withMessage('La description doit contenir entre 20 et 3000 caractères'),
  body('privacyConsent')
    .equals('true')
    .withMessage('Vous devez accepter la politique de confidentialité')
];

// Routes publiques
router.post('/submit', upload.array('files', 5), submitQuoteValidation, submitQuote);

// Routes admin (à protéger avec authentification en production)
router.get('/all', getAllQuotes);
router.get('/:id', getQuoteById);
router.patch('/:id/status', updateQuoteStatus);
router.get('/stats/overview', getQuoteStats);

export default router;

