import { BetaAnalyticsDataClient } from '@google-analytics/data';
import AnalyticsSession from '../../models/AnalyticsSession.js';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Analytics');

// Initialiser le client Google Analytics Data API
let analyticsDataClient = null;

const initAnalyticsClient = () => {
  if (analyticsDataClient) return analyticsDataClient;

  // Si les credentials sont dans une variable d'environnement (JSON string)
  if (process.env.GOOGLE_ANALYTICS_CREDENTIALS) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_CREDENTIALS);
      analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
      logger.info('✅ Client Google Analytics initialisé avec credentials env');
    } catch (error) {
      logger.error('❌ Erreur parsing credentials Google Analytics', { error: error.message });
    }
  } else {
    logger.warn('⚠️ Pas de credentials Google Analytics configurés - données de démo seulement');
  }

  return analyticsDataClient;
};

// Récupérer les statistiques du site
export const getAnalyticsStats = async (req, res) => {
  try {
    const { period = '30' } = req.query; // 7, 30, ou 90 jours
    const propertyId = process.env.GA4_PROPERTY_ID;

    if (!propertyId) {
      logger.warn('⚠️ GA4_PROPERTY_ID non configuré');
      return res.json({
        success: false,
        message: 'Google Analytics non configuré'
      });
    }

    const client = initAnalyticsClient();
    
    if (!client) {
      logger.warn('⚠️ Client Google Analytics non initialisé');
      return res.json({
        success: false,
        message: 'Client Analytics non initialisé'
      });
    }

    // Calculer les dates
    const endDate = 'today';
    const startDate = `${period}daysAgo`;

    // Requête principale : visiteurs, pages vues, durée, etc.
    const [mainReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'sessions' },
      ],
    });

    // Requête : Sources de trafic
    const [trafficReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'activeUsers' }],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    });

    // Requête : Pages les plus vues
    const [pagesReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 5,
    });

    // Requête : Conversions (événements personnalisés)
    const [conversionsReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: {
            values: ['submit_quote_form', 'submit_contact_form', 'simulation_completed']
          }
        }
      },
    });

    // Requête : Appareils (Mobile vs Desktop)
    const [devicesReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'activeUsers' }],
    });

    // Requête : Google Ads - Mots-clés (si Google Ads lié)
    const [adsReport] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'googleAdsQuery' }, // Mot-clé recherché
        { name: 'googleAdsCampaignName' } // Nom campagne
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'conversions' },
        { name: 'googleAdsAdCost' }
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: 10,
    }).catch(() => ({ rows: [] })); // Ignore si pas de Google Ads

    // Formater les données
    const stats = formatAnalyticsData(
      mainReport,
      trafficReport,
      pagesReport,
      conversionsReport,
      devicesReport,
      adsReport
    );

    res.json({
      success: true,
      demo: false,
      data: stats
    });

  } catch (error) {
    logger.error('❌ Erreur récupération stats Google Analytics', { error: error.message, stack: error.stack });
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des stats Google Analytics',
      error: error.message
    });
  }
};

