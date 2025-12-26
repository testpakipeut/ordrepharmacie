import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drbaadexk',
  api_key: process.env.CLOUDINARY_API_KEY || '457493447798734',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'gF0S2j2A_W2IqZ1MaZBtPPrb2BQ'
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration des dossiers
const PUBLIC_DIR = path.join(__dirname, '../../../frontend/public');
const GEOSPATIAL_DIR = path.join(PUBLIC_DIR, 'wetransfer_banque-image-pole-energie_2025-11-19_1305');
const ENERGIE_DIR = path.join(PUBLIC_DIR, 'wetransfer_banque-image-pole-energie_2025-11-19_1305', 'banque image pole energie');

// Images géospatiales (les premières dans le dossier principal)
const geospatialImageFiles = [
  '_Survey drone flying above a Gabonese landscape, capturing high-resolution geospatial data, aerial perspective, lush green environment.jpg',
  'Diverse professional geospatial team taking topographic measurements in Gabon, collaborative atmosphere, modern equipment, warm lighting.jpg',
  'Geospatial engineer analyzing terrain with a GNSS device in Gabon\'s forested area, natural colors, documentary photography style..jpg',
  'Team of geospatial surveyors in Gabon using total stations and GPS equipment in tropical vegetation, professional uniforms, clear sky, high-resolution, dynamic field work scene.jpg',
  'Topography team performing coastal elevation survey on a Gabon beach, waves behind, measuring instruments, reflective vests, realism and precision..jpg'
];

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

// Uploader les images géospatiales
async function uploadGeospatialImages() {
  console.log('\n🌍 === UPLOAD DES IMAGES GÉOSPATIALES ===\n');
  
  const results = [];
  let nextId = 17; // Commencer après le dernier ID existant (16)
  
  for (const fileName of geospatialImageFiles) {
    const filePath = path.join(GEOSPATIAL_DIR, fileName);
    const publicId = `geospatial-${nextId}`;
    
    const result = await uploadImage(filePath, fileName, 'geospatial', publicId);
    if (result) {
      results.push({
        id: nextId,
        path: result.url,
        title: `Géospatial ${nextId}`
      });
      nextId++;
    }
    
    // Petite pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// Uploader les images énergie
async function uploadEnergieImages() {
  console.log('\n⚡ === UPLOAD DES IMAGES ÉNERGIE ===\n');
  
  if (!fs.existsSync(ENERGIE_DIR)) {
    console.log(`⚠️  Dossier non trouvé: ${ENERGIE_DIR}`);
    return [];
  }
  
  const files = fs.readdirSync(ENERGIE_DIR).filter(file => 
    file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')
  );
  
  console.log(`📁 ${files.length} fichiers trouvés dans le dossier énergie\n`);
  
  const results = [];
  let nextId = 1; // Commencer à 1 pour les nouvelles images énergie
  
  for (const fileName of files) {
    const filePath = path.join(ENERGIE_DIR, fileName);
    // Créer un public_id propre à partir du nom de fichier
    const cleanName = fileName
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase()
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const publicId = `energie-${cleanName}`;
    
    const result = await uploadImage(filePath, fileName, 'energie', publicId);
    if (result) {
      results.push({
        id: nextId,
        path: result.url,
        title: `Énergie ${nextId}`
      });
      nextId++;
    }
    
    // Petite pause pour éviter de surcharger l'API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

// Fonction principale
async function main() {
  try {
    console.log('🚀 Démarrage de l\'upload des nouvelles images...\n');
    
    // Uploader les images géospatiales
    const geospatialResults = await uploadGeospatialImages();
    
    // Uploader les images énergie
    const energieResults = await uploadEnergieImages();
    
    // Afficher les résultats
    console.log('\n\n📊 === RÉSULTATS ===\n');
    console.log(`✅ ${geospatialResults.length} images géospatiales uploadées`);
    console.log(`✅ ${energieResults.length} images énergie uploadées`);
    
    // Générer le code pour polesImages.ts
    console.log('\n\n📝 === CODE POUR polesImages.ts ===\n');
    
    if (geospatialResults.length > 0) {
      console.log('// Nouvelles images géospatiales à ajouter:');
      geospatialResults.forEach(img => {
        console.log(`  { id: ${img.id}, path: '${img.path}', title: '${img.title}' },`);
      });
    }
    
    if (energieResults.length > 0) {
      console.log('\n// Nouvelles images énergie à ajouter AVANT les groupes électrogènes:');
      energieResults.forEach(img => {
        console.log(`  { id: ${img.id}, path: '${img.path}', title: '${img.title}' },`);
      });
    }
    
    console.log('\n✅ Upload terminé avec succès !\n');
  } catch (error) {
    console.error('❌ Erreur lors de l\'upload:', error);
    process.exit(1);
  }
}

main();












