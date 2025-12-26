import express from 'express';
import {
  login,
  verifyToken,
  changePassword,
  createUser,
  getAllUsers,
  deleteUser,
  loginValidation,
  changePasswordValidation,
  createUserValidation
} from './authController.js';
import { protect, adminOnly } from '../../middleware/auth.js';

const router = express.Router();

// Routes publiques
router.post('/login', loginValidation, login);
router.post('/register', protect, adminOnly, createUserValidation, createUser);

// Routes protégées
router.get('/verify', protect, verifyToken);
router.post('/change-password', protect, changePasswordValidation, changePassword);

// Routes admin uniquement
router.get('/users', protect, adminOnly, getAllUsers);
router.delete('/users/:id', protect, adminOnly, deleteUser);

export default router;

