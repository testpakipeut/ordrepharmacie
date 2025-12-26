import Article from '../../models/Article.js';
import Project from '../../models/Project.js';
import Job from '../../models/Job.js';
import logger from '../../config/logger.js';

const BASE_URL = process.env.FRONTEND_URL || 'https://www.cips-tech.ga';

/**
 * Génère le sitemap XML dynamiquement
 */
export const generateSitemap = async (req, res) => {
  try {
    // Récupérer toutes les pages publiques
    const articles = await Article.find({ status: 'published' }).select('slug updatedAt').lean();
    const projects = await Project.find({ published: true }).select('slug updatedAt').lean();
    const jobs = await Job.find({ actif: true }).select('_id updatedAt').lean();

    // Pages statiques
    const staticPages = [
      { url: '', priority: '1.0', changefreq: 'weekly' },
      { url: '/apropos', priority: '0.9', changefreq: 'monthly' },
      { url: '/poles', priority: '0.9', changefreq: 'monthly' },
      { url: '/poles/energie', priority: '0.8', changefreq: 'monthly' },
      { url: '/poles/geospatial', priority: '0.8', changefreq: 'monthly' },
      { url: '/poles/drone', priority: '0.8', changefreq: 'monthly' },
      { url: '/poles/sante', priority: '0.8', changefreq: 'monthly' },
      { url: '/poles/securite', priority: '0.8', changefreq: 'monthly' },
      { url: '/realisations', priority: '0.9', changefreq: 'weekly' },
      { url: '/actualites', priority: '0.9', changefreq: 'daily' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/devis', priority: '0.8', changefreq: 'monthly' },
      { url: '/simulateur', priority: '0.8', changefreq: 'monthly' },
      { url: '/carrieres', priority: '0.8', changefreq: 'weekly' },
      { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    ];

    // Construire le XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    // Pages statiques
    staticPages.forEach(page => {
      const lastmod = new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
    });

    // Articles
    articles.forEach(article => {
      const lastmod = article.updatedAt ? new Date(article.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/actualites/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
    });

    // Projets
    projects.forEach(project => {
      const lastmod = project.updatedAt ? new Date(project.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/realisations/${project.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    // Jobs
    jobs.forEach(job => {
      const lastmod = job.updatedAt ? new Date(job.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>
    <loc>${BASE_URL}/carrieres/${job._id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
`;
    });

    xml += `</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);

    logger.info('Sitemap généré avec succès', { 
      module: 'SEO',
      articles: articles.length,
      projects: projects.length,
      jobs: jobs.length
    });
  } catch (error) {
    logger.error('Erreur génération sitemap', { module: 'SEO', error: error.message });
    res.status(500).json({ error: 'Erreur lors de la génération du sitemap' });
  }
};








