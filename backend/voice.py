
import os
import requests
import base64
from dotenv import load_dotenv
try:
    from elevenlabs.client import ElevenLabs
    from elevenlabs import save
except ImportError:
    ElevenLabs = None

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

def generate_voice_bytes(text: str, reference_path: str = "data/reference_voice.m4a"):
    """
    Generates audio bytes for the given text.
    Attempts to use ElevenLabs for cloning if key is available.
    """
    print(f"Generating voice for: {text[:20]}...")
    
    # 1. Try ElevenLabs
    if ELEVENLABS_API_KEY and ElevenLabs:
        try:
            client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
            
            # Check if voice exists, else add it
            # This is simplified; in production we cache the voice_id
            voice_id = None
            voices = client.voices.get_all()
            for v in voices.voices:
                if v.name == "Abimanyu Voice":
                    voice_id = v.voice_id
                    break
            
            if not voice_id and os.path.exists(reference_path):
                print("Cloning voice...")
                voice = client.voices.add(
                    name="Abimanyu Voice",
                    description="Cloned from user file",
                    files=[open(reference_path, "rb")]
                )
                voice_id = voice.voice_id
            
            if voice_id:
                audio = client.generate(
                    text=text,
                    voice=voice_id,
                    model="eleven_multilingual_v2"
                )
                # audio is a generator, consume it
                return b"".join(audio)
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"ElevenLabs error: {e}")
            pass

    # 2. Fallback: Return empty or None (Client handles 'no voice')
    # Or we could try HF but cloning is hard to match exactly.
    print("TTS backend unavailable or failed.")
    return None

def get_audio_base64(text: str):
    audio_bytes = generate_voice_bytes(text)
    if audio_bytes:
        return base64.b64encode(audio_bytes).decode('utf-8')
    return None
