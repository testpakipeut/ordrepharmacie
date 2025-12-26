import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'cips-secret-key-change-in-production-2024';

// Middleware pour vérifier le token JWT
export const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔐 [AUTH] Headers reçus:', req.headers.authorization);

    // Vérifier si le token est dans le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ [AUTH] Token extrait:', token ? 'Token présent' : 'Token vide');
    }

    if (!token) {
      console.log('❌ [AUTH] Pas de token - 401');
      return res.status(401).json({
        success: false,
        error: 'Non autorisé - Token manquant'
      });
    }

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [AUTH] Token décodé:', decoded.id);

      // Récupérer l'utilisateur (sans le mot de passe)
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        console.log('❌ [AUTH] Utilisateur non trouvé - 401');
        return res.status(401).json({
          success: false,
          error: 'Utilisateur non trouvé'
        });
      }

      if (!req.user.isActive) {
        console.log('❌ [AUTH] Compte désactivé - 401');
        return res.status(401).json({
          success: false,
          error: 'Compte désactivé'
        });
      }

      console.log('✅ [AUTH] Authentification réussie:', req.user.username);
      next();
    } catch (err) {
      console.log('❌ [AUTH] Erreur JWT:', err.message);
      return res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }
  } catch (error) {
    console.error('Erreur middleware auth:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur serveur'
    });
  }
};

// Middleware optionnel pour vérifier le token sans bloquer (ajoute req.user si token valide)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Vérifier si le token est dans le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        // Vérifier et décoder le token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Récupérer l'utilisateur (sans le mot de passe)
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token invalide, mais on continue quand même (pas d'erreur)
        // req.user restera undefined
      }
    }
    
    next();
  } catch (error) {
    // En cas d'erreur, on continue quand même
    next();
  }
};

// Middleware pour vérifier le rôle admin
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Accès refusé - Droits administrateur requis'
    });
  }
};