// Formater les données Google Analytics
const formatAnalyticsData = (mainReport, trafficReport, pagesReport, conversionsReport, devicesReport, adsReport) => {
  const mainRow = mainReport.rows?.[0];
  
  // Données principales
  const visitors = parseInt(mainRow?.metricValues?.[0]?.value || '0');
  const pageViews = parseInt(mainRow?.metricValues?.[1]?.value || '0');
  const avgDuration = parseInt(mainRow?.metricValues?.[2]?.value || '0');
  const sessions = parseInt(mainRow?.metricValues?.[3]?.value || '0');

  // Formater durée (secondes → minutes:secondes)
  const minutes = Math.floor(avgDuration / 60);
  const seconds = avgDuration % 60;
  const avgDurationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Sources de trafic
  const trafficSources = trafficReport.rows?.map(row => ({
    source: row.dimensionValues[0].value,
    medium: row.dimensionValues[1].value,
    users: parseInt(row.metricValues[0].value)
  })) || [];

  // Pages les plus vues
  const topPages = pagesReport.rows?.map(row => ({
    page: row.dimensionValues[0].value,
    views: parseInt(row.metricValues[0].value)
  })) || [];

  // Conversions
  const conversionData = {
    devis: 0,
    contacts: 0,
    simulations: 0
  };

  conversionsReport.rows?.forEach(row => {
    const eventName = row.dimensionValues[0].value;
    const count = parseInt(row.metricValues[0].value);
    
    if (eventName === 'submit_quote_form') conversionData.devis = count;
    if (eventName === 'submit_contact_form') conversionData.contacts = count;
    if (eventName === 'simulation_completed') conversionData.simulations = count;
  });

  // Appareils (Mobile %)
  const totalUsers = devicesReport.rows?.reduce((sum, row) => 
    sum + parseInt(row.metricValues[0].value), 0) || 1;
  
  const mobileUsers = devicesReport.rows?.find(row => 
    row.dimensionValues[0].value === 'mobile')?.metricValues[0].value || '0';
  
  const mobilePercentage = Math.round((parseInt(mobileUsers) / totalUsers) * 100);

  // Google Ads - Mots-clés et campagnes
  const adsKeywords = adsReport.rows?.map(row => ({
    keyword: row.dimensionValues[0].value,
    campaign: row.dimensionValues[1].value,
    users: parseInt(row.metricValues[0].value),
    conversions: parseInt(row.metricValues[1].value),
    cost: parseFloat(row.metricValues[2].value)
  })) || [];

  return {
    visitors,
    pageViews,
    avgDuration: avgDurationFormatted,
    mobilePercentage,
    sessions,
    conversions: conversionData,
    topPages,
    trafficSources,
    adsKeywords // ← MOTS-CLÉS PUBLICITÉS !
  };
};

// Fonction getMockData supprimée - Pas de données fictives

// ============================================================
// NOUVELLES ROUTES : ANALYTICS DÉTAILLÉES (Notre propre système)
// ============================================================

// Géolocalisation par IP (gratuit, sans clé API)
const getLocationFromIP = async (ip) => {
  try {
    // Nettoyer l'IP (enlever le préfixe ::ffff: si présent)
    const cleanIP = ip ? ip.replace('::ffff:', '') : null;
    
    logger.debug(`🔍 Tentative géolocalisation IP: ${cleanIP}`);
    
    // Ignorer les IPs locales et privées
    if (!cleanIP || 
        cleanIP === '::1' || 
        cleanIP === '127.0.0.1' || 
        cleanIP.startsWith('192.168.') || 
        cleanIP.startsWith('10.') ||
        cleanIP.startsWith('172.16.') ||
        cleanIP.startsWith('100.64.')) { // Carrier-grade NAT
      logger.debug(`⚠️ IP privée/locale ignorée: ${cleanIP}`);
      return null;
    }

    // Utiliser ip-api.com (gratuit, 45 requêtes/minute, pas de clé API nécessaire)
    const url = `http://ip-api.com/json/${cleanIP}?fields=status,country,countryCode,region,city`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    logger.debug(`🌐 Réponse ip-api:`, { ip: cleanIP, data });
    
    if (data.status === 'success') {
      logger.info(`✅ Géolocalisation réussie: ${data.city}, ${data.country}`, { ip: cleanIP, city: data.city, country: data.country });
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.region,
        city: data.city
      };
    } else {
      logger.warn(`❌ Géolocalisation échouée`, { ip: cleanIP, message: data.message });
    }
  } catch (error) {
    logger.error('❌ Erreur géolocalisation IP', { ip, error: error.message });
  }
  return null;
};

