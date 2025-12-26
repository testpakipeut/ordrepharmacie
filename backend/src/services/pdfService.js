import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Générer un numéro de devis unique avec horodatage
const generateQuoteNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `DEVIS-${year}${month}${day}-${hours}${minutes}${seconds}`;
};

// Formater une date en français
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Convertir l'image en base64
const getLogoBase64 = () => {
  try {
    const logoPath = path.join(__dirname, '../../../frontend/public/CIPS_logo_noir_HD_transparent.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (error) {
    console.warn('⚠️ [PDF] Logo non trouvé, utilisation du logo CSS');
    return null;
  }
};

// Template HTML pour le PDF
const generateHTMLTemplate = (quoteData, quoteNumber) => {
  const poles = quoteData.poles ? quoteData.poles.join(', ') : 'Non spécifié';
  const services = quoteData.specificServices ? quoteData.specificServices.join(', ') : '';
  const additionalServices = quoteData.additionalServices ? quoteData.additionalServices.join(', ') : '';
  const logoBase64 = getLogoBase64();
  
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.4;
      color: #333;
      background: white;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      position: relative;
    }
    
    /* En-tête */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
      padding-bottom: 10px;
    }
    
    .company-info {
      flex: 1;
    }
    
    .company-logo {
      width: 120px;
      height: auto;
      margin-bottom: 10px;
    }
    
    .company-logo img {
      width: 100%;
      height: auto;
    }
    
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #002F6C;
      margin-bottom: 3px;
    }
    
    .company-tagline {
      font-size: 11px;
      color: #666;
      margin-bottom: 10px;
    }
    
    .company-details {
      font-size: 10px;
      color: #666;
      line-height: 1.6;
    }
    
    .quote-info {
      text-align: right;
    }
    
    .quote-title {
      font-size: 22px;
      font-weight: bold;
      color: #002F6C;
      margin-bottom: 8px;
    }
    
    .quote-number {
      font-size: 14px;
      color: #002F6C;
      font-weight: bold;
      margin-bottom: 3px;
    }
    
    .quote-date {
      font-size: 10px;
      color: #666;
    }
    
    /* Informations client */
    .client-section {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #002F6C;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .info-item {
      font-size: 11px;
    }
    
    .info-label {
      font-weight: bold;
      color: #555;
      margin-bottom: 2px;
      font-size: 10px;
    }
    
    .info-value {
      color: #333;
      font-size: 11px;
    }
    
    /* Détails du projet */
    .project-section {
      margin-bottom: 15px;
    }
    
    .project-poles {
      background: linear-gradient(135deg, #002F6C 0%, #003d73 100%);
      color: white;
      padding: 12px 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    
    .project-poles .section-title {
      color: white;
      margin-bottom: 6px;
      font-size: 12px;
    }
    
    .poles-list {
      font-size: 11px;
      font-weight: 500;
    }
    
    .description-box {
      background: #fff;
      border: 1px solid #e0e0e0;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 15px;
    }
    
    .description-text {
      font-size: 11px;
      line-height: 1.5;
      color: #333;
      white-space: pre-wrap;
    }
    
    /* Services */
    .services-section {
      background: #f8f9fa;
      padding: 12px;
      border-radius: 6px;
      margin-bottom: 12px;
    }
    
    .services-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    
    .service-tag {
      background: white;
      border: 1px solid #002F6C;
      color: #002F6C;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: 600;
    }
    
    /* Détails additionnels */
    .additional-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .detail-box {
      background: white;
      border: 1px solid #e0e0e0;
      padding: 10px;
      border-radius: 6px;
    }
    
    .detail-label {
      font-size: 9px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 3px;
      font-weight: 600;
    }
    
    .detail-value {
      font-size: 12px;
      color: #002F6C;
      font-weight: bold;
    }
    
    /* Footer */
    .footer {
      margin-top: 15px;
      padding-top: 10px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 8px;
      color: #666;
    }
    
    .footer-note {
      background: #f8f9fa;
      padding: 8px;
      margin: 8px 0;
      text-align: left;
      font-size: 9px;
      border-radius: 4px;
    }
    
    .footer-contacts {
      margin-top: 6px;
      line-height: 1.3;
      font-size: 8px;
    }
    
    .footer-contacts strong {
      color: #002F6C;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- En-tête -->
    <div class="header">
      <div class="company-info">
        ${logoBase64 ? `
        <div class="company-logo">
          <img src="${logoBase64}" alt="Logo CIPS" />
        </div>
        ` : `
        <div class="company-name">C.I.P.S</div>
        `}
        <div class="company-tagline">Conception Innovante pour la Sécurité</div>
        <div class="company-details">
          Libreville, GABON<br>
          +241 04 80 23 44<br>
          contact@cips-gabon.com
        </div>
      </div>
      <div class="quote-info">
        <div class="quote-title">DEMANDE DE DEVIS</div>
        <div class="quote-number">${quoteNumber}</div>
        <div class="quote-date">Date : ${formatDate(new Date())}</div>
      </div>
    </div>

    <!-- Informations Client -->
    <div class="client-section">
      <div class="section-title">Informations Client</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Nom complet</div>
          <div class="info-value">${quoteData.fullName}</div>
        </div>
        ${quoteData.company ? `
        <div class="info-item">
          <div class="info-label">Entreprise</div>
          <div class="info-value">${quoteData.company}</div>
        </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Email</div>
          <div class="info-value">${quoteData.email}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Téléphone</div>
          <div class="info-value">${quoteData.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Ville</div>
          <div class="info-value">${quoteData.city}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Pays</div>
          <div class="info-value">${quoteData.country}</div>
        </div>
      </div>
    </div>

    <!-- Pôles concernés -->
    <div class="project-section">
      <div class="project-poles">
        <div class="section-title">Pôles d'Expertise Concernés</div>
        <div class="poles-list">${poles}</div>
      </div>

      <!-- Description du projet -->
      <div class="section-title">Description du Projet</div>
      <div class="description-box">
        <div class="description-text">${quoteData.projectDescription}</div>
      </div>
    </div>

    ${services ? `
    <!-- Services spécifiques -->
    <div class="services-section">
      <div class="section-title">Services Spécifiques Demandés</div>
      <div class="services-list">
        ${quoteData.specificServices.map(service => `<div class="service-tag">${service}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    ${additionalServices ? `
    <!-- Services additionnels -->
    <div class="services-section">
      <div class="section-title">Services Complémentaires</div>
      <div class="services-list">
        ${quoteData.additionalServices.map(service => `<div class="service-tag">${service}</div>`).join('')}
      </div>
    </div>
    ` : ''}

    <!-- Détails additionnels -->
    <div class="additional-details">
      ${quoteData.desiredDate ? `
      <div class="detail-box">
        <div class="detail-label">Date souhaitée</div>
        <div class="detail-value">${formatDate(quoteData.desiredDate)}</div>
      </div>
      ` : ''}
      ${quoteData.estimatedBudget ? `
      <div class="detail-box">
        <div class="detail-label">Budget estimatif</div>
        <div class="detail-value">${quoteData.estimatedBudget}</div>
      </div>
      ` : ''}
      ${quoteData.contactPreference && quoteData.contactPreference.length > 0 ? `
      <div class="detail-box">
        <div class="detail-label">Préférences de contact</div>
        <div class="detail-value">${quoteData.contactPreference.join(', ')}</div>
      </div>
      ` : ''}
      ${quoteData.callbackTime ? `
      <div class="detail-box">
        <div class="detail-label">Horaire préféré</div>
        <div class="detail-value">${quoteData.callbackTime}</div>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-note">
        <strong>Note interne :</strong> Demande reçue via le site web CIPS. Traiter cette demande et contacter le client pour établir un devis détaillé.
      </div>
      
      <div class="footer-contacts">
        <strong>Groupe CIPS</strong> - Conception Innovante pour la Sécurité<br>
        Libreville, GABON | +241 04 80 23 44 | contact@cips-gabon.com
      </div>
      
      <div style="margin-top: 5px; color: #999; font-size: 7px;">
        Document généré le ${formatDate(new Date())}
      </div>
    </div>
  </div>
</body>
</html>
  `;
};

// Générer le PDF
export const generateQuotePDF = async (quoteData) => {
  const quoteNumber = generateQuoteNumber();
  
  console.log('📄 [PDF] Génération du PDF pour le devis:', quoteNumber);

  let browser;
  try {
    // Lancer Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Générer le HTML
    const html = generateHTMLTemplate(quoteData, quoteNumber);
    
    // Charger le HTML
    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    // Générer le PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();

    console.log('✅ [PDF] PDF généré avec succès');

    return {
      buffer: pdfBuffer,
      filename: `${quoteNumber}.pdf`,
      quoteNumber
    };

  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('❌ [PDF] Erreur lors de la génération:', error);
    throw error;
  }
};

export default { generateQuotePDF };

