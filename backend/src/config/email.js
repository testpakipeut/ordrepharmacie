import nodemailer from 'nodemailer';
import { createModuleLogger } from './logger.js';

const logger = createModuleLogger('Email');

// Configuration du transporteur email
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true pour le port 465, false pour les autres ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Envoyer un email de demande de devis
export const sendQuoteEmail = async (quoteData, files = [], pdfData = null) => {
  const transporter = createTransporter();

  // Préparer les pièces jointes (fichiers en mémoire)
  const attachments = files.map(file => ({
    filename: file.originalname,
    content: file.buffer // Utilise le buffer mémoire au lieu du path
  }));

  // Ajouter le PDF du devis s'il existe
  if (pdfData) {
    attachments.push({
      filename: pdfData.filename,
      content: pdfData.buffer,
      contentType: 'application/pdf'
    });
  }

  // Construire le corps de l'email en HTML (simplifié)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .highlight-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .info-row { margin: 12px 0; font-size: 15px; }
        .label { font-weight: bold; color: #002f6c; }
        .pdf-notice { background: #f8f9fa; border: 2px solid #002F6C; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; }
        .pdf-icon { font-size: 40px; margin-bottom: 10px; }
        .footer { background: #002f6c; color: white; padding: 25px; text-align: center; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nouvelle Demande de Devis</h1>
        </div>
        
        <div class="content">
          <div class="highlight-box">
            <div class="info-row"><span class="label">Client :</span> ${quoteData.fullName}</div>
            ${quoteData.company ? `<div class="info-row"><span class="label">Entreprise :</span> ${quoteData.company}</div>` : ''}
            <div class="info-row"><span class="label">Email :</span> ${quoteData.email}</div>
            <div class="info-row"><span class="label">Téléphone :</span> ${quoteData.phone}</div>
            <div class="info-row"><span class="label">Localisation :</span> ${quoteData.city}, ${quoteData.country}</div>
          </div>

          ${pdfData ? `
          <div class="pdf-notice">
            <div class="pdf-icon">📄</div>
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #002f6c;">Demande de devis complète en pièce jointe</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">Fichier : <strong>${pdfData.filename}</strong></p>
          </div>
          ` : ''}

          ${files.length > 0 ? `
          <p style="margin-top: 20px; color: #666; font-size: 14px;">
            <strong>Documents joints :</strong> ${files.length} fichier(s) additionnel(s)
          </p>
          ` : ''}

          <p style="margin-top: 25px; font-size: 14px; color: #555;">
            Consultez le document PDF joint pour voir tous les détails de la demande de devis.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">Cette demande a été envoyée depuis le site web CIPS</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Merci de ne pas répondre à cet email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Options de l'email
  const mailOptions = {
    from: `"Site CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: process.env.COMPANY_EMAIL || 'tizi.lion@gmail.com',
    replyTo: quoteData.email, // Permet de répondre directement au client
    subject: `📋 Nouvelle demande de devis - ${quoteData.fullName}`,
    html: htmlContent,
    attachments: attachments
  };

  // Envoyer l'email
  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de devis envoyé avec succès', { 
      messageId: info.messageId, 
      to: mailOptions.to,
      subject: mailOptions.subject 
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email de devis', { 
      to: mailOptions.to, 
      error: error.message, 
      code: error.code,
      command: error.command 
    });
    throw error;
  }
};

// Envoyer un email de contact
export const sendContactEmail = async (contactData) => {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); color: white; padding: 30px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .section { margin-bottom: 20px; }
        .label { font-weight: bold; color: #555; }
        .value { color: #333; }
        .message-box { background: white; padding: 20px; border-left: 4px solid #ff8c42; margin-top: 15px; }
        .footer { background: #002f6c; color: white; padding: 20px; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📬 Nouveau Message de Contact</h1>
        </div>
        
        <div class="content">
          <div class="section">
            <p><span class="label">Nom :</span> <span class="value">${contactData.name}</span></p>
            <p><span class="label">Email :</span> <span class="value">${contactData.email}</span></p>
            ${contactData.phone ? `<p><span class="label">Téléphone :</span> <span class="value">${contactData.phone}</span></p>` : ''}
            <p><span class="label">Sujet :</span> <span class="value">${contactData.subject}</span></p>
          </div>

          <div class="section">
            <p class="label">Message :</p>
            <div class="message-box">${contactData.message}</div>
          </div>
        </div>

        <div class="footer">
          <p>Ce message a été envoyé depuis le site web CIPS</p>
          <p>Merci de ne pas répondre à cet email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Site CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: process.env.COMPANY_EMAIL || 'tizi.lion@gmail.com',
    replyTo: contactData.email,
    subject: `📬 Contact: ${contactData.subject}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de contact envoyé avec succès', { 
      messageId: info.messageId, 
      to: mailOptions.to,
      from: contactData.email,
      subject: mailOptions.subject 
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email de contact', { 
      to: mailOptions.to, 
      from: contactData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de simulation  
export const sendSimulationEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"CIPS SARL" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de simulation envoyé avec succès', { 
      messageId: info.messageId, 
      to: process.env.COMPANY_EMAIL,
      kitRecommande: simulationData.kitRecommande?.nom 
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email de simulation', { 
      to: process.env.COMPANY_EMAIL,
      kitRecommande: simulationData.kitRecommande?.nom,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de demande de partenariat
export const sendPartnershipEmail = async (partnershipData) => {
  const transporter = createTransporter();

  // Mapping des types de partenariat en français
  const partnershipTypes = {
    distributeur: 'Distributeur / Revendeur',
    fournisseur: 'Fournisseur',
    ong: 'ONG / Organisation',
    technologique: 'Partenaire Technologique',
    autre: 'Autre'
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .highlight-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #ff8c42; }
        .info-row { margin: 12px 0; font-size: 15px; }
        .label { font-weight: bold; color: #002f6c; }
        .message-box { background: white; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px; margin-top: 15px; }
        .type-badge { display: inline-block; background: #ff8c42; color: white; padding: 8px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .footer { background: #002f6c; color: white; padding: 25px; text-align: center; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤝 Nouvelle Demande de Partenariat</h1>
        </div>
        
        <div class="content">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="type-badge">${partnershipTypes[partnershipData.typePartenariat] || partnershipData.typePartenariat}</span>
          </div>

          <div class="highlight-box">
            <div class="info-row"><span class="label">Entreprise :</span> ${partnershipData.entreprise}</div>
            <div class="info-row"><span class="label">Contact :</span> ${partnershipData.nom}</div>
            <div class="info-row"><span class="label">Email :</span> ${partnershipData.email}</div>
            <div class="info-row"><span class="label">Téléphone :</span> ${partnershipData.telephone}</div>
            <div class="info-row"><span class="label">Type de partenariat :</span> ${partnershipTypes[partnershipData.typePartenariat] || partnershipData.typePartenariat}</div>
          </div>

          <div>
            <p class="label">Message :</p>
            <div class="message-box">${partnershipData.message.replace(/\n/g, '<br>')}</div>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #555; text-align: center;">
            💡 Cette demande nécessite votre attention et une réponse rapide.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">Cette demande a été envoyée depuis le site web CIPS</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Vous pouvez répondre directement en utilisant l'email fourni ci-dessus</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Site CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: process.env.COMPANY_EMAIL || 'tizi.lion@gmail.com',
    replyTo: partnershipData.email,
    subject: `🤝 Nouvelle demande de partenariat - ${partnershipData.entreprise}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de partenariat envoyé avec succès', { 
      messageId: info.messageId, 
      to: mailOptions.to,
      entreprise: partnershipData.entreprise,
      type: partnershipData.typePartenariat
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email de partenariat', { 
      to: mailOptions.to, 
      entreprise: partnershipData.entreprise,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de confirmation pour l'inscription à la newsletter
export const sendNewsletterConfirmationEmail = async (subscriberData) => {
  const transporter = createTransporter();
  
  // URL du logo (utiliser l'URL absolue du site en production)
  // Le logo est dans frontend/public/ et est servi statiquement
  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #002f6c;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-text {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer-logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signature-text {
          font-size: 15px;
          color: #002f6c;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .signature-company {
          font-size: 13px;
          color: #666;
        }
        .social-links {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .social-links a {
          color: #002f6c;
          text-decoration: none;
          margin: 0 10px;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="C.I.P.S Logo" />
          <h1>Bienvenue dans notre communauté !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            Bonjour ${subscriberData.name || 'Cher(e) abonné(e)'},
          </div>
          
          <div class="message-text">
            Nous sommes ravis de vous compter parmi nos abonnés ! Votre inscription à notre newsletter a été confirmée avec succès.
          </div>

          <div class="highlight-box">
            <div class="info-row">
              <span class="label">📧 Email :</span> ${subscriberData.email}
            </div>
            <div class="info-row">
              <span class="label">📅 Date d'inscription :</span> ${new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <div class="message-text">
            Vous recevrez désormais nos dernières actualités, nos innovations technologiques, nos guides pratiques et nos offres exclusives directement dans votre boîte mail.
          </div>

          <div class="signature">
            <div class="signature-text">L'équipe CIPS</div>
            <div class="signature-company">
              Groupe CIPS - Conception Innovante pour la Sécurité<br>
              Libreville, Gabon
            </div>
          </div>
        </div>

        <div class="footer">
          <img src="${logoUrl}" alt="C.I.P.S Logo" class="footer-logo" />
          <p style="margin: 10px 0;">© ${new Date().getFullYear()} Groupe CIPS. Tous droits réservés.</p>
          <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">
            Vous recevez cet email car vous vous êtes inscrit à notre newsletter.<br>
            Si vous ne souhaitez plus recevoir nos emails, vous pouvez vous désinscrire à tout moment.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"L'équipe CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: subscriberData.email,
    subject: '✅ Confirmation d\'inscription à la newsletter CIPS',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de confirmation newsletter envoyé avec succès', { 
      messageId: info.messageId, 
      to: subscriberData.email
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email confirmation newsletter', { 
      to: subscriberData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de confirmation pour le message de contact
export const sendContactConfirmationEmail = async (contactData) => {
  const transporter = createTransporter();
  
  // URL du logo (utiliser l'URL absolue du site en production)
  // Le logo est dans frontend/public/ et est servi statiquement
  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #002f6c;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-text {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .message-preview {
          background: white;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          margin-top: 15px;
          font-style: italic;
          color: #666;
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer-logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signature-text {
          font-size: 15px;
          color: #002f6c;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .signature-company {
          font-size: 13px;
          color: #666;
        }
        .cta-box {
          background: #002f6c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
        }
        .cta-box p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="C.I.P.S Logo" />
          <h1>Message reçu avec succès !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            Bonjour ${contactData.name},
          </div>
          
          <div class="message-text">
            Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés. Notre équipe va examiner votre demande et vous répondra dans les plus brefs délais.
          </div>

          <div class="cta-box">
            <p>⏱️ Temps de réponse estimé : 24-48 heures</p>
          </div>

          <div class="message-text">
            En attendant notre réponse, n'hésitez pas à consulter notre site web pour découvrir nos services et nos dernières actualités.
          </div>

          <div class="signature">
            <div class="signature-text">L'équipe CIPS</div>
            <div class="signature-company">
              Groupe CIPS - Conception Innovante pour la Sécurité<br>
              Libreville, Gabon<br>
              📧 contact@cips-gabon.com
            </div>
          </div>
        </div>

        <div class="footer">
          <img src="${logoUrl}" alt="C.I.P.S Logo" class="footer-logo" />
          <p style="margin: 10px 0;">© ${new Date().getFullYear()} Groupe CIPS. Tous droits réservés.</p>
          <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">
            Cet email confirme la réception de votre message. Merci de ne pas répondre directement à cet email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"L'équipe CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: contactData.email,
    subject: `✅ Confirmation de réception - ${contactData.subject}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de confirmation contact envoyé avec succès', { 
      messageId: info.messageId, 
      to: contactData.email,
      subject: contactData.subject
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email confirmation contact', { 
      to: contactData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de notification à l'entreprise pour nouvelle inscription newsletter
export const sendNewsletterNotificationEmail = async (subscriberData) => {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .badge {
          display: inline-block;
          background: #ff8c42;
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Nouvelle Inscription Newsletter</h1>
        </div>
        
        <div class="content">
          <div style="text-align: center;">
            <span class="badge">Nouvel abonné</span>
          </div>

          <div class="highlight-box">
            <div class="info-row">
              <span class="label">👤 Nom :</span> ${subscriberData.name || 'Non renseigné'}
            </div>
            <div class="info-row">
              <span class="label">📧 Email :</span> ${subscriberData.email}
            </div>
            <div class="info-row">
              <span class="label">📅 Date d'inscription :</span> ${new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #555; text-align: center;">
            💡 Un nouvel abonné s'est inscrit à votre newsletter. Vous pouvez maintenant lui envoyer vos actualités et offres.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">Cette notification a été envoyée depuis le site web CIPS</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.9;">Système de notification automatique</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Site CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: process.env.COMPANY_EMAIL || 'tizi.lion@gmail.com',
    subject: `📧 Nouvelle inscription newsletter - ${subscriberData.name || subscriberData.email}`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de notification newsletter envoyé à l\'entreprise', { 
      messageId: info.messageId, 
      to: mailOptions.to,
      subscriber: subscriberData.email
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email notification newsletter', { 
      to: mailOptions.to, 
      subscriber: subscriberData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de confirmation pour la demande de devis
export const sendQuoteConfirmationEmail = async (quoteData) => {
  const transporter = createTransporter();
  
  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #002f6c;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-text {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer-logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .cta-box {
          background: #002f6c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
        }
        .cta-box p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signature-text {
          font-size: 15px;
          color: #002f6c;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .signature-company {
          font-size: 13px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="C.I.P.S Logo" />
          <h1>Demande de devis reçue !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            Bonjour ${quoteData.fullName},
          </div>
          
          <div class="message-text">
            Nous avons bien reçu votre demande de devis et nous vous remercions de votre confiance. Notre équipe commerciale va examiner votre demande en détail et vous préparer une proposition personnalisée.
          </div>

          <div class="highlight-box">
            <div class="info-row"><span class="label">Votre demande concerne :</span></div>
            ${quoteData.poles && quoteData.poles.length > 0 ? `<div class="info-row">${quoteData.poles.join(', ')}</div>` : ''}
            ${quoteData.city ? `<div class="info-row"><span class="label">Localisation :</span> ${quoteData.city}, ${quoteData.country || ''}</div>` : ''}
          </div>

          <div class="cta-box">
            <p>⏱️ Temps de réponse estimé : 24-48 heures</p>
          </div>

          <div class="message-text">
            Un expert CIPS va étudier vos besoins et vous contactera sous peu pour discuter de votre projet et vous proposer la meilleure solution adaptée à vos besoins.
          </div>

          <div class="signature">
            <div class="signature-text">L'équipe CIPS</div>
            <div class="signature-company">
              Groupe CIPS - Conception Innovante pour la Sécurité<br>
              Libreville, Gabon<br>
              📧 contact@cips-gabon.com
            </div>
          </div>
        </div>

        <div class="footer">
          <img src="${logoUrl}" alt="C.I.P.S Logo" class="footer-logo" />
          <p style="margin: 10px 0;">© ${new Date().getFullYear()} Groupe CIPS. Tous droits réservés.</p>
          <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">
            Cet email confirme la réception de votre demande de devis. Merci de ne pas répondre directement à cet email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"L'équipe CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: quoteData.email,
    subject: '✅ Confirmation de réception - Demande de devis CIPS',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de confirmation devis envoyé avec succès', { 
      messageId: info.messageId, 
      to: quoteData.email
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email confirmation devis', { 
      to: quoteData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de confirmation pour la simulation énergétique
export const sendSimulationConfirmationEmail = async (simulationData) => {
  const transporter = createTransporter();
  
  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  const userName = simulationData.user?.name || 'Cher(e) client(e)';
  const userEmail = simulationData.user?.email;
  
  if (!userEmail) {
    throw new Error('Email utilisateur requis pour l\'envoi de confirmation');
  }
  const kitNom = simulationData.kitRecommande?.nom || 'kit recommandé';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #002f6c;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-text {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer-logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .cta-box {
          background: #002f6c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
        }
        .cta-box p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signature-text {
          font-size: 15px;
          color: #002f6c;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .signature-company {
          font-size: 13px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="C.I.P.S Logo" />
          <h1>⚡ Simulation énergétique reçue !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            Bonjour ${userName},
          </div>
          
          <div class="message-text">
            Nous avons bien reçu votre simulation énergétique et nous vous remercions de votre intérêt pour nos solutions solaires. Notre équipe d'experts va analyser vos besoins et vous préparer une proposition personnalisée.
          </div>

          <div class="highlight-box">
            <div class="info-row"><span class="label">Kit recommandé :</span> ${kitNom}</div>
            ${simulationData.ville ? `<div class="info-row"><span class="label">Localisation :</span> ${simulationData.ville}, ${simulationData.pays || ''}</div>` : ''}
            ${simulationData.budget ? `<div class="info-row"><span class="label">Budget estimé :</span> ${simulationData.budget}</div>` : ''}
          </div>

          <div class="cta-box">
            <p>⏱️ Temps de réponse estimé : 24-48 heures</p>
          </div>

          <div class="message-text">
            Un spécialiste en énergie solaire va examiner votre simulation et vous contactera prochainement pour discuter de la solution la plus adaptée à vos besoins énergétiques et à votre budget.
          </div>

          <div class="signature">
            <div class="signature-text">L'équipe CIPS - Pôle Énergie</div>
            <div class="signature-company">
              Groupe CIPS - Conception Innovante pour la Sécurité<br>
              Libreville, Gabon<br>
              📧 contact@cips-gabon.com
            </div>
          </div>
        </div>

        <div class="footer">
          <img src="${logoUrl}" alt="C.I.P.S Logo" class="footer-logo" />
          <p style="margin: 10px 0;">© ${new Date().getFullYear()} Groupe CIPS. Tous droits réservés.</p>
          <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">
            Cet email confirme la réception de votre simulation énergétique. Merci de ne pas répondre directement à cet email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"L'équipe CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: userEmail,
    subject: '⚡ Confirmation de réception - Simulation énergétique CIPS',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de confirmation simulation envoyé avec succès', { 
      messageId: info.messageId, 
      to: userEmail
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email confirmation simulation', { 
      to: userEmail,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de confirmation pour la demande de partenariat
export const sendPartnershipConfirmationEmail = async (partnershipData) => {
  const transporter = createTransporter();
  
  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  // Mapping des types de partenariat en français
  const partnershipTypes = {
    distributeur: 'Distributeur / Revendeur',
    fournisseur: 'Fournisseur',
    ong: 'ONG / Organisation',
    technologique: 'Partenaire Technologique',
    autre: 'Autre'
  };

  const typeLibelle = partnershipTypes[partnershipData.typePartenariat] || partnershipData.typePartenariat;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #002f6c;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-text {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .type-badge {
          display: inline-block;
          background: #ff8c42;
          color: white;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 15px;
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer-logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .cta-box {
          background: #002f6c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
        }
        .cta-box p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signature-text {
          font-size: 15px;
          color: #002f6c;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .signature-company {
          font-size: 13px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="C.I.P.S Logo" />
          <h1>🤝 Demande de partenariat reçue !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            Bonjour ${partnershipData.nom},
          </div>
          
          <div class="message-text">
            Nous avons bien reçu votre demande de partenariat et nous vous remercions de votre intérêt pour collaborer avec le Groupe CIPS. Notre équipe va examiner votre proposition avec attention.
          </div>

          <div class="highlight-box">
            <div class="info-row"><span class="label">Entreprise :</span> ${partnershipData.entreprise}</div>
            <div class="info-row"><span class="label">Type de partenariat :</span> <span class="type-badge">${typeLibelle}</span></div>
          </div>

          <div class="cta-box">
            <p>⏱️ Temps de réponse estimé : 48-72 heures</p>
          </div>

          <div class="message-text">
            Notre équipe commerciale et de développement des partenariats va étudier votre demande et vous contactera prochainement pour discuter des possibilités de collaboration et des prochaines étapes.
          </div>

          <div class="signature">
            <div class="signature-text">L'équipe CIPS - Partenariats</div>
            <div class="signature-company">
              Groupe CIPS - Conception Innovante pour la Sécurité<br>
              Libreville, Gabon<br>
              📧 contact@cips-gabon.com
            </div>
          </div>
        </div>

        <div class="footer">
          <img src="${logoUrl}" alt="C.I.P.S Logo" class="footer-logo" />
          <p style="margin: 10px 0;">© ${new Date().getFullYear()} Groupe CIPS. Tous droits réservés.</p>
          <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">
            Cet email confirme la réception de votre demande de partenariat. Merci de ne pas répondre directement à cet email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"L'équipe CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: partnershipData.email,
    subject: '🤝 Confirmation de réception - Demande de partenariat CIPS',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de confirmation partenariat envoyé avec succès', { 
      messageId: info.messageId, 
      to: partnershipData.email
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email confirmation partenariat', { 
      to: partnershipData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de notification pour une nouvelle candidature (à l'entreprise)
export const sendApplicationEmail = async (applicationData, jobData, cvFile = null) => {
  const transporter = createTransporter();

  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  const attachments = [];
  if (cvFile && cvFile.path) {
    attachments.push({
      filename: cvFile.originalname || 'CV.pdf',
      path: cvFile.path
    });
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .highlight-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #ff8c42; }
        .info-row { margin: 12px 0; font-size: 15px; }
        .label { font-weight: bold; color: #002f6c; }
        .message-box { background: white; padding: 20px; border: 1px solid #e0e0e0; border-radius: 4px; margin-top: 15px; }
        .job-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .cv-notice { background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .footer { background: #002f6c; color: white; padding: 25px; text-align: center; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Nouvelle Candidature</h1>
        </div>
        
        <div class="content">
          <div class="job-info">
            <div class="info-row"><span class="label">Poste :</span> ${jobData.titre || 'N/A'}</div>
            <div class="info-row"><span class="label">Département :</span> ${jobData.departement || 'N/A'}</div>
            <div class="info-row"><span class="label">Type :</span> ${jobData.type || 'N/A'}</div>
            <div class="info-row"><span class="label">Localisation :</span> ${jobData.localisation || 'N/A'}</div>
          </div>

          <div class="highlight-box">
            <div class="info-row"><span class="label">Candidat :</span> ${applicationData.nom}</div>
            <div class="info-row"><span class="label">Email :</span> ${applicationData.email}</div>
            <div class="info-row"><span class="label">Téléphone :</span> ${applicationData.telephone}</div>
          </div>

          ${cvFile ? `
          <div class="cv-notice">
            <p style="margin: 0; font-size: 16px; font-weight: bold; color: #856404;">📄 CV joint en pièce jointe</p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #856404;">Fichier : <strong>${cvFile.originalname || 'CV.pdf'}</strong></p>
          </div>
          ` : ''}

          <div class="message-box">
            <p class="label" style="margin-top: 0;">Message du candidat :</p>
            <p style="white-space: pre-wrap; color: #555; margin: 0;">${applicationData.message || 'Aucun message'}</p>
          </div>

          <p style="margin-top: 25px; font-size: 14px; color: #555;">
            Consultez cette candidature dans votre espace admin pour plus de détails et pour télécharger le CV si nécessaire.
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0;">Cette candidature a été envoyée depuis le site web CIPS</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.8;">Merci de ne pas répondre directement à cet email</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"Site CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: process.env.COMPANY_EMAIL || 'tizi.lion@gmail.com',
    replyTo: applicationData.email,
    subject: `📧 Nouvelle candidature - ${jobData.titre || 'Offre d\'emploi'} - ${applicationData.nom}`,
    html: htmlContent,
    attachments: attachments
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de candidature envoyé avec succès', { 
      messageId: info.messageId, 
      to: mailOptions.to,
      jobTitle: jobData.titre,
      candidateEmail: applicationData.email
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email de candidature', { 
      to: mailOptions.to, 
      candidateEmail: applicationData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

// Envoyer un email de confirmation pour la candidature (au candidat)
export const sendApplicationConfirmationEmail = async (applicationData, jobData) => {
  const transporter = createTransporter();
  
  const siteUrl = process.env.SITE_URL || 'https://csip.up.railway.app';
  const logoUrl = `${siteUrl.replace(/\/$/, '')}/CIPS_logo_noir_HD_transparent.png`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          background: #f4f4f4; 
          margin: 0; 
          padding: 0; 
        }
        .container { 
          max-width: 600px; 
          margin: 30px auto; 
          background: white; 
          border-radius: 12px; 
          overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #002f6c 0%, #003d73 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header img {
          max-width: 200px;
          height: auto;
          margin-bottom: 20px;
        }
        .header h1 { 
          margin: 0; 
          font-size: 28px; 
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px; 
        }
        .welcome-message {
          font-size: 18px;
          color: #002f6c;
          margin-bottom: 20px;
          font-weight: 600;
        }
        .message-text {
          font-size: 16px;
          color: #555;
          line-height: 1.8;
          margin-bottom: 30px;
        }
        .highlight-box { 
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); 
          padding: 25px; 
          margin: 25px 0; 
          border-radius: 8px; 
          border-left: 4px solid #ff8c42;
        }
        .info-row { 
          margin: 12px 0; 
          font-size: 15px; 
        }
        .label { 
          font-weight: bold; 
          color: #002f6c; 
        }
        .footer { 
          background: #002f6c; 
          color: white; 
          padding: 30px; 
          text-align: center; 
          font-size: 14px; 
        }
        .footer-logo {
          max-width: 150px;
          height: auto;
          margin-bottom: 15px;
          opacity: 0.9;
        }
        .cta-box {
          background: #002f6c;
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          margin: 25px 0;
        }
        .cta-box p {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .signature {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e0e0e0;
        }
        .signature-text {
          font-size: 15px;
          color: #002f6c;
          font-weight: 600;
          margin-bottom: 5px;
        }
        .signature-company {
          font-size: 13px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logoUrl}" alt="C.I.P.S Logo" />
          <h1>✅ Candidature reçue !</h1>
        </div>
        
        <div class="content">
          <div class="welcome-message">
            Bonjour ${applicationData.nom},
          </div>
          
          <div class="message-text">
            Nous avons bien reçu votre candidature et nous vous remercions de votre intérêt pour rejoindre le Groupe CIPS. Notre équipe des ressources humaines va examiner votre profil avec attention.
          </div>

          <div class="highlight-box">
            <div class="info-row"><span class="label">Poste :</span> ${jobData.titre || 'N/A'}</div>
            <div class="info-row"><span class="label">Département :</span> ${jobData.departement || 'N/A'}</div>
            <div class="info-row"><span class="label">Type :</span> ${jobData.type || 'N/A'}</div>
          </div>

          <div class="cta-box">
            <p>⏱️ Temps de traitement : 7-14 jours</p>
          </div>

          <div class="message-text">
            Nous étudierons votre candidature avec attention et nous vous contacterons prochainement pour vous informer de la suite du processus de recrutement. Si votre profil correspond à nos besoins, nous vous contacterons pour un entretien.
          </div>

          <div class="signature">
            <div class="signature-text">L'équipe CIPS - Ressources Humaines</div>
            <div class="signature-company">
              Groupe CIPS - Conception Innovante pour la Sécurité<br>
              Libreville, Gabon<br>
              📧 contact@cips-gabon.com
            </div>
          </div>
        </div>

        <div class="footer">
          <img src="${logoUrl}" alt="C.I.P.S Logo" class="footer-logo" />
          <p style="margin: 10px 0;">© ${new Date().getFullYear()} Groupe CIPS. Tous droits réservés.</p>
          <p style="margin: 5px 0; font-size: 12px; opacity: 0.9;">
            Cet email confirme la réception de votre candidature. Merci de ne pas répondre directement à cet email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `"L'équipe CIPS" <${process.env.SMTP_USER || 'contact@hexahub.fr'}>`,
    to: applicationData.email,
    subject: '✅ Confirmation de réception - Candidature CIPS',
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('✅ Email de confirmation candidature envoyé avec succès', { 
      messageId: info.messageId, 
      to: applicationData.email
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Erreur envoi email confirmation candidature', { 
      to: applicationData.email,
      error: error.message, 
      code: error.code 
    });
    throw error;
  }
};

export default { sendQuoteEmail, sendContactEmail, sendSimulationEmail, sendPartnershipEmail, sendNewsletterConfirmationEmail, sendContactConfirmationEmail, sendNewsletterNotificationEmail, sendQuoteConfirmationEmail, sendSimulationConfirmationEmail, sendPartnershipConfirmationEmail, sendApplicationEmail, sendApplicationConfirmationEmail };