// Créer ou mettre à jour une session
export const trackSession = async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      landingPage,
      referrer,
      utmParams,
      device,
      location,
      screen,
      pageView,
      event,
      heartbeat,      // 🔥 NOUVEAU : Ping régulier
      endSession      // 🔥 NOUVEAU : Terminer la session
    } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId est requis'
      });
    }

    // Chercher la session existante
    let session = await AnalyticsSession.findOne({ sessionId });

    if (!session) {
      // Obtenir la VRAIE IP publique (derrière reverse proxy Railway)
      let clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;
      
      // Si x-forwarded-for contient plusieurs IPs (proxy chain), prendre la première
      if (clientIP && clientIP.includes(',')) {
        clientIP = clientIP.split(',')[0].trim();
      }
      
      const geoLocation = await getLocationFromIP(clientIP);
      
      // Fusionner la localisation du frontend avec la géolocalisation IP
      const mergedLocation = {
        ...location,
        ...geoLocation, // Écrase avec les données IP (pays, ville)
        timezone: location?.timezone,
        language: location?.language
      };

      // Créer nouvelle session
      session = new AnalyticsSession({
        sessionId,
        userId,
        landingPage: landingPage || '/',
        referrer: referrer || '(direct)',
        utmSource: utmParams?.source,
        utmMedium: utmParams?.medium,
        utmCampaign: utmParams?.campaign,
        utmTerm: utmParams?.term,
        utmContent: utmParams?.content,
        device: device || {},
        location: mergedLocation || {},
        screen: screen || {},
        network: {
          ip: clientIP
        }
      });
    }

    // 🔥 HEARTBEAT : Juste mettre à jour lastActivityAt
    if (heartbeat) {
      session.lastActivityAt = new Date();
      await session.save();
      return res.json({
        success: true,
        message: 'Heartbeat enregistré',
        sessionId: session.sessionId
      });
    }

    // 🔥 END SESSION : Terminer la session
    if (endSession) {
      await session.endSession();
      return res.json({
        success: true,
        message: 'Session terminée',
        sessionId: session.sessionId
      });
    }

    // Ajouter une page vue si fournie
    if (pageView) {
      await session.addPageView(pageView);
    }

    // Ajouter un événement si fourni
    if (event) {
      await session.addEvent(event);
    }

    // Si pas de pageView ni event, juste sauvegarder (update lastActivity)
    if (!pageView && !event) {
      session.lastActivityAt = new Date();
      await session.save();
    }

    res.json({
      success: true,
      message: 'Session trackée avec succès',
      sessionId: session.sessionId
    });

  } catch (error) {
    logger.error('❌ Erreur track session', { sessionId: req.body?.sessionId || 'unknown', error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors du tracking de la session',
      error: error.message
    });
  }
};

