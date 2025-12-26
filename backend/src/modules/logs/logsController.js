import logger, { getLogLevel, setLogLevel, getLogFiles, readLogFile, deleteLogFile } from '../../config/logger.js';
import path from 'path';
import fs from 'fs';

// Obtenir le niveau de log actuel
export const getCurrentLogLevel = async (req, res) => {
  try {
    const level = getLogLevel();
    res.json({ success: true, level });
  } catch (error) {
    logger.error('Erreur lors de la récupération du niveau de log', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Changer le niveau de log
export const changeLogLevel = async (req, res) => {
  try {
    const { level } = req.body;
    
    if (!level) {
      return res.status(400).json({ success: false, message: 'Niveau de log manquant' });
    }
    
    const success = setLogLevel(level);
    
    if (success) {
      res.json({ success: true, message: `Niveau de log changé: ${level.toUpperCase()}`, level });
    } else {
      res.status(400).json({ success: false, message: 'Niveau de log invalide' });
    }
  } catch (error) {
    logger.error('Erreur lors du changement de niveau de log', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir la liste des fichiers de logs
export const getLogFilesList = async (req, res) => {
  try {
    const files = getLogFiles();
    res.json({ success: true, files });
  } catch (error) {
    logger.error('Erreur lors de la récupération des fichiers de logs', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Lire le contenu d'un fichier de log
export const getLogContent = async (req, res) => {
  try {
    const { filename } = req.params;
    const { lines = 1000, level, search } = req.query;
    
    const content = readLogFile(filename, parseInt(lines));
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }
    
    // Filtrer par niveau si spécifié
    let filteredContent = content;
    if (level && level !== 'all') {
      filteredContent = content.filter(line => line.includes(`[${level.toUpperCase()}`));
    }
    
    // Filtrer par recherche si spécifiée
    if (search) {
      filteredContent = filteredContent.filter(line => 
        line.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    res.json({ 
      success: true, 
      filename,
      totalLines: content.length,
      filteredLines: filteredContent.length,
      logs: filteredContent 
    });
  } catch (error) {
    logger.error('Erreur lors de la lecture du fichier de log', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Télécharger un fichier de log complet
export const downloadLogFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const files = getLogFiles();
    const file = files.find(f => f.name === filename);
    
    if (!file || !fs.existsSync(file.path)) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }
    
    logger.info(`Téléchargement du fichier de log: ${filename}`, { module: 'LogsController' });
    
    res.download(file.path, filename);
  } catch (error) {
    logger.error('Erreur lors du téléchargement du fichier de log', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Supprimer un fichier de log
export const removeLogFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    const success = deleteLogFile(filename);
    
    if (success) {
      res.json({ success: true, message: `Fichier supprimé: ${filename}` });
    } else {
      res.status(400).json({ success: false, message: 'Impossible de supprimer ce fichier' });
    }
  } catch (error) {
    logger.error('Erreur lors de la suppression du fichier de log', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Supprimer tous les anciens fichiers de logs (sauf aujourd'hui)
export const clearOldLogs = async (req, res) => {
  try {
    const files = getLogFiles();
    const today = new Date().toISOString().split('T')[0];
    
    let deletedCount = 0;
    
    for (const file of files) {
      if (!file.name.includes(today)) {
        const success = deleteLogFile(file.name);
        if (success) deletedCount++;
      }
    }
    
    logger.info(`${deletedCount} fichiers de logs supprimés`, { module: 'LogsController' });
    res.json({ success: true, message: `${deletedCount} fichier(s) supprimé(s)`, deletedCount });
  } catch (error) {
    logger.error('Erreur lors du nettoyage des logs', { module: 'LogsController', error: error.message });
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

