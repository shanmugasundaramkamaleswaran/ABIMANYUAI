import os
import random
from typing import List, Dict, Optional
from dotenv import load_dotenv
from utils.rag import get_rag
from services.ai_service import ai_service

# Load environment variables
load_dotenv()

# --- EXPANDED KNOWLEDGE BASE ---

GITA_VERSES = {
    "fear": [
        "Fear not, for the soul is eternal. (Chapter 2, Verse 20)",
        "The soul is never born nor dies at any time. (Chapter 2, Verse 20)",
        "Why do you worry without cause? Whom do you fear without reason? (Chapter 2)"
    ],
    "anger": [
        "From anger comes delusion; from delusion loss of memory. (Chapter 2, Verse 63)",
        "He who is able to resist the urge of desire and anger is a happy person. (Chapter 5, Verse 23)",
        "Anger is one of the three gates to hell. (Chapter 16, Verse 21)"
    ],
    "grief": [
        "The wise grieve neither for the living nor for the dead. (Chapter 2, Verse 11)",
        "Whatever happened, happened for the good. (Chapter 2)",
        "Death is as certain for that which is born, as birth is for that which is dead. (Chapter 2, Verse 27)"
    ],
    "confusion": [
        "You have a right to your duty, but not to its results. (Chapter 2, Verse 47)",
        "Perform your duty equanimously, O Arjuna, abandoning all attachment to success or failure. (Chapter 2, Verse 48)",
        "Better is one’s own dharma though imperfectly performed than another’s dharma well performed. (Chapter 3, Verse 35)"
    ],
    "weakness": [
        "Yield not to unmanliness, O son of Pritha. It does not become you. (Chapter 2, Verse 3)",
        "Arise, O conqueror of enemies, and prepare for the fight. (Chapter 2, Verse 3)",
        "Strength is life, weakness is death. (Inspired by Gita/Vivekananda)"
    ],
    "bravery": [
        "Slain, you will obtain heaven; victorious, you will enjoy the earth. (Chapter 2, Verse 37)",
        "Change is the law of the universe. You can be a millionaire, or a pauper in an instant. (Chapter 2)",
        "Man is made by his belief. As he believes, so he is. (Chapter 17, Verse 3)"
    ],
    "patience": [
        "Endure the temporary joys and sorrows, for they come and go like winter and summer. (Chapter 2, Verse 14)",
        "He whose mind is not shaken by adversity is called a sage of steady wisdom. (Chapter 2, Verse 56)",
        "Gradually, step by step, one should become situated in peace through conviction. (Chapter 6, Verse 25)"
    ],
    "determination": [
        "Give up such petty weakness of heart and arise, O chastiser of the enemy. (Chapter 2, Verse 3)",
        "The intelligence of those who are resolute is single-pointed and focused. (Chapter 2, Verse 41)",
        "Determination in the mode of goodness sustains the activities of the mind and senses. (Chapter 18, Verse 33)"
    ],
    "sacrifice": [
        "Work done as a sacrifice for the Divine does not bind one to the material world. (Chapter 3, Verse 9)",
        "Actions performed as a duty, without desire for reward, are of the nature of goodness. (Chapter 17, Verse 11)",
        "Abandon all paths and take refuge in Me alone; I shall deliver you from all sins. (Chapter 18, Verse 66)"
    ]
}

FIGHTER_STORIES = {
    "fear": [
        "Bhagat Singh walked to the gallows with a smile, proving that fear is a choice when duty calls.",
        "Shivaram Rajguru, alongside Bhagat Singh, faced the end with unshakeable courage for the nation.",
        "Ashfaqulla Khan showed that even in the face of death, one's love for the motherland remains supreme."
    ],
    "anger": [
        "Sardar Patel channeled his internal fire to unite 562 princely states into one strong India.",
        "Lala Lajpat Rai's anger against British injustice turned into a roar that shook the empire.",
        "Subhash Chandra Bose's 'Give me blood, and I will give you freedom' was the ultimate channeling of patriotic fire."
    ],
    "grief": [
        "Rani Lakshmibai lost her child and husband, yet she chose to pick up the sword to protect Jhansi.",
        "The mothers of Jallianwala Bagh turned their grief into a silent but powerful fuel for the freedom movement.",
        "Mahatma Gandhi lost his beloved Ba (Kasturba), yet he stayed committed to the path of Ahimsa and Freedom."
    ],
    "confusion": [
        "Netaji Bose left a comfortable ICS career, resolving his confusion to fight for Total Independence.",
        "Sukhdev Thapar was once confused by paths, but found his ultimate clarity in the revolutionary fight.",
        "Chandra Shekhar Azad vowed never to be caught alive, a clarity born from his early decision at the courthouse."
    ],
    "weakness": [
        "Chandrashekhar Azad faced the entire police force alone at Alfred Park, refusing to accept weakness.",
        "Tantia Tope, though betrayed, never showed weakness in his guerrilla warfare against the British.",
        "Mangal Pandey, stood alone at the start, igniting a spark that weak hearts could not handle."
    ],
    "bravery": [
        "Mahatma Gandhi's Satyagraha showed that true bravery lies in standing for truth without violence.",
        "Khan Abdul Ghaffar Khan, the Frontier Gandhi, showed the bravery of peaceful resistance.",
        "Begalore's legendary hero, Kempe Gowda, showed the bravery of vision and building for the future."
    ],
    "patience": [
        "Udham Singh waited for 21 long years to avenge the Jallianwala Bagh massacre, showing unparalleled patience.",
        "Mahatma Gandhi's decades-long non-violent struggle proved that patience is the ultimate weapon of the strong.",
        "Nelson Mandela's 27 years in prison never broke his spirit; he patiently waited for the dawn of justice."
    ],
    "determination": [
        "Aruna Asaf Ali hoisted the Indian flag during the Quit India Movement despite a police crackdown.",
        "Sardar Patel's iron-willed determination was the glue that held the newly independent India together.",
        "Subhas Chandra Bose's determination led him across continents to build an army for India's freedom."
    ],
    "sacrifice": [
        "Matangini Hazra was shot while holding the tricolor high, sacrificing her life with 'Vande Mataram' on her lips.",
        "The Trio of Benoy, Badal, and Dinesh sacrificed themselves after attacking the Writers' Building for freedom.",
        "Bagha Jatin fought until his last breath, saying 'We shall die to awaken the nation'."
    ]
}

