import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

// Configuration Cloudinary avec fallback
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drbaadexk',
  api_key: process.env.CLOUDINARY_API_KEY || '457493447798734',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'gF0S2j2A_W2IqZ1MaZBtPPrb2BQ'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des dossiers
const PUBLIC_DIR = path.join(__dirname, '../../../frontend/public');
const DRONE_DIR = path.join(PUBLIC_DIR, 'wetransfer_dsc00122-jpg_2025-11-06_1238');
const GEOSPATIAL_DIR = path.join(PUBLIC_DIR, 'Contenue visuel pole TGS - Recadres');

// Images drone
const droneImages = [
  '_DSC0252_copie.jpg',
  'awendje.jpg',
  'DJI_0941_copie.jpg',
  'DJI_20250118120544_0171_D_copie.jpg',
  'DSC00122.jpg',
  'DSC00134.jpg',
  'DSC00154.jpg',
  'DSC00168.jpg',
  'DSC00181.jpg',
  'DSC00187.jpg',
  'IMG_3166.JPG',
  'IMG_3167.JPG',
  'inspection-DJI_20250719194640_0016_D.jpg',
  'mavic3-entreprise.jpg',
  'org_aa66f3d6f495b6a3_1636717610000_copie.jpg',
  'surveillance-DJI_20250807173856_0048_V.jpg'
];

// Images géospatial
const geospatialImages = [
  '1.jpg',
  '2.jpg',
  '3.jpg',
  '4.jpg',
  '5.jpg',
  '6.jpg',
  '7.jpg',
  '8.jpg',
  '9.jpg',
  '10.jpg',
  '11.jpg',
  '12.jpg',
  '13.jpg',
  '14.jpg',
  '15.jpg',
  '16.jpg'
];

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
        height: existing.height
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
          height: result.height
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

async function uploadDroneImages() {
  console.log('\n🚁 === UPLOAD IMAGES DRONE ===\n');
  const results = [];

  for (let i = 0; i < droneImages.length; i++) {
    const fileName = droneImages[i];
    const filePath = path.join(DRONE_DIR, fileName);
    const publicId = `drone-${i + 1}`;
    
    const result = await uploadImage(filePath, fileName, 'drone', publicId);
    if (result) {
      results.push({
        id: i + 1,
        path: result.url,
        title: `Drone ${i + 1}`,
        originalPath: `/wetransfer_dsc00122-jpg_2025-11-06_1238/${fileName}`
      });
    }

    // Délai de 2 secondes entre chaque upload pour éviter de surcharger l'API
    if (i < droneImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

async function uploadGeospatialImages() {
  console.log('\n🗺️  === UPLOAD IMAGES GEOSPATIAL ===\n');
  const results = [];

  for (let i = 0; i < geospatialImages.length; i++) {
    const fileName = geospatialImages[i];
    const filePath = path.join(GEOSPATIAL_DIR, fileName);
    const publicId = `geospatial-${i + 1}`;
    
    const result = await uploadImage(filePath, fileName, 'geospatial', publicId);
    if (result) {
      results.push({
        id: i + 1,
        path: result.url,
        title: `Orthophotographie ${i + 1}`,
        originalPath: `/Contenue visuel pole TGS - Recadres/${fileName}`
      });
    }

    // Délai de 2 secondes entre chaque upload pour éviter de surcharger l'API
    if (i < geospatialImages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return results;
}

function updateConfigFile(configPath, droneResults, geospatialResults) {
  try {
    let content = `/**
 * Configuration des images des pôles sur Cloudinary
 * Les URLs sont générées automatiquement depuis Cloudinary
 * Format: URL complète Cloudinary pour optimisation
 */

export const droneImages = [
`;

    // Ajouter les images drone
    droneResults.forEach((img) => {
      if (img && img.url) {
        content += `  { id: ${img.id}, path: '${img.url}', title: '${img.title}' },\n`;
      }
    });

    content += `];

export const geospatialImages = [
`;

    // Ajouter les images géospatial
    geospatialResults.forEach((img) => {
      if (img && img.url) {
        content += `  { id: ${img.id}, path: '${img.url}', title: '${img.title}' },\n`;
      }
    });

    content += `];
`;

    fs.writeFileSync(configPath, content, 'utf-8');
    console.log(`✅ Fichier de configuration mis à jour: ${configPath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du fichier de configuration:`, error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Démarrage de l\'upload des images des pôles sur Cloudinary...\n');

    const droneResults = await uploadDroneImages();
    const geospatialResults = await uploadGeospatialImages();

    console.log('\n📊 === RÉSUMÉ ===\n');
    console.log(`✅ Images drone uploadées: ${droneResults.length}/${droneImages.length}`);
    console.log(`✅ Images géospatial uploadées: ${geospatialResults.length}/${geospatialImages.length}`);

    // Sauvegarder les résultats dans un fichier JSON
    const outputPath = path.join(__dirname, 'poles-images-cloudinary.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      drone: droneResults,
      geospatial: geospatialResults,
      uploadedAt: new Date().toISOString()
    }, null, 2));

    console.log(`\n💾 Résultats sauvegardés dans: ${outputPath}`);
    
    // Mettre à jour le fichier de configuration frontend
    const configPath = path.join(__dirname, '../../../frontend/src/config/polesImages.ts');
    updateConfigFile(configPath, droneResults, geospatialResults);
    
    console.log('\n✅ Upload terminé avec succès!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'upload:', error);
    process.exit(1);
  }
}

main();

