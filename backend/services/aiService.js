const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { OpenAI } = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs').promises;
const vectorService = require('./vectorService');

// Simple in-memory cache for repeat-answer avoidance
const usedVerseIds = new Set();
const CACHE_LIMIT = 50; 

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.hfKey = process.env.HF_API_KEY;
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.mistralKey = process.env.MISTRAL_API_KEY;

    if (this.openaiKey && !this.openaiKey.toLowerCase().includes('your_')) {
      this.openaiClient = new OpenAI({ apiKey: this.openaiKey });
    }

    if (this.geminiKey && !this.geminiKey.toLowerCase().includes('your_')) {
      this.genAI = new GoogleGenerativeAI(this.geminiKey);
    }

    if (this.mistralKey && !this.mistralKey.toLowerCase().includes('your_')) {
      // Mistral is OpenAI-compatible
      this.mistralClient = new OpenAI({
        apiKey: this.mistralKey,
        baseURL: 'https://api.mistral.ai/v1'
      });
    }

    this.hfEndpoint = 'https://router.huggingface.co/v1/chat/completions';
  }

  async getResponse(prompt, history = [], provider = 'mistral') {
    // Priority: Mistral -> Gemini -> HuggingFace -> OpenAI
    console.log(`[AI] Attempting response with provider order: Mistral -> Gemini -> HF -> OpenAI`);

    // 1. Try Mistral (User provided key, very reliable)
    if (this.mistralClient) {
      console.log('[AI] Trying Mistral AI...');
      try {
        return await this._getMistralResponse(prompt, history);
      } catch (e) {
        console.error('[AI] Mistral Error:', e.message);
      }
    }

    // 2. Try Gemini
    if (this.genAI) {
      console.log('[AI] Trying Google Gemini...');
      try {
        return await this._getGeminiResponse(prompt, history);
      } catch (e) {
        console.error('[AI] Gemini Error:', e.message);
      }
    }

    // 3. Try Hugging Face
    if (this.hfKey) {
      console.log('[AI] Trying Hugging Face (Mistral-7B stable)...');
      try {
        return await this._getHFResponse(prompt, history);
      } catch (e) {
        console.error('[AI] HF Error:', e.message);
      }
    }

    // 4. Try OpenAI
    if (this.openaiClient) {
      console.log('[AI] Trying OpenAI...');
      try {
        return await this._getOpenAIResponse(prompt, history);
      } catch (e) {
        console.error('[AI] OpenAI Error:', e.message);
      }
    }

    throw new Error('No AI provider configured properly or all providers failed.');
  }

  async _getGeminiResponse(prompt, history) {
    // Attempting with 'v1' and fallback to 'gemini-1.5-flash' vs 'gemini-1.5-pro'
    let model;
    try {
      model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: 'v1' });
    } catch (e) {
      model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    }
    
    const contents = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const result = await model.generateContent({
      contents,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    return response.text().trim();
  }

  async _getMistralResponse(prompt, history) {
    const messages = history.map(msg => ({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: prompt });

    const response = await this.mistralClient.chat.completions.create({
      model: 'mistral-large-latest',
      messages: messages,
      max_tokens: 1000
    });
    return response.choices[0].message.content.trim();
  }

  async _getHFResponse(prompt, history) {
    const messages = history.map(msg => ({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: prompt });

    // Using a more stable model for the router
    const model = 'mistralai/Mistral-7B-Instruct-v0.3';

    const response = await axios.post(
      this.hfEndpoint,
      {
        model: model,
        messages: messages,
        max_tokens: 600,
        temperature: 0.7
      },
      {
        headers: { 
          Authorization: `Bearer ${this.hfKey}`,
          'x-wait-for-model': 'true'
        },
        timeout: 60000 
      }
    );

    if (response.data.choices && response.data.choices[0].message) {
        return response.data.choices[0].message.content.trim();
    }
    
    return JSON.stringify(response.data);
  }

  async _getOpenAIResponse(prompt, history) {
    const messages = history.map(msg => ({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: prompt });

    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages
    });
    return response.choices[0].message.content.trim();
  }
}

const aiService = new AIService();

function detectEmotion(text) {
  text = text.toLowerCase().trim();
  let emotion = 'bravery';
  
  const keywords = {
    fear: ['afraid', 'scared', 'fear', 'worry', 'anxious', 'panic', 'terrified'],
    anger: ['angry', 'hate', 'mad', 'frustrated', 'kill', 'annoyed', 'rage'],
    grief: ['sad', 'crying', 'grief', 'lost', 'hurt', 'lonely', 'miss', 'depressed'],
    confusion: ['confused', 'unsure', 'help', 'what to do', 'doubt', 'uncertain'],
    weakness: ['weak', 'tired', "can't", 'give up', 'hopeless', 'failed', 'exhausted'],
    patience: ['patience', 'wait', 'long time', 'slow', 'endure', 'how long'],
    determination: ['determined', 'focus', 'goal', 'success', 'willpower', 'achieve'],
    sacrifice: ['sacrifice', 'give up', 'for others', 'selfless', 'duty']
  };

  for (const [key, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      return key;
    }
  }
  
  return emotion;
}

async function getRelevantGitaExcerpt(userInput) {
  try {
    // Randomized and deduplicated search
    // We pass usedVerseIds to avoid repetition
    const excludeIds = Array.from(usedVerseIds);
    const result = await vectorService.search(userInput, 10, excludeIds, 0.7);
    
    if (result) {
      // Add to used cache
      usedVerseIds.add(result.id);
      if (usedVerseIds.size > CACHE_LIMIT) {
        const first = usedVerseIds.values().next().value;
        usedVerseIds.delete(first);
      }
      return result.text;
    }
    
    // Fallback to a random one if search fails or no new ones found
    return "The soul is eternal, unchanging, and indestructible. It never dies when the body is slain.";
  } catch (e) {
    console.error('Error fetching relevant Gita text:', e);
    return 'The soul is eternal and imperishable.';
  }
}

async function getAbimanyuResponse(userInput, history = []) {
  const emotion = detectEmotion(userInput);
  const gitaExcerpt = await getRelevantGitaExcerpt(userInput);
  
  const PROMPT = `
    YOU ARE ABIMANYU AI, a divine and brave guide inspired by the Bhagavad Gita and India's heroic history.
    Personality: Empathetic, Poetic, Unshakeable, and Wise.
    
    SCENARIO DATA:
    - User Message: "${userInput}"
    - Detected Underlying Emotion: ${emotion}
    - Explicit Book Source Text to utilize:
    ---
    ${gitaExcerpt}
    ---
 
    INSTRUCTIONS:
    1. Respond directly to the user's message as Abimanyu.
    2. Actively interpret their words and validate their feelings with deep empathy.
    3. Extract and weave in exactly ONE verse or teaching from the "Explicit Book Source Text" above, no more.
    4. Provide an inspiring authentic historical reference to an Indian figure or warrior.
    5. Use markdown for a premium feel (bolding, blockquotes for quotes).
    6. Conclude with a powerful, motivating sentence about growth and Dharma.
    7. Do NOT use any generic corporate chatbot language (like 'As an AI'). Embody your divine persona completely.
    8. Use the language the user is speaking in (English/Tamil/Hindi) if appropriate, but primarily English with divine depth.
    9. Do NOT use any emojis in your response. Maintain a solemn and divine tone using only text and markdown.
  `;

  try {
    const responseText = await aiService.getResponse(PROMPT, history);
    return { responseText, emotion };
  } catch (e) {
    console.error('AI Service Error:', e);
    return {
      responseText: "I am here for you, warrior. Please ask your question again, my connection to the divine realm was interrupted.",
      emotion
    };
  }
}

module.exports = {
  getAbimanyuResponse
};
