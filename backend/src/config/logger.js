import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Niveau de log par défaut (peut être changé dynamiquement)
let currentLogLevel = process.env.LOG_LEVEL || 'info';

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, module, ...meta }) => {
    const moduleStr = module ? `[${module}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase().padEnd(5)}] ${moduleStr} ${message} ${metaStr}`.trim();
  })
);

// Transport pour fichiers avec rotation quotidienne
const fileRotateTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'app-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d', // Garder 14 jours
  maxSize: '20m', // Max 20MB par fichier
  format: customFormat,
  level: currentLogLevel
});

// Transport pour la console (développement)
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    customFormat
  ),
  level: currentLogLevel
});

// Créer le logger
const logger = winston.createLogger({
  level: currentLogLevel,
  transports: [
    fileRotateTransport,
    consoleTransport
  ],
  exitOnError: false
});

// Fonction pour changer le niveau de log dynamiquement
export const setLogLevel = (level) => {
  const validLevels = ['error', 'warn', 'info', 'debug'];
  if (!validLevels.includes(level)) {
    logger.warn(`Niveau de log invalide: ${level}. Utilisation du niveau actuel: ${currentLogLevel}`);
    return false;
  }
  
  currentLogLevel = level;
  logger.level = level;
  fileRotateTransport.level = level;
  consoleTransport.level = level;
  
  logger.info(`Niveau de log changé: ${level.toUpperCase()}`, { module: 'Logger' });
  return true;
};

// Fonction pour obtenir le niveau actuel
export const getLogLevel = () => currentLogLevel;

// Fonction pour obtenir la liste des fichiers de logs
export const getLogFiles = () => {
  try {
    const files = fs.readdirSync(logsDir)
      .filter(file => file.startsWith('app-') && file.endsWith('.log'))
      .map(file => {
        const stats = fs.statSync(path.join(logsDir, file));
        return {
          name: file,
          path: path.join(logsDir, file),
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.modified - a.modified); // Plus récent en premier
    
    return files;
  } catch (error) {
    logger.error('Erreur lors de la récupération des fichiers de logs', { module: 'Logger', error: error.message });
    return [];
  }
};

// Fonction pour lire un fichier de log
export const readLogFile = (filename, lines = 1000) => {
  try {
    const filePath = path.join(logsDir, filename);
    
    // Vérifier que le fichier existe et est dans le dossier logs
    if (!fs.existsSync(filePath) || !filePath.startsWith(logsDir)) {
      return null;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const allLines = content.split('\n').filter(line => line.trim());
    
    // Retourner les N dernières lignes
    return allLines.slice(-lines).reverse(); // Plus récent en premier
  } catch (error) {
    logger.error(`Erreur lors de la lecture du fichier ${filename}`, { module: 'Logger', error: error.message });
    return null;
  }
};

// Fonction pour supprimer un fichier de log
export const deleteLogFile = (filename) => {
  try {
    const filePath = path.join(logsDir, filename);
    
    // Vérifier que le fichier existe et est dans le dossier logs
    if (!fs.existsSync(filePath) || !filePath.startsWith(logsDir)) {
      return false;
    }
    
    // Ne pas supprimer le fichier du jour
    const today = new Date().toISOString().split('T')[0];
    if (filename.includes(today)) {
      logger.warn(`Tentative de suppression du fichier du jour: ${filename}`, { module: 'Logger' });
      return false;
    }
    
    fs.unlinkSync(filePath);
    logger.info(`Fichier de log supprimé: ${filename}`, { module: 'Logger' });
    return true;
  } catch (error) {
    logger.error(`Erreur lors de la suppression du fichier ${filename}`, { module: 'Logger', error: error.message });
    return false;
  }
};

// Fonction pour capturer et stocker les erreurs critiques en DB (non-bloquante)
const captureCriticalError = (message, meta = {}) => {
  // Exécuter de manière asynchrone sans bloquer
  (async () => {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const ErrorLog = (await import('../models/ErrorLog.js')).default;
      const { sendErrorAlertEmail } = await import('./errorAlerts.js');
      
      const errorData = {
        source: 'backend',
        level: 'error',
        message: typeof message === 'string' ? message : message.toString(),
        stack: meta.stack || '',
        module: meta.module || 'Unknown',
        endpoint: meta.endpoint || '',
        method: meta.method || '',
        metadata: {
          userAgent: meta.userAgent,
          ip: meta.ip,
          referrer: meta.referrer
        },
        data: meta.data || {}
      };
      
      const errorLog = await ErrorLog.findOrCreateSimilar(errorData);
      
      // Vérifier si on doit envoyer une alerte email
      if (errorLog.count === 1 || (errorLog.count % 10 === 0)) {
        await sendErrorAlertEmail(errorLog);
        errorLog.alertSent = true;
        errorLog.alertSentAt = new Date();
        await errorLog.save();
      }
    } catch (err) {
      // Ne pas bloquer si l'enregistrement échoue
      console.error('Erreur lors de la capture de l\'erreur critique:', err);
    }
  })();
};

// Wrapper pour ajouter le module automatiquement
export const createModuleLogger = (moduleName) => {
  return {
    error: (message, meta = {}) => {
      logger.error(message, { module: moduleName, ...meta });
      // Capturer les erreurs critiques en DB (de manière asynchrone, ne bloque pas)
      captureCriticalError(message, { module: moduleName, ...meta });
    },
    warn: (message, meta = {}) => logger.warn(message, { module: moduleName, ...meta }),
    info: (message, meta = {}) => logger.info(message, { module: moduleName, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { module: moduleName, ...meta })
  };
};

export default logger;

