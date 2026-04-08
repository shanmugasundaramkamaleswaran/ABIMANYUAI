const { OpenAI } = require('openai');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

class AIService {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.hfKey = process.env.HF_API_KEY;

    if (this.openaiKey && !this.openaiKey.toLowerCase().includes('your_')) {
      this.openaiClient = new OpenAI({ apiKey: this.openaiKey });
    }

    this.hfEndpoint = 'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct';
  }

  async getResponse(prompt, history = [], provider = 'huggingface') {
    if (provider === 'huggingface' && this.hfKey) {
      try {
        return await this._getHFResponse(prompt, history);
      } catch (e) {
        console.error('HF Error, falling back to OpenAI:', e.message);
        if (this.openaiClient) return await this._getOpenAIResponse(prompt, history);
        throw e;
      }
    } else if (this.openaiClient) {
      return await this._getOpenAIResponse(prompt, history);
    } else {
      throw new Error('No AI provider configured properly.');
    }
  }

  async _getHFResponse(prompt, history) {
    const messages = history.map(msg => ({ role: msg.role, content: msg.content }));
    messages.push({ role: 'user', content: prompt });

    const response = await axios.post(
      this.hfEndpoint,
      {
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: messages,
        max_tokens: 600,
        temperature: 0.7
      },
      {
        headers: { Authorization: `Bearer ${this.hfKey}` }
      }
    );

    // HF Inference API response structure for chat completion
    // The format can vary slightly between models and API styles, but usually it's choices[0].message.content
    // However, for the basic serverless API it might just be the text directly in an array or object.
    // Llama-3-8B-Instruct via Inference API usually returns: 
    // [{ generated_text: "..." }] or a more standard ChatCompletion response.
    
    if (response.data.choices && response.data.choices[0].message) {
        return response.data.choices[0].message.content.trim();
    } else if (Array.isArray(response.data) && response.data[0].generated_text) {
        return response.data[0].generated_text.trim();
    } else if (response.data.generated_text) {
        return response.data.generated_text.trim();
    }
    
    return JSON.stringify(response.data); // Fallback
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

async function getRandomGitaExcerpt() {
  try {
    const filePath = path.join(__dirname, '..', 'bhagavad_gita_text.txt');
    const text = await fs.readFile(filePath, 'utf-8');
    
    if (text.length > 4000) {
      const start = Math.floor(Math.random() * (text.length - 4000));
      let chunk = text.substring(start, start + 4000);
      
      const firstDot = chunk.indexOf('.');
      const lastDot = chunk.lastIndexOf('.');
      
      if (firstDot !== -1 && lastDot !== -1 && lastDot > firstDot) {
        chunk = chunk.substring(firstDot + 1, lastDot);
      }
      return chunk.trim();
    }
    return text.trim();
  } catch (e) {
    console.error('Error reading Gita text:', e);
    return 'The soul is eternal and imperishable.';
  }
}

async function getAbimanyuResponse(userInput, history = []) {
  const emotion = detectEmotion(userInput);
  const gitaExcerpt = await getRandomGitaExcerpt();
  
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
