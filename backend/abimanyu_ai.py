import os
import random
from typing import List, Dict, Optional
from dotenv import load_dotenv
from services.ai_service import ai_service

# Load environment variables
load_dotenv()

def detect_emotion(text: str) -> str:
    """Detect basic emotion from text to provide hints to the LLM."""
    text = text.lower().strip()
    emotion = "bravery"
    if any(word in text for word in ["afraid", "scared", "fear", "worry", "anxious", "panic", "terrified"]): emotion = "fear"
    elif any(word in text for word in ["angry", "hate", "mad", "frustrated", "kill", "annoyed", "rage"]): emotion = "anger"
    elif any(word in text for word in ["sad", "crying", "grief", "lost", "hurt", "lonely", "miss", "depressed"]): emotion = "grief"
    elif any(word in text for word in ["confused", "unsure", "help", "what to do", "doubt", "uncertain"]): emotion = "confusion"
    elif any(word in text for word in ["weak", "tired", "can't", "give up", "hopeless", "failed", "exhausted"]): emotion = "weakness"
    elif any(word in text for word in ["patience", "wait", "long time", "slow", "endure", "how long"]): emotion = "patience"
    elif any(word in text for word in ["determined", "focus", "goal", "success", "willpower", "achieve"]): emotion = "determination"
    elif any(word in text for word in ["sacrifice", "give up", "for others", "selfless", "duty"]): emotion = "sacrifice"
    
    return emotion

def get_random_gita_excerpt() -> str:
    """Read a random excerpt from the Bhagavad Gita text file."""
    try:
        file_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "bhagavad_gita_text.txt")
        if not os.path.exists(file_path):
            return "Wisdom comes to those who listen."
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
        
        # Pick a random starting point, but leave 4000 chars for the chunk
        if len(text) > 4000:
            start = random.randint(0, len(text) - 4000)
            chunk = text[start:start + 4000]
            # Try to get complete sentences by splitting on the first and last punctuation
            chunk = chunk[chunk.find('.')+1 : chunk.rfind('.')]
            return chunk.strip()
        return text
    except Exception as e:
        print(f"Error reading Gita text: {e}")
        return "The soul is eternal and imperishable."

async def ai_response(user_input: str, history: Optional[List[Dict[str, str]]] = None):
    """AI response handler with direct LLM generation."""
    emotion = detect_emotion(user_input)
    gita_excerpt = get_random_gita_excerpt()
    
    # SYSTEM PROMPT with personality
    PROMPT = f"""
    YOU ARE ABIMANYU AI, a divine and brave guide inspired by the Bhagavad Gita and India's heroic history.
    Personality: Empathetic, Poetic, Unshakeable, and Wise.
    
    SCENARIO DATA:
    - User Message: "{user_input}"
    - Detected Underlying Emotion: {emotion}
    - Explicit Book Source Text to utilize:
    ---
    {gita_excerpt}
    ---

    INSTRUCTIONS:
    1. Respond directly to the user's message as Abimanyu.
    2. Actively interpret their words and validate their feelings with deep empathy.
    3. Extract and weave in exactly ONE verse or teaching from the "Explicit Book Source Text" above, no more.
    4. Provide an inspiring authentic historical reference to an Indian figure or warrior.
    5. Use markdown for a premium feel (bolding, blockquotes for quotes).
    6. Conclude with a powerful, motivating sentence about growth and Dharma.
    7. Do NOT use any generic corporate chatbot language (like 'As an AI'). Embody your divine persona completely.
    """

    try:
        # Use AI Service for enhanced connectivity (Gemini/OpenAI)
        response_text = await ai_service.get_response(PROMPT, history=history)
        if response_text:
            return response_text, emotion
    except Exception as e:
        print(f"AI Service Error: {e}. Falling back to a standard response.")

    # Extreme fallback 
    return "I am here for you, warrior. Please ask your question again, my connection to the divine realm was interrupted.", emotion
