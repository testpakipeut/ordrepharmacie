import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Liste des fichiers images santé
const santeImageFiles = [
  'cabine-teleconsultation-medicale-medispot.jpg',
  'dispositif-medical-compact-medispot.jpg',
  'medispot-examen-corps.jpg',
  'medispot-telecabine-e-sante.jpg',
  'poste-teleconsultation-medispot-premium.jpg',
  'trousse-telemedecine.jpg'
];

// Titres descriptifs pour chaque image
const santeImageTitles = {
  'cabine-teleconsultation-medicale-medispot.jpg': 'Cabine de télconsultation médicale Medispot',
  'dispositif-medical-compact-medispot.jpg': 'Dispositif médical compact Medispot',
  'medispot-examen-corps.jpg': 'Examen médical avec dispositif Medispot',
  'medispot-telecabine-e-sante.jpg': 'Télécabine e-santé Medispot',
  'poste-teleconsultation-medispot-premium.jpg': 'Poste de télconsultation Medispot Premium',
  'trousse-telemedecine.jpg': 'Trousse de télémédecine'
};

// Fonction pour uploader une image
async function uploadImage(filePath, fileName, folder, publicId) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return null;
    }

    const fullPublicId = `cips/poles/${folder}/${publicId}`;
    
    // Vérifier d'abord si l'image existe déjà
    try {
      console.log(`\n🔍 Vérification de l'existence de ${fileName}...`);
      const existing = await cloudinary.api.resource(fullPublicId);
      console.log(`✅ ${fileName} existe déjà sur Cloudinary`);
      console.log(`   URL: ${existing.secure_url}`);
      console.log(`   Public ID: ${existing.public_id}`);
      return {
        fileName,
        url: existing.secure_url,
        publicId: existing.public_id,
        width: existing.width,
        height: existing.height,
        title: santeImageTitles[fileName] || fileName
      };
    } catch (checkError) {
      // L'image n'existe pas, on va l'uploader
      if (checkError.http_code === 404 || checkError.error?.http_code === 404) {
        const stats = fs.statSync(filePath);
        const fileSizeMB = stats.size / (1024 * 1024);
        console.log(`📤 Upload de ${fileName} (${fileSizeMB.toFixed(2)} MB)...`);

        const result = await cloudinary.uploader.upload(filePath, {
          folder: `cips/poles/${folder}`,
          public_id: publicId,
          resource_type: 'image',
          overwrite: false,
          invalidate: true
        });

        console.log(`✅ ${fileName} uploadé avec succès`);
        console.log(`   URL: ${result.secure_url}`);
        console.log(`   Public ID: ${result.public_id}`);

        return {
          fileName,
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          title: santeImageTitles[fileName] || fileName
        };
      } else {
        throw checkError;
      }
    }
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${fileName}:`, error.message || error);
    return null;
  }
}

async function uploadAllSanteImages() {
  console.log('🏥 === UPLOAD IMAGES SANTE CONNECTEE ===\n');

  // Chemin vers le dossier des images
  const imagesDir = path.join(__dirname, '../../../frontend/public/sante_connecte');

  if (!fs.existsSync(imagesDir)) {
    console.error(`❌ Le dossier ${imagesDir} n'existe pas !`);
    process.exit(1);
  }

  const uploadedImages = [];

  for (let i = 0; i < santeImageFiles.length; i++) {
    const fileName = santeImageFiles[i];
    const filePath = path.join(imagesDir, fileName);
    
    // Générer un public_id propre (sans extension, avec tirets)
    const publicId = fileName
      .replace(/\.(jpg|jpeg|png)$/i, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const result = await uploadImage(filePath, fileName, 'sante', publicId);
    
    if (result) {
      uploadedImages.push({
        id: i + 1,
        path: result.url,
        title: result.title
      });
    }

    // Petite pause entre les uploads
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 === RESUME ===');
  console.log(`✅ ${uploadedImages.length} image(s) traitée(s) avec succès\n`);

  console.log('📋 Code à ajouter dans frontend/src/config/polesImages.ts :\n');
  console.log('export const santeImages = [');
  uploadedImages.forEach((img, index) => {
    const comma = index < uploadedImages.length - 1 ? ',' : '';
    console.log(`  { id: ${img.id}, path: '${img.path}', title: '${img.title}' }${comma}`);
  });
  console.log('];\n');

  return uploadedImages;
}

// Exécuter le script
uploadAllSanteImages()
  .then(() => {
    console.log('✅ Upload terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'upload:', error);
    process.exit(1);
  });

