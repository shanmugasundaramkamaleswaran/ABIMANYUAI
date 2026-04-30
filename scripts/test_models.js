const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.error('Missing GEMINI_API_KEY');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    // Access the API version v1 explicitly if possible, 
    // but the SDK handles this. Let's try to list anyway.
    // However, the SDK doesn't have a direct listModels on the main object usually.
    // It's part of the GenerativeLanguageClient which is different.
    
    console.log('Attempting to use gemini-1.5-flash-latest...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const result = await model.generateContent("Hi");
    console.log('Success with gemini-1.5-flash-latest!');
    console.log(await result.response.text());
  } catch (e) {
    console.error('Error:', e.message);
    if (e.stack) console.error(e.stack);
  }
}

listModels();
