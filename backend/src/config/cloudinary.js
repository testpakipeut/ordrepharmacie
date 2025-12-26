import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Désactiver l'auto-chargement depuis CLOUDINARY_URL pour éviter les erreurs
// et forcer l'utilisation des variables individuelles
if (process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_URL.startsWith('cloudinary://')) {
  // Si CLOUDINARY_URL existe mais n'est pas au bon format, on la supprime temporairement
  delete process.env.CLOUDINARY_URL;
}

// Configuration Cloudinary avec les variables individuelles
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage pour les images d'articles
const articleStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cips/articles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1200, height: 630, crop: 'limit' }, // Optimisé pour Open Graph
      { quality: 'auto' }
    ]
  }
});

// Storage pour les images de jobs
const jobStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cips/jobs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Storage pour les images de projets
const projectStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cips/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Multer middleware pour articles
export const uploadArticleImage = multer({
  storage: articleStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

// Multer middleware pour jobs
export const uploadJobImage = multer({
  storage: jobStorage,
  limits: {
    fileSize: 3 * 1024 * 1024 // 3MB max
  }
});

// Multer middleware pour projets
export const uploadProjectImages = multer({
  storage: projectStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Fonction helper pour supprimer une image
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw error;
  }
};

// Fonction helper pour extraire le public_id d'une URL Cloudinary
export const extractPublicId = (url) => {
  try {
    const parts = url.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts.slice(parts.indexOf('upload') + 2, -1).join('/');
    return folder ? `${folder}/${publicId}` : publicId;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du public_id:', error);
    return null;
  }
};

export default cloudinary;

