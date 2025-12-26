import express from 'express';
import { uploadArticleImage, uploadJobImage, uploadProjectImages } from '../../config/cloudinary.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Upload image pour article
router.post('/article', protect, uploadArticleImage.single('image'), (req, res) => {
  try {
    console.log('📤 [UPLOAD] Requête reçue');
    console.log('👤 [UPLOAD] Utilisateur:', req.user?.username);
    console.log('📁 [UPLOAD] Fichier:', req.file ? 'Présent' : 'Absent');

    if (!req.file) {
      console.log('❌ [UPLOAD] Aucun fichier');
      return res.status(400).json({
        success: false,
        error: 'Aucune image fournie'
      });
    }

    console.log('✅ [UPLOAD] Image uploadée:', req.file.path);
    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  } catch (error) {
    console.error('❌ [UPLOAD] Erreur:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
});

// Upload image pour job
router.post('/job', protect, uploadJobImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image fournie'
      });
    }

    res.json({
      success: true,
      message: 'Image uploadée avec succès',
      data: {
        url: req.file.path,
        publicId: req.file.filename
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload de l\'image'
    });
  }
});

// Upload images pour projet (multiple)
router.post('/project', protect, uploadProjectImages.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucune image fournie'
      });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename
    }));

    res.json({
      success: true,
      message: `${images.length} image(s) uploadée(s) avec succès`,
      data: { images }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'upload des images'
    });
  }
});

export default router;

