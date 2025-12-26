import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '../../.env') });

// Configuration Infomaniak
const CUSTOM_SMTP_HOST = process.env.TEST_SMTP_HOST || 'smtp.infomaniak.com';
const CUSTOM_SMTP_PORT = process.env.TEST_SMTP_PORT || 587;
const CUSTOM_SMTP_SECURE = process.env.TEST_SMTP_SECURE === 'true' || false; // STARTTLS = false pour port 587, true pour port 465

// Configuration de test avec les nouvelles informations
const testConfig = {
  email: 'noreply@cips-tech.ga',
  password: 'Ply25!Si',
  // On va tester plusieurs serveurs SMTP courants pour .ga
  smtpConfigs: [
    {
      name: 'mail.cips-tech.ga',
      host: 'mail.cips-tech.ga',
      port: 587,
      secure: false
    },
    {
      name: 'smtp.cips-tech.ga',
      host: 'smtp.cips-tech.ga',
      port: 587,
      secure: false
    },
    {
      name: 'smtp.cips-tech.ga (SSL)',
      host: 'smtp.cips-tech.ga',
      port: 465,
      secure: true
    },
    {
      name: 'smtp.ovh.net (OVH)',
      host: 'ssl0.ovh.net',
      port: 587,
      secure: false
    },
    {
      name: 'smtp.ovh.net (OVH SSL)',
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true
    },
    {
      name: 'smtp.zoho.com (Zoho)',
      host: 'smtp.zoho.com',
      port: 587,
      secure: false
    },
    {
      name: 'smtp.zoho.com (Zoho SSL)',
      host: 'smtp.zoho.com',
      port: 465,
      secure: true
    }
  ]
};

// Fonction pour tester une configuration SMTP
async function testSMTPConnection(config) {
  console.log(`\n🔍 Test de connexion SMTP: ${config.name}`);
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Secure: ${config.secure}`);
  
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: testConfig.email,
        pass: testConfig.password
      },
      tls: {
        rejectUnauthorized: false, // Accepter les certificats auto-signés pour le test
        ciphers: 'SSLv3' // Certains serveurs nécessitent cela
      },
      connectionTimeout: 30000, // 30 secondes
      greetingTimeout: 30000,
      socketTimeout: 30000,
      debug: false, // Décommenter pour voir les détails de connexion
      logger: false
    });

    // Tester la connexion
    console.log('   ⏳ Vérification de la connexion...');
    await transporter.verify();
    console.log('   ✅ Connexion réussie !');

    // Essayer d'envoyer un email de test
    console.log('   ⏳ Envoi d\'un email de test...');
    const testEmail = await transporter.sendMail({
      from: `"Test CIPS" <${testConfig.email}>`,
      to: testConfig.email, // Envoyer à soi-même pour tester
      subject: 'Test SMTP CIPS',
      text: `Ceci est un email de test pour vérifier la configuration SMTP.
      
Date: ${new Date().toISOString()}
Configuration: ${config.name}
Serveur: ${config.host}:${config.port}
Secure: ${config.secure}

Si vous recevez cet email, la configuration SMTP fonctionne correctement !`,
      html: `
        <h2>Test SMTP CIPS</h2>
        <p>Ceci est un email de test pour vérifier la configuration SMTP.</p>
        <ul>
          <li><strong>Date:</strong> ${new Date().toISOString()}</li>
          <li><strong>Configuration:</strong> ${config.name}</li>
          <li><strong>Serveur:</strong> ${config.host}:${config.port}</li>
          <li><strong>Secure:</strong> ${config.secure}</li>
        </ul>
        <p>Si vous recevez cet email, la configuration SMTP fonctionne correctement ! ✅</p>
      `
    });

    console.log('   ✅ Email de test envoyé avec succès !');
    console.log(`   📧 Message ID: ${testEmail.messageId}`);
    
    return {
      success: true,
      config: config,
      messageId: testEmail.messageId
    };
  } catch (error) {
    console.log(`   ❌ Erreur: ${error.message}`);
    if (error.code) {
      console.log(`   Code d'erreur: ${error.code}`);
    }
    return {
      success: false,
      config: config,
      error: error.message,
      code: error.code
    };
  }
}

