import express from 'express';
import { generateSitemap } from './seoController.js';

const router = express.Router();

// Route publique pour le sitemap
router.get('/sitemap.xml', generateSitemap);

export default router;