// Récupérer les analytics détaillées
export const getDetailedAnalytics = async (req, res) => {
  try {
    const { period = '30', limit = 100 } = req.query;

    // 🔥 CLEANUP AUTOMATIQUE : Nettoyer les sessions mortes avant l'analyse
    await AnalyticsSession.cleanupInactiveSessions();

    // Calculer la date de début
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Récupérer toutes les sessions de la période
    const sessions = await AnalyticsSession.find({
      startedAt: { $gte: startDate }
    })
      .sort({ startedAt: -1 })
      .limit(parseInt(limit));

    // Statistiques globales
    const totalSessions = sessions.length;
    const totalPageViews = sessions.reduce((sum, s) => sum + s.stats.totalPageViews, 0);
    const totalTimeSpent = sessions.reduce((sum, s) => sum + s.stats.totalTimeSpent, 0);
    const avgTimePerSession = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;

    // Répartition par pays
    const countryStats = {};
    sessions.forEach(s => {
      const country = s.location.country || 'Inconnu';
      countryStats[country] = (countryStats[country] || 0) + 1;
    });
    const topCountries = Object.entries(countryStats)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Répartition par ville
    const cityStats = {};
    sessions.forEach(s => {
      if (s.location.city) {
        const city = `${s.location.city}, ${s.location.country || ''}`;
        cityStats[city] = (cityStats[city] || 0) + 1;
      }
    });
    const topCities = Object.entries(cityStats)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Répartition par appareil
    const deviceStats = {};
    sessions.forEach(s => {
      const deviceType = s.device.type || 'desktop';
      deviceStats[deviceType] = (deviceStats[deviceType] || 0) + 1;
    });

    // Répartition par navigateur
    const browserStats = {};
    sessions.forEach(s => {
      const browser = s.device.browser || 'Inconnu';
      browserStats[browser] = (browserStats[browser] || 0) + 1;
    });
    const topBrowsers = Object.entries(browserStats)
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Répartition par OS
    const osStats = {};
    sessions.forEach(s => {
      const os = s.device.os || 'Inconnu';
      osStats[os] = (osStats[os] || 0) + 1;
    });
    const topOS = Object.entries(osStats)
      .map(([os, count]) => ({ os, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sources de trafic (referrers)
    const referrerStats = {};
    sessions.forEach(s => {
      const ref = s.referrer || '(direct)';
      referrerStats[ref] = (referrerStats[ref] || 0) + 1;
    });
    const topReferrers = Object.entries(referrerStats)
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Pages les plus vues
    const pageStats = {};
    sessions.forEach(s => {
      s.pageViews.forEach(pv => {
        pageStats[pv.path] = (pageStats[pv.path] || 0) + 1;
      });
    });
    const topPages = Object.entries(pageStats)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Temps moyen par page
    const pageTimeStats = {};
    const pageTimeCount = {};
    sessions.forEach(s => {
      s.pageViews.forEach(pv => {
        if (pv.timeSpent > 0) {
          pageTimeStats[pv.path] = (pageTimeStats[pv.path] || 0) + pv.timeSpent;
          pageTimeCount[pv.path] = (pageTimeCount[pv.path] || 0) + 1;
        }
      });
    });
    const avgTimePerPage = Object.entries(pageTimeStats)
      .map(([page, totalTime]) => ({
        page,
        avgTime: Math.round(totalTime / pageTimeCount[page])
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 10);

    // Liste des sessions récentes (pour debug/monitoring)
    const recentSessions = sessions.slice(0, 20).map(s => ({
      sessionId: s.sessionId,
      startedAt: s.startedAt,
      country: s.location.country,
      city: s.location.city,
      device: s.device.type,
      browser: s.device.browser,
      referrer: s.referrer,
      pageViews: s.stats.totalPageViews,
      timeSpent: s.stats.totalTimeSpent
    }));

    // Retourner toutes les stats
    res.json({
      success: true,
      period: parseInt(period),
      summary: {
        totalSessions,
        totalPageViews,
        avgTimePerSession,
        totalTimeSpent
      },
      geography: {
        countries: topCountries,
        cities: topCities
      },
      technology: {
        devices: deviceStats,
        browsers: topBrowsers,
        operatingSystems: topOS
      },
      traffic: {
        referrers: topReferrers
      },
      content: {
        topPages,
        avgTimePerPage
      },
      recentSessions
    });

  } catch (error) {
    logger.error('❌ Erreur récupération analytics détaillées', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des analytics',
      error: error.message
    });
  }
};

// Nettoyer les sessions inactives (appel automatique ou cron)
export const cleanupSessions = async (req, res) => {
  try {
    const result = await AnalyticsSession.cleanupInactiveSessions();
    
    res.json({
      success: true,
      message: 'Sessions inactives nettoyées',
      modified: result.modifiedCount
    });
  } catch (error) {
    logger.error('❌ Erreur cleanup sessions', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Erreur lors du nettoyage des sessions',
      error: error.message
    });
  }
};

export default { 
  getAnalyticsStats,
  trackSession,
  getDetailedAnalytics,
  cleanupSessions
};