// Fonction principale
async function main() {
  console.log('='.repeat(60));
  console.log('🧪 TEST DE CONNEXION SMTP - CIPS');
  console.log('='.repeat(60));
  console.log(`📧 Email: ${testConfig.email}`);
  console.log(`🔑 Mot de passe: ${'*'.repeat(testConfig.password.length)}`);
  console.log(`📋 Configurations à tester: ${testConfig.smtpConfigs.length}`);
  console.log('='.repeat(60));

  const results = [];

  // Tester d'abord les configurations Infomaniak (587 STARTTLS et 465 SSL)
  console.log('\n🔧 Test avec configurations Infomaniak...\n');
  
  const infomaniakConfigs = [
    {
      name: 'Infomaniak (smtp.infomaniak.com) - Port 587 STARTTLS',
      host: CUSTOM_SMTP_HOST,
      port: 587,
      secure: false
    },
    {
      name: 'Infomaniak (smtp.infomaniak.com) - Port 465 SSL',
      host: CUSTOM_SMTP_HOST,
      port: 465,
      secure: true
    }
  ];
  
  for (const config of infomaniakConfigs) {
    const result = await testSMTPConnection(config);
    results.push(result);
    if (result.success) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ CONFIGURATION INFOMANIAK FONCTIONNELLE !');
      console.log('='.repeat(60));
      console.log(`Serveur: ${config.host}`);
      console.log(`Port: ${config.port}`);
      console.log(`Sécurité: ${config.secure ? 'SSL/TLS' : 'STARTTLS'} (secure: ${config.secure})`);
      console.log(`Email: ${testConfig.email}`);
      console.log('\n📝 Pour Railway, configurez ces variables d\'environnement:');
      console.log(`   SMTP_HOST=${config.host}`);
      console.log(`   SMTP_PORT=${config.port}`);
      console.log(`   SMTP_USER=${testConfig.email}`);
      console.log(`   SMTP_PASS=${testConfig.password}`);
      console.log('\n✅ La connexion SMTP fonctionne correctement !');
      console.log('='.repeat(60));
      return;
    }
  }
  
  console.log('\n⚠️  Configurations Infomaniak n\'ont pas fonctionné, test des autres configurations...\n');

  // Tester chaque configuration
  for (const config of testConfig.smtpConfigs) {
    const result = await testSMTPConnection(config);
    results.push(result);
    
    // Si on trouve une configuration qui fonctionne, on peut s'arrêter
    if (result.success) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ CONFIGURATION FONCTIONNELLE TROUVÉE !');
      console.log('='.repeat(60));
      console.log(`Serveur: ${config.host}`);
      console.log(`Port: ${config.port}`);
      console.log(`Secure: ${config.secure}`);
      console.log(`Email: ${testConfig.email}`);
      console.log('\n📝 Pour Railway, configurez ces variables d\'environnement:');
      console.log(`   SMTP_HOST=${config.host}`);
      console.log(`   SMTP_PORT=${config.port}`);
      console.log(`   SMTP_USER=${testConfig.email}`);
      console.log(`   SMTP_PASS=${testConfig.password}`);
      console.log('='.repeat(60));
      break; // Arrêter après la première configuration qui fonctionne
    }
  }

  // Résumé des résultats
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  console.log(`✅ Succès: ${successCount}`);
  console.log(`❌ Échecs: ${failureCount}`);
  
  if (successCount === 0) {
    console.log('\n⚠️  Aucune configuration n\'a fonctionné.');
    console.log('💡 Suggestions:');
    console.log('   1. Vérifiez que les identifiants sont corrects');
    console.log('   2. Vérifiez avec votre hébergeur email le serveur SMTP exact');
    console.log('   3. Vérifiez que le port n\'est pas bloqué par un firewall');
    console.log('   4. Vérifiez que l\'authentification SMTP est activée');
  }
  
  console.log('='.repeat(60));
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

