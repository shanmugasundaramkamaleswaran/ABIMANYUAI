
def detect_intent(text: str) -> str:
    """
    Detect user intent.
    Returns one of:
    greeting, emotional_support, help, crisis, goodbye, general
    """

    text = text.lower()

    if any(word in text for word in ["hi", "hello", "hey", "good morning", "good evening"]):
        return "greeting"

    if any(word in text for word in ["help", "support", "guide", "advice"]):
        return "help"

    if any(word in text for word in ["sad", "anxious", "stressed", "lonely", "overwhelmed"]):
        return "emotional_support"

    if any(word in text for word in ["suicide", "kill myself", "end my life", "self harm"]):
        return "crisis"

    if any(word in text for word in ["bye", "goodbye", "see you", "thanks", "thank you"]):
        return "goodbye"

    return "general"
