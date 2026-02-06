def detect_emotion(text: str) -> str:
    """
    Detect basic emotion from text.
    Returns one of:
    happy, sad, anxious, angry, stressed, neutral
    """

    text = text.lower()

    if any(word in text for word in ["happy", "good", "great", "joy", "excited", "relieved", "love", "awesome", "wonderful"]):
        return "happy"

    if any(word in text for word in ["sad", "down", "depressed", "unhappy", "lonely", "cry", "heartbroken", "grief", "fail", "failed", "failure", "disappointed"]):
        return "sad"

    if any(word in text for word in ["anxious", "anxiety", "worried", "nervous", "panic", "fear", "scared", "afraid"]):
        return "anxious"

    if any(word in text for word in ["angry", "mad", "furious", "irritated", "hate", "revenge", "traitor", "betray", "betrayal", "rage", "fury"]):
        return "angry"

    if any(word in text for word in ["stressed", "stress", "tired", "burnout", "overwhelmed", "exhausted", "pressure", "tense", "exam", "test", "study", "work", "busy"]):
        return "stressed"

    return "neutral"

