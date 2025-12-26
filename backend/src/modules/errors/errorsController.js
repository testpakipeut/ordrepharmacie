import ErrorLog from '../../models/ErrorLog.js';
import { createModuleLogger } from '../../config/logger.js';
import { sendErrorAlertEmail } from '../../config/errorAlerts.js';

const logger = createModuleLogger('Errors');

// Recevoir une erreur frontend
export const logFrontendError = async (req, res) => {
  try {
    const { message, stack, module, url, metadata, data, level = 'error' } = req.body;
    
    // Valider que c'est une erreur critique
    if (level !== 'error') {
      return res.status(400).json({ 
        success: false, 
        message: 'Seules les erreurs critiques (error) sont acceptées' 
      });
    }
    
    // Créer ou mettre à jour l'erreur
    const errorData = {
      source: 'frontend',
      level: 'error',
      message: message || 'Erreur inconnue',
      stack: stack || '',
      module: module || 'Unknown',
      url: url || req.headers.referer || 'Unknown',
      metadata: {
        userAgent: metadata?.userAgent || req.headers['user-agent'],
        ip: metadata?.ip || req.ip || req.connection.remoteAddress,
        referrer: metadata?.referrer || req.headers.referer,
        userId: metadata?.userId,
        sessionId: metadata?.sessionId,
        browser: metadata?.browser,
        os: metadata?.os,
        device: metadata?.device
      },
      data: data || {}
    };
    
    const errorLog = await ErrorLog.findOrCreateSimilar(errorData);
    
    // Logger dans Winston aussi
    logger.error(`[FRONTEND] ${message}`, {
      module: errorData.module,
      url: errorData.url,
      errorId: errorLog._id,
      count: errorLog.count
    });
    
    // Vérifier si on doit envoyer une alerte email
    if (errorLog.count === 1 || (errorLog.count % 10 === 0)) {
      // Envoyer une alerte pour la première occurrence ou tous les 10
      await sendErrorAlertEmail(errorLog);
      errorLog.alertSent = true;
      errorLog.alertSentAt = new Date();
      await errorLog.save();
    }
    
    res.json({ 
      success: true, 
      message: 'Erreur enregistrée',
      errorId: errorLog._id
    });
    
  } catch (error) {
    logger.error('Erreur lors de l\'enregistrement de l\'erreur frontend', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Récupérer les erreurs critiques
export const getCriticalErrors = async (req, res) => {
  try {
    const { 
      source, 
      status, 
      limit = 50, 
      skip = 0,
      startDate,
      endDate
    } = req.query;
    
    const query = {
      level: 'error' // Seulement les erreurs critiques
    };
    
    if (source) query.source = source;
    if (status) query.status = status;
    
    // Filtre par date
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const errors = await ErrorLog.find(query)
      .sort({ lastOccurredAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();
    
    const total = await ErrorLog.countDocuments(query);
    
    res.json({
      success: true,
      errors,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
    
  } catch (error) {
    logger.error('Erreur lors de la récupération des erreurs critiques', {
      error: error.message
    });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Obtenir les statistiques des erreurs
export const getErrorStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Statistiques par source
    const bySource = await ErrorLog.aggregate([
      {
        $match: {
          level: 'error',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: '$count' },
          uniqueErrors: { $sum: 1 }
        }
      }
    ]);
    
    // Statistiques par jour
    const byDay = await ErrorLog.aggregate([
      {
        $match: {
          level: 'error',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: '$count' },
          uniqueErrors: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Statistiques par module
    const byModule = await ErrorLog.aggregate([
      {
        $match: {
          level: 'error',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$module',
          count: { $sum: '$count' },
          uniqueErrors: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Total d'erreurs non résolues
    const unresolved = await ErrorLog.countDocuments({
      level: 'error',
      status: { $ne: 'resolved' }
    });
    
    res.json({
      success: true,
      stats: {
        bySource,
        byDay,
        byModule,
        unresolved,
        total: await ErrorLog.countDocuments({
          level: 'error',
          createdAt: { $gte: startDate }
        })
      }
    });
    
  } catch (error) {
    logger.error('Erreur lors de la récupération des statistiques', {
      error: error.message
    });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Mettre à jour le statut d'une erreur
export const updateErrorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'investigating', 'resolved', 'ignored'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }
    
    const errorLog = await ErrorLog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!errorLog) {
      return res.status(404).json({
        success: false,
        message: 'Erreur non trouvée'
      });
    }
    
    logger.info(`Statut de l'erreur ${id} changé: ${status}`, {
      errorId: id,
      status
    });
    
    res.json({
      success: true,
      message: 'Statut mis à jour',
      error: errorLog
    });
    
  } catch (error) {
    logger.error('Erreur lors de la mise à jour du statut', {
      error: error.message
    });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Supprimer une erreur
export const deleteError = async (req, res) => {
  try {
    const { id } = req.params;
    
    const errorLog = await ErrorLog.findByIdAndDelete(id);
    
    if (!errorLog) {
      return res.status(404).json({
        success: false,
        message: 'Erreur non trouvée'
      });
    }
    
    logger.info(`Erreur ${id} supprimée`, { errorId: id });
    
    res.json({
      success: true,
      message: 'Erreur supprimée'
    });
    
  } catch (error) {
    logger.error('Erreur lors de la suppression', {
      error: error.message
    });
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};











