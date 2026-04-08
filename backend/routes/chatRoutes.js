const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/ChatMessage');
const { getAbimanyuResponse } = require('../services/aiService');
const { analyzeSentiment } = require('../services/nlpService');
const { getAudioBase64 } = require('../services/voiceService');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

/**
 * Send a chat message and get AI response.
 */
router.post('/', optionalAuthMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ detail: 'Message is required' });

  try {
    let history = [];
    // Save user message and fetch history if authenticated
    if (req.user) {
      await ChatMessage.create({
        user_id: req.user.id,
        content: message,
        is_ai: false
      });

      const recentMsgs = await ChatMessage.findAll({
        where: { user_id: req.user.id },
        order: [['timestamp', 'DESC']],
        limit: 10
      });

      history = recentMsgs.reverse().map(msg => ({
        role: msg.is_ai ? 'assistant' : 'user',
        content: msg.content
      }));
    }

    // Get AI response
    const { responseText, emotion } = await getAbimanyuResponse(message, history);
    
    // Analyze sentiment
    const sentiment = analyzeSentiment(message);

    // Save AI response if authenticated
    if (req.user) {
      await ChatMessage.create({
        user_id: req.user.id,
        content: responseText,
        is_ai: true
      });
    }

    // Generate audio (optional)
    const audioB64 = await getAudioBase64(responseText);

    res.json({
      reply: responseText,
      sentiment: sentiment,
      audio: audioB64,
      mood: emotion
    });
  } catch (e) {
    console.error('Chat Error:', e);
    res.json({
      reply: "I'm experiencing some technical difficulties. Please try again later.",
      sentiment: 'neutral',
      audio: null,
      mood: 'neutral'
    });
  }
});

/**
 * Get chat history for authenticated user.
 */
router.get('/history', authMiddleware, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;

  try {
    const messages = await ChatMessage.findAll({
      where: { user_id: req.user.id },
      order: [['timestamp', 'DESC']],
      limit: limit
    });

    res.json(messages.reverse().map(msg => ({
      id: msg.id,
      content: msg.content,
      is_ai: msg.is_ai,
      timestamp: msg.timestamp
    })));
  } catch (e) {
    console.error('History Error:', e);
    res.status(500).json({ detail: 'Failed to fetch history' });
  }
});

/**
 * Clear chat history for authenticated user.
 */
router.delete('/history', authMiddleware, async (req, res) => {
  try {
    await ChatMessage.destroy({ where: { user_id: req.user.id } });
    res.json({ message: 'Chat history cleared' });
  } catch (e) {
    console.error('Clear History Error:', e);
    res.status(500).json({ detail: 'Failed to clear history' });
  }
});

module.exports = router;
