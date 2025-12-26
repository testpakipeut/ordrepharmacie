import express from 'express';
import { queryChatbot } from './chatbotController.js';

const router = express.Router();

// Route publique pour le chatbot
router.post('/query', queryChatbot);

export default router;









