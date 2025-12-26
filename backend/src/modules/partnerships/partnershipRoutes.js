import express from 'express';
import { body } from 'express-validator';
import {
  submitPartnership,
  getAllPartnerships,
  updatePartnershipStatus,
  deletePartnership
} from './partnershipController.js';

const router = express.Router();

// Validation rules pour une demande de partenariat
const partnershipValidation = [
  body('entreprise')
    .trim()
    .notEmpty()
    .withMessage('Le nom de l\'entreprise est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de l\'entreprise doit contenir entre 2 et 100 caractères'),
  
  body('nom')
    .trim()
    .notEmpty()
    .withMessage('Votre nom est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('L\'email est requis')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  
  body('telephone')
    .trim()
    .notEmpty()
    .withMessage('Le numéro de téléphone est requis')
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/)
    .withMessage('Numéro de téléphone invalide'),
  
  body('typePartenariat')
    .trim()
    .notEmpty()
    .withMessage('Le type de partenariat est requis')
    .isIn(['distributeur', 'fournisseur', 'ong', 'technologique', 'autre'])
    .withMessage('Type de partenariat invalide'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Le message est requis')
    .isLength({ min: 20, max: 2000 })
    .withMessage('Le message doit contenir entre 20 et 2000 caractères')
];

// Route publique pour soumettre une demande de partenariat
router.post('/submit', partnershipValidation, submitPartnership);

// Routes admin (à protéger avec middleware d'authentification)
router.get('/all', getAllPartnerships);
router.put('/:id/status', updatePartnershipStatus);
router.delete('/:id', deletePartnership);

export default router;

