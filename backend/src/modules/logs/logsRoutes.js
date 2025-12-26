import express from 'express';
import {
  getCurrentLogLevel,
  changeLogLevel,
  getLogFilesList,
  getLogContent,
  downloadLogFile,
  removeLogFile,
  clearOldLogs
} from './logsController.js';

const router = express.Router();

// Obtenir le niveau de log actuel
router.get('/level', getCurrentLogLevel);

// Changer le niveau de log
router.post('/level', changeLogLevel);

// Obtenir la liste des fichiers de logs
router.get('/files', getLogFilesList);

// Lire le contenu d'un fichier de log
router.get('/files/:filename', getLogContent);

// Télécharger un fichier de log
router.get('/files/:filename/download', downloadLogFile);

// Supprimer un fichier de log
router.delete('/files/:filename', removeLogFile);

// Supprimer tous les anciens logs
router.post('/clear', clearOldLogs);

export default router;

