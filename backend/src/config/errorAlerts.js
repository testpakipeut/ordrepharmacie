import nodemailer from 'nodemailer';
import { createModuleLogger } from './logger.js';
import ErrorLog from '../models/ErrorLog.js';

const logger = createModuleLogger('ErrorAlerts');

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Vérifier si on peut envoyer une alerte (anti-spam)
const canSendAlert = async (errorLog) => {
  // Vérifier si une alerte a été envoyée récemment (dans la dernière heure)
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  
  // Chercher des erreurs similaires avec alerte envoyée récemment
  const recentAlert = await ErrorLog.findOne({
    errorHash: errorLog.errorHash,
    alertSent: true,
    alertSentAt: { $gte: oneHourAgo }
  });
  
  return !recentAlert;
};

// Envoyer une alerte email pour une erreur critique
export const sendErrorAlertEmail = async (errorLog) => {
  try {
    // Vérifier si on peut envoyer l'alerte (anti-spam)
    const canSend = await canSendAlert(errorLog);
    
    if (!canSend) {
      logger.info(`Alerte non envoyée pour ${errorLog._id} (déjà envoyée récemment)`, {
        errorId: errorLog._id
      });
      return false;
    }
    
    // Vérifier que l'email est configuré
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      logger.warn('Configuration email manquante, alerte non envoyée', {
        errorId: errorLog._id
      });
      return false;
    }
    
    const transporter = createTransporter();
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
    
    // Préparer le contenu de l'email
    const sourceLabel = errorLog.source === 'frontend' ? 'Frontend' : 'Backend';
    const moduleLabel = errorLog.module || 'Inconnu';
    const countLabel = errorLog.count > 1 ? ` (${errorLog.count} occurrences)` : '';
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 700px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .error-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .critical-box { background: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 4px; }
          .info-row { margin: 12px 0; font-size: 14px; }
          .info-label { font-weight: bold; color: #002f6c; display: inline-block; width: 150px; }
          .stack-trace { background: #f8f9fa; padding: 15px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word; max-height: 300px; overflow-y: auto; }
          .button { display: inline-block; padding: 12px 24px; background: #002f6c; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Alerte - Erreur Critique Détectée</h1>
          </div>
          <div class="content">
            <div class="critical-box">
              <h2 style="margin-top: 0; color: #dc3545;">Erreur Critique${countLabel}</h2>
              <p style="font-size: 16px; margin: 10px 0;"><strong>${errorLog.message}</strong></p>
            </div>
            
            <div class="error-box">
              <h3 style="margin-top: 0;">📋 Détails de l'erreur</h3>
              <div class="info-row">
                <span class="info-label">Source:</span>
                <span>${sourceLabel}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Module:</span>
                <span>${moduleLabel}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span>${new Date(errorLog.lastOccurredAt).toLocaleString('fr-FR')}</span>
              </div>
              ${errorLog.url ? `
              <div class="info-row">
                <span class="info-label">URL:</span>
                <span>${errorLog.url}</span>
              </div>
              ` : ''}
              ${errorLog.endpoint ? `
              <div class="info-row">
                <span class="info-label">Endpoint:</span>
                <span>${errorLog.method || ''} ${errorLog.endpoint}</span>
              </div>
              ` : ''}
              <div class="info-row">
                <span class="info-label">Occurrences:</span>
                <span>${errorLog.count}</span>
              </div>
            </div>
            
            ${errorLog.stack ? `
            <div style="margin: 20px 0;">
              <h3>🔍 Stack Trace</h3>
              <div class="stack-trace">${errorLog.stack}</div>
            </div>
            ` : ''}
            
            ${errorLog.metadata ? `
            <div class="error-box">
              <h3 style="margin-top: 0;">👤 Informations utilisateur</h3>
              ${errorLog.metadata.userAgent ? `
              <div class="info-row">
                <span class="info-label">User Agent:</span>
                <span>${errorLog.metadata.userAgent}</span>
              </div>
              ` : ''}
              ${errorLog.metadata.ip ? `
              <div class="info-row">
                <span class="info-label">IP:</span>
                <span>${errorLog.metadata.ip}</span>
              </div>
              ` : ''}
              ${errorLog.metadata.browser ? `
              <div class="info-row">
                <span class="info-label">Navigateur:</span>
                <span>${errorLog.metadata.browser}</span>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/logs" class="button">
                Voir dans l'admin
              </a>
            </div>
          </div>
          <div class="footer">
            <p>Cette alerte a été générée automatiquement par le système de monitoring CIPS</p>
            <p>ID de l'erreur: ${errorLog._id}</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"CIPS Monitoring" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🚨 [CIPS] Erreur Critique - ${moduleLabel}${countLabel}`,
      html: htmlContent,
      text: `
        Alerte - Erreur Critique Détectée
        
        Message: ${errorLog.message}
        Source: ${sourceLabel}
        Module: ${moduleLabel}
        Date: ${new Date(errorLog.lastOccurredAt).toLocaleString('fr-FR')}
        Occurrences: ${errorLog.count}
        
        ${errorLog.stack ? `Stack Trace:\n${errorLog.stack}` : ''}
        
        Voir dans l'admin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/logs
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    logger.info(`Alerte email envoyée pour l'erreur ${errorLog._id}`, {
      errorId: errorLog._id,
      email: adminEmail
    });
    
    return true;
    
  } catch (error) {
    logger.error('Erreur lors de l\'envoi de l\'alerte email', {
      errorId: errorLog._id,
      error: error.message,
      stack: error.stack
    });
    return false;
  }
};











