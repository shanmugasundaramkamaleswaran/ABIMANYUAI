const Sentiment = require('sentiment');
const sentiment = new Sentiment();

/**
 * Port of analyze_sentiment from Python TextBlob.
 */
function analyzeSentiment(text) {
  const result = sentiment.analyze(text);
  const score = result.comparative; // result.comparative is roughly equivalent to polarity

  if (score < -0.3) {
    return 'negative';
  } else if (score > 0.3) {
    return 'positive';
  } else {
    return 'neutral';
  }
}

/**
 * Port of detect_intent from Python.
 */
function detectIntent(text) {
  text = text.toLowerCase();

  if (['hi', 'hello', 'hey', 'good morning', 'good evening'].some(word => text.includes(word))) {
    return 'greeting';
  }

  if (['help', 'support', 'guide', 'advice'].some(word => text.includes(word))) {
    return 'help';
  }

  if (['sad', 'anxious', 'stressed', 'lonely', 'overwhelmed'].some(word => text.includes(word))) {
    return 'emotional_support';
  }

  if (['suicide', 'kill myself', 'end my life', 'self harm'].some(word => text.includes(word))) {
    return 'crisis';
  }

  if (['bye', 'goodbye', 'see you', 'thanks', 'thank you'].some(word => text.includes(word))) {
    return 'goodbye';
  }

  return 'general';
}

module.exports = {
  analyzeSentiment,
  detectIntent
};