def detect_intent_and_emotion(text):
    """Refined ML step: Detect if it's a greeting or a struggle."""
    text = text.lower().strip()
    
    # Simple greeting detection
    greetings = ["hi", "hello", "hey", "namaste", "pranam", "good morning", "good evening", "how are you"]
    is_greeting = any(text.startswith(g) or text == g for g in greetings)
    
    # Emotion detection
    emotion = "bravery"
    if any(word in text for word in ["afraid", "scared", "fear", "worry", "anxious", "panic", "terrified"]): emotion = "fear"
    elif any(word in text for word in ["angry", "hate", "mad", "frustrated", "kill", "annoyed", "rage"]): emotion = "anger"
    elif any(word in text for word in ["sad", "crying", "grief", "lost", "hurt", "lonely", "miss", "depressed"]): emotion = "grief"
    elif any(word in text for word in ["confused", "unsure", "help", "what to do", "doubt", "uncertain"]): emotion = "confusion"
    elif any(word in text for word in ["weak", "tired", "can't", "give up", "hopeless", "failed", "exhausted"]): emotion = "weakness"
    elif any(word in text for word in ["patience", "wait", "long time", "slow", "endure", "how long"]): emotion = "patience"
    elif any(word in text for word in ["determined", "focus", "goal", "success", "willpower", "achieve"]): emotion = "determination"
    elif any(word in text for word in ["sacrifice", "give up", "for others", "selfless", "duty"]): emotion = "sacrifice"
    
    return is_greeting, emotion

def build_abimanyu_response(user_text, gita_wisdom, fighter_story, is_greeting):
    """Unified Response Structure."""
    if is_greeting:
        return f"Namaste! I am Abimanyu, your companion on the path of Dharma. I feel your energy today. How can I offer you clarity or strength?"

    response = "I hear your struggle, and I sense your heart. You are a warrior of light, and you are never alone.\n\n"
    response += "📖 **Eternal Wisdom from the Bhagavad Gita:**\n"
    response += "> " + gita_wisdom + "\n\n"

    if fighter_story:
        response += "🇮🇳 **Heroic Legacy of India:**\n"
        response += "*\"" + fighter_story + "\"*\n\n"

    response += "Let these words be your shield and your torch. Remember, every challenge is an invitation to grow stronger.\n"
    response += "— **Abimanyu**"
    return response

async def ai_response(user_input: str, history: Optional[List[Dict[str, str]]] = None):
    """Unified AI response handler with multi-provider support and RAG context."""
    is_greeting, emotion = detect_intent_and_emotion(user_input)
    
    # Select wisdom and heroic story
    gita_wisdom = random.choice(GITA_VERSES.get(emotion, GITA_VERSES["bravery"]))
    fighter_story = random.choice(FIGHTER_STORIES.get(emotion, FIGHTER_STORIES["bravery"]))

    # Get relevant context from sacred texts via RAG
    rag = get_rag()
    pdf_context = rag.get_context(user_input, k=3) if rag else ""

    # SYSTEM PROMPT with personality and context
    PROMPT = f"""
    YOU ARE ABIMANYU AI, a divine and brave guide inspired by the Bhagavad Gita and India's heroic history.
    Personality: Empathetic, Poetic, Unshakeable, and Wise.
    
    SCENARIO DATA:
    - User Message: "{user_input}"
    - Is Greeting: {is_greeting}
    - Detected Emotion: {emotion}
    - Gita Wisdom to include: "{gita_wisdom}"
    - Hero Story to include: "{fighter_story}"
    
    CONTEXT FROM SACRED TEXTS:
    {pdf_context if pdf_context else "No additional context available"}

    INSTRUCTIONS:
    1. IF 'Is Greeting' is True: Respond as a divine guide. Use words like "Namaste", "Pranam", or "Blessings". Be warm and ask how you can help them navigate their Dharma today. Keep it brief.
    2. IF 'Is Greeting' is False: 
       - Validate their feelings with deep empathy.
       - Explicitly integrate the provided Gita Wisdom under the heading "📖 Eternal Wisdom from the Bhagavad Gita:".
       - Explicitly integrate the provided Heroic Story under the heading "🇮🇳 Heroic Legacy of India:".
       - If PDF context is relevant, weave it into your guidance naturally.
       - Use markdown for a premium feel (bolding, blockquotes).
       - Conclude with a powerful, motivating sentence about growth and Dharma.
       - Sign off as "— Abimanyu".

    TONE: Divine, serene, yet powerful. Use the wisdom and story provided as the soul of your response.
    """

    try:
        # Use AI Service for enhanced connectivity (Gemini/OpenAI)
        response_text = await ai_service.get_response(PROMPT, history=history)
        if response_text:
            return response_text
    except Exception as e:
        print(f"AI Service Error: {e}. Falling back to local logic.")

    # Fallback to local deterministic response if AI service fails
    return build_abimanyu_response(user_input, gita_wisdom, fighter_story, is_greeting)
