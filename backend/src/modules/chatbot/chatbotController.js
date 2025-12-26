import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createModuleLogger } from '../../config/logger.js';

const logger = createModuleLogger('Chatbot');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let knowledgeBase = [];
let knowledgeLoaded = false;

const normalizeText = (text = '') =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const loadKnowledge = () => {
  if (knowledgeLoaded) return knowledgeBase;

  try {
    const filePath = path.join(__dirname, '../../data/chatbot/knowledge.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      knowledgeBase = data;
      knowledgeLoaded = true;
      logger.info(`📚 Base de connaissances chatbot chargée (${knowledgeBase.length} entrées)`);
    } else {
      logger.warn('⚠️ Le fichier de connaissances chatbot ne contient pas un tableau JSON');
    }
  } catch (error) {
    logger.error('❌ Erreur chargement base de connaissances chatbot', {
      error: error.message,
    });
    knowledgeBase = [];
    knowledgeLoaded = true;
  }

  return knowledgeBase;
};

const scoreEntry = (entry, queryTokens, pole) => {
  let score = 0;

  const title = normalizeText(entry.title);
  const content = normalizeText(entry.content);
  const tags = (entry.tags || []).map(normalizeText).join(' ');
  const entryPole = entry.pole || 'global';

  // Bonus si le pôle correspond
  if (pole && entryPole === pole) {
    score += 5;
  }

  // Matching des tokens
  for (const token of queryTokens) {
    if (!token || token.length < 2) continue;
    if (title.includes(token)) score += 4;
    if (tags.includes(token)) score += 3;
    if (content.includes(token)) score += 2;
  }

  return score;
};

const searchKnowledge = (query, pole) => {
  const kb = loadKnowledge();
  if (!kb.length) return [];

  const normalizedQuery = normalizeText(query);
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);

  const scored = kb
    .map((entry) => ({
      entry,
      score: scoreEntry(entry, tokens, pole),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(({ entry, score }) => {
    // Utiliser le contenu complet pour éviter les coupures avec des "..."
    const snippet = entry.content;

    return {
      id: entry.id,
      pole: entry.pole || 'global',
      title: entry.title,
      snippet,
      url: entry.url || null,
      tags: entry.tags || [],
      score,
    };
  });
};

export const queryChatbot = async (req, res) => {
  try {
    const { message, pole } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Le message utilisateur est requis.',
      });
    }

    const trimmedMessage = message.trim();
    const normalizedPole = pole || null;

    logger.info('💬 Nouvelle requête chatbot', {
      message: trimmedMessage.slice(0, 200),
      pole: normalizedPole,
    });

    const results = searchKnowledge(trimmedMessage, normalizedPole);

    if (!results.length) {
      // Log dédié pour exploitation dans l'onglet Logs (filtrable par CHATBOT_NO_RESULT)
      logger.warn('CHATBOT_NO_RESULT', {
        type: 'chatbot_no_result',
        message: trimmedMessage,
        pole: normalizedPole,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.headers['user-agent'] || null,
      });

      return res.json({
        answerType: 'no_result',
        message:
          "Je n'ai pas trouvé d'information précise sur ce sujet dans le site CIPS. Vous pouvez consulter nos pages de pôles ou nous contacter directement pour une réponse détaillée.",
        suggestions: [
          'Voir les pôles d’activité',
          'Voir la page Contact',
          'Demander un devis',
        ],
      });
    }

    // Construire une réponse texte simple et directe pour le chatbot actuel
    const [top, ...rest] = results;

    let answerText = `${top.title}\n\n${top.snippet}`;

    if (top.url) {
      answerText += `\n\nPour aller plus loin : ${top.url}`;
    }

    // Si plusieurs résultats pertinents, on peut suggérer d'autres pistes en une ligne courte
    if (rest.length > 0) {
      const autresTitres = rest.map((r) => r.title).join(' • ');
      answerText += `\n\nAutres pistes possibles : ${autresTitres}.`;
    }

    return res.json({
      answerType: 'knowledge_search',
      query: trimmedMessage,
      answer: answerText,
      results,
      suggestions: [
        'Poser une autre question',
        'Contacter un conseiller',
      ],
    });
  } catch (error) {
    logger.error('❌ Erreur dans queryChatbot', {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      error: 'Erreur lors du traitement de la requête chatbot.',
    });
  }
};


