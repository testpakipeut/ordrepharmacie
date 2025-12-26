import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Charger les variables d'environnement
dotenv.config();

console.log('🔍 Test de configuration Cloudinary\n');

// Vérifier les variables
console.log('Variables d\'environnement :');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ NON DÉFINIE');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY || '❌ NON DÉFINIE');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ DÉFINIE (masquée)' : '❌ NON DÉFINIE');
console.log('');

// Configurer Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Tester la connexion
console.log('🧪 Test de connexion à Cloudinary...\n');

try {
  const result = await cloudinary.api.ping();
  console.log('✅ Connexion réussie !');
  console.log('Réponse:', result);
} catch (error) {
  console.error('❌ Erreur de connexion:');
  console.error(error.message);
  
  if (error.http_code === 401) {
    console.error('\n⚠️  Clés Cloudinary invalides ou manquantes !');
    console.error('Vérifiez votre fichier backend/.env');
  }
}

