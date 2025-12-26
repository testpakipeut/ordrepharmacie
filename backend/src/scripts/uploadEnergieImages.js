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

const ENERGIE_DIR = path.join(__dirname, '../../../frontend/public/pole-energie-images');

// Fonction pour supprimer toutes les images du dossier energie sur Cloudinary
async function deleteAllEnergieImages() {
  try {
    console.log('🗑️  Suppression des anciennes images du pôle énergie sur Cloudinary...\n');
    
    // Lister toutes les ressources dans le dossier energie
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'cips/poles/energie/',
      max_results: 500
    });

    if (result.resources && result.resources.length > 0) {
      console.log(`📋 ${result.resources.length} images trouvées à supprimer\n`);
      
      for (const resource of result.resources) {
        try {
          await cloudinary.uploader.destroy(resource.public_id);
          console.log(`✅ Supprimé: ${resource.public_id}`);
        } catch (error) {
          console.error(`❌ Erreur lors de la suppression de ${resource.public_id}:`, error.message);
        }
      }
      
      console.log(`\n✅ ${result.resources.length} images supprimées\n`);
    } else {
      console.log('ℹ️  Aucune image à supprimer\n');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la suppression des images:', error.message);
    throw error;
  }
}

async function uploadImage(filePath, fileName, publicId, overwrite = true) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return null;
    }

    const fullPublicId = `cips/poles/energie/${publicId}`;
    
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    console.log(`📤 Upload de ${fileName} (${fileSizeMB.toFixed(2)} MB) -> ${publicId}...`);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'cips/poles/energie',
      public_id: publicId,
      resource_type: 'image',
      overwrite: overwrite,
      invalidate: true
    });

    console.log(`✅ ${fileName} uploadé avec succès`);
    console.log(`   URL: ${result.secure_url}`);

    return {
      fileName,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    console.error(`❌ Erreur lors du traitement de ${fileName}:`, error.message || error);
    return null;
  }
}

