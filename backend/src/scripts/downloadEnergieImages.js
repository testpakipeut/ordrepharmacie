import puppeteer from 'puppeteer';
import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../../../frontend/public');
const ENERGIE_DIR = path.join(PUBLIC_DIR, 'pole-energie-images');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(ENERGIE_DIR)) {
  fs.mkdirSync(ENERGIE_DIR, { recursive: true });
}

// Pages à scraper
const pagesToScrape = [
  {
    url: 'https://pegasuspower.it/groupes-electrogenes-2/',
    site: 'pegasus',
    prefix: 'pegasus'
  },
  {
    url: 'https://gienergy.ma/',
    site: 'gienergy',
    prefix: 'gienergy'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Convertir URL relative en absolue si nécessaire
    if (url.startsWith('//')) {
      url = 'https:' + url;
    } else if (url.startsWith('/')) {
      // URL relative - on ne peut pas la télécharger sans la base URL
      reject(new Error(`URL relative non supportée: ${url}`));
      return;
    }

    const client = url.startsWith('https') ? https : http;
    
    // Options pour ignorer les certificats auto-signés
    const options = url.startsWith('https') ? {
      rejectUnauthorized: false
    } : {};
    
    const request = client.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 303 || response.statusCode === 307 || response.statusCode === 308) {
        // Suivre les redirections
        response.destroy();
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        response.destroy();
        reject(new Error(`Échec du téléchargement: ${response.statusCode} ${url}`));
        return;
      }

      // Vérifier le Content-Type
      const contentType = response.headers['content-type'] || '';
      if (!contentType.startsWith('image/')) {
        response.destroy();
        reject(new Error(`URL ne pointe pas vers une image: ${contentType}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        if (fs.existsSync(filepath)) {
          const stats = fs.statSync(filepath);
          const sizeMB = stats.size / (1024 * 1024);
          const sizeKB = stats.size / 1024;
          // Filtrer les images trop petites (moins de 5KB probablement des placeholders)
          if (stats.size > 5000) {
            console.log(`✅ ${path.basename(filepath)} téléchargé (${sizeKB.toFixed(1)} KB)`);
            resolve(filepath);
          } else {
            fs.unlink(filepath, () => {});
            reject(new Error(`Image trop petite (${sizeKB.toFixed(1)} KB) - probablement un placeholder`));
          }
        } else {
          reject(new Error('Fichier non créé'));
        }
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function extractImagesFromPage(pageUrl, site, prefix) {
  console.log(`\n🔍 Extraction des images depuis ${pageUrl}...`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Extraire toutes les URLs d'images
    const imageUrls = await page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .map(img => {
          // Essayer srcset d'abord, puis src
          let url = img.srcset ? img.srcset.split(',')[0].trim().split(' ')[0] : img.src;
          // Nettoyer l'URL
          if (url) {
            url = url.split('?')[0]; // Retirer les query params
            // Filtrer les images trop petites ou icônes
            if (url.includes('icon') || url.includes('logo') || url.includes('avatar')) {
              return null;
            }
          }
          return url;
        })
        .filter(url => url && url.startsWith('http'))
        .filter((url, index, self) => self.indexOf(url) === index); // Dédupliquer
    });
    
    console.log(`📸 ${imageUrls.length} images trouvées`);
    
    await browser.close();
    
    // Filtrer pour garder seulement les bonnes images
    const validImages = imageUrls
      .filter(url => {
        const ext = url.toLowerCase().split('.').pop();
        return ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
      })
      .filter(url => {
        // Filtrer les images trop petites (probablement des icônes)
        return !url.includes('32x32') && !url.includes('64x64') && !url.includes('96x96');
      })
      .slice(0, 9); // Limiter à 9 images
    
    return validImages;
  } catch (error) {
    await browser.close();
    console.error(`❌ Erreur lors de l'extraction:`, error.message);
    return [];
  }
}

async function downloadAllImages() {
  console.log('🔋 Téléchargement des images pour le pôle énergie...\n');
  
  const allImageUrls = [];
  
  // Extraire les images de chaque page
  for (const page of pagesToScrape) {
    const urls = await extractImagesFromPage(page.url, page.site, page.prefix);
    urls.forEach((url, index) => {
      allImageUrls.push({
        url,
        prefix: page.prefix,
        index: allImageUrls.length
      });
    });
  }
  
  console.log(`\n📥 Téléchargement de ${allImageUrls.length} images...\n`);
  
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < allImageUrls.length && successCount < 9; i++) {
    const image = allImageUrls[i];
    const ext = image.url.toLowerCase().split('.').pop().split('?')[0] || 'jpg';
    const filename = `${image.prefix}-${image.index + 1}.${ext}`;
    const filepath = path.join(ENERGIE_DIR, filename);
    
    try {
      console.log(`📥 Téléchargement ${successCount + 1}/9: ${filename}...`);
      await downloadImage(image.url, filepath);
      results.push({
        id: successCount + 1,
        path: `/pole-energie-images/${filename}`,
        title: `Image ${successCount + 1} - ${image.prefix}`,
        originalUrl: image.url
      });
      successCount++;
    } catch (error) {
      console.error(`❌ Erreur pour ${filename}:`, error.message);
    }
    
    // Délai entre les téléchargements
    if (i < allImageUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  console.log(`\n✅ ${results.length} images téléchargées`);
  console.log(`📁 Dossier: ${ENERGIE_DIR}`);
  
  return results;
}

async function main() {
  try {
    await downloadAllImages();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

main();