async function uploadAllEnergieImages() {
  console.log('🔋 === UPLOAD IMAGES ENERGIE ===\n');
  
  if (!fs.existsSync(ENERGIE_DIR)) {
    console.error(`❌ Dossier non trouvé: ${ENERGIE_DIR}`);
    return { groupesElectrogenes: [], panneauxSolaires: [] };
  }

  const files = fs.readdirSync(ENERGIE_DIR);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  console.log(`📁 ${imageFiles.length} images trouvées dans le dossier\n`);

  // Séparer les groupes électrogènes et les panneaux solaires
  const groupesElectrogenes = [];
  const panneauxSolaires = [];

  for (const fileName of imageFiles) {
    const filePath = path.join(ENERGIE_DIR, fileName);
    
    // Vérifier si c'est un groupe électrogène
    if (fileName.toLowerCase().includes('electrogene')) {
      groupesElectrogenes.push({ fileName, filePath });
    } else {
      // C'est un panneau solaire
      panneauxSolaires.push({ fileName, filePath });
    }
  }

  // Trier les groupes électrogènes par numéro
  groupesElectrogenes.sort((a, b) => {
    const numA = parseInt(a.fileName.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.fileName.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  // Trier les panneaux solaires par numéro
  panneauxSolaires.sort((a, b) => {
    const numA = parseInt(a.fileName.match(/\d+/)?.[0] || '0');
    const numB = parseInt(b.fileName.match(/\d+/)?.[0] || '0');
    return numA - numB;
  });

  console.log(`⚡ Groupes électrogènes: ${groupesElectrogenes.length}`);
  console.log(`☀️  Panneaux solaires: ${panneauxSolaires.length}\n`);

  const groupesElectrogenesResults = [];
  const panneauxSolairesResults = [];

  // Upload des groupes électrogènes
  console.log('⚡ === UPLOAD GROUPES ÉLECTROGÈNES ===\n');
  for (let i = 0; i < groupesElectrogenes.length; i++) {
    const { fileName, filePath } = groupesElectrogenes[i];
    const publicId = `image-electrogene-${i + 1}`;
    
    const result = await uploadImage(filePath, fileName, publicId);
    if (result) {
      groupesElectrogenesResults.push({
        id: i + 1,
        path: result.url,
        title: `Groupe électrogène ${i + 1}`,
        originalPath: `/pole-energie-images/${fileName}`
      });
    }

    // Délai de 2 secondes entre chaque upload
    if (i < groupesElectrogenes.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Upload des panneaux solaires
  console.log('\n☀️  === UPLOAD PANNEAUX SOLAIRES ===\n');
  for (let i = 0; i < panneauxSolaires.length; i++) {
    const { fileName, filePath } = panneauxSolaires[i];
    const publicId = `image-${i + 1}`;
    
    const result = await uploadImage(filePath, fileName, publicId);
    if (result) {
      panneauxSolairesResults.push({
        id: i + 1,
        path: result.url,
        title: `Panneau solaire ${i + 1}`,
        originalPath: `/pole-energie-images/${fileName}`
      });
    }

    // Délai de 2 secondes entre chaque upload
    if (i < panneauxSolaires.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return {
    groupesElectrogenes: groupesElectrogenesResults,
    panneauxSolaires: panneauxSolairesResults
  };
}

function updateConfigFile(configPath, groupesElectrogenes, panneauxSolaires) {
  try {
    // Lire le fichier existant
    let content = fs.readFileSync(configPath, 'utf-8');
    
    // Supprimer l'ancienne configuration energieImages si elle existe
    const energieImagesRegex = /export const energieImages = \[[\s\S]*?\];/;
    content = content.replace(energieImagesRegex, '');
    
    // Créer les nouveaux exports
    const groupesElectrogenesExport = `export const groupesElectrogenesImages = [\n${groupesElectrogenes.map(img => `  { id: ${img.id}, path: '${img.path}', title: '${img.title}' },\n`).join('')}];\n`;
    
    const panneauxSolairesExport = `export const panneauxSolairesImages = [\n${panneauxSolaires.map(img => `  { id: ${img.id}, path: '${img.path}', title: '${img.title}' },\n`).join('')}];\n`;
    
    // Combiner les deux tableaux pour energieImages (groupes électrogènes d'abord, puis panneaux solaires)
    const allEnergieImages = [...groupesElectrogenes, ...panneauxSolaires.map((img, idx) => ({
      ...img,
      id: groupesElectrogenes.length + idx + 1
    }))];
    
    const energieImagesExport = `export const energieImages = [\n${allEnergieImages.map(img => `  { id: ${img.id}, path: '${img.path}', title: '${img.title}' },\n`).join('')}];\n`;
    
    // Ajouter à la fin du fichier
    content += '\n' + groupesElectrogenesExport + '\n' + panneauxSolairesExport + '\n' + energieImagesExport;
    
    fs.writeFileSync(configPath, content, 'utf-8');
    console.log(`✅ Fichier de configuration mis à jour: ${configPath}`);
  } catch (error) {
    console.error(`❌ Erreur lors de la mise à jour du fichier de configuration:`, error.message);
  }
}

async function main() {
  try {
    console.log('🚀 Démarrage de l\'upload des images du pôle énergie sur Cloudinary...\n');

    // Supprimer les anciennes images
    await deleteAllEnergieImages();

    // Uploader les nouvelles images
    const { groupesElectrogenes, panneauxSolaires } = await uploadAllEnergieImages();

    console.log('\n📊 === RÉSUMÉ ===\n');
    console.log(`⚡ Groupes électrogènes uploadés: ${groupesElectrogenes.length}`);
    console.log(`☀️  Panneaux solaires uploadés: ${panneauxSolaires.length}`);
    console.log(`📦 Total: ${groupesElectrogenes.length + panneauxSolaires.length} images`);

    // Sauvegarder les résultats dans un fichier JSON
    const outputPath = path.join(__dirname, 'energie-images-cloudinary.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      groupesElectrogenes,
      panneauxSolaires,
      uploadedAt: new Date().toISOString()
    }, null, 2));

    console.log(`\n💾 Résultats sauvegardés dans: ${outputPath}`);
    
    // Mettre à jour le fichier de configuration frontend
    const configPath = path.join(__dirname, '../../../frontend/src/config/polesImages.ts');
    updateConfigFile(configPath, groupesElectrogenes, panneauxSolaires);
    
    console.log('\n✅ Upload terminé avec succès!\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'upload:', error);
    process.exit(1);
  }
}

main();
