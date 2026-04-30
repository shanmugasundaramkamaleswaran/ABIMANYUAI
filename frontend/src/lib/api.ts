import { db } from "./firebase";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, limit, getDocs } from "firebase/firestore";

const API_URL = (import.meta.env.VITE_API_URL || 'https://abimanyuai-1.onrender.com').replace(/\/$/, "");

export interface ChatResponse {
  reply: string;
  sentiment: string;
  audio?: string;
  mood?: string;
}

export interface ChatHistoryItem {
  id: number;
  content: string;
  is_ai: boolean;
  timestamp: string;
}

function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem('abimanyu_token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  return {
    'Content-Type': 'application/json'
  };
}

export async function sendMessage(message: string, language: string = 'english'): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message, language }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);

    // Handle specific error types for better UX debugging
    if (error.name === 'AbortError') {
      throw new Error('Divine connection timed out. Please try again.');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Connection Failed: ${API_URL}/chat`, error);
      throw new Error(
        `Divine connection refused. 
        
        To fix this:
        1. Ensure the backend is running (run 'npm run check').
        2. Visit ${API_URL}/health in a new tab.
        3. Click 'Advanced' and 'Proceed' to trust the SSL certificate.
        4. Refresh this page.`
      );
    }

    throw error;
  }
}

export async function getChatHistory(): Promise<ChatHistoryItem[]> {
  const response = await fetch(`${API_URL}/chat/history`, {
    headers: getAuthHeader()
  });

  if (!response.ok) {
    if (response.status === 401) {
      return []; // Not authenticated, return empty
    }
    throw new Error('Failed to get chat history');
  }

  return response.json();
}

export async function clearChatHistory(): Promise<void> {
  const response = await fetch(`${API_URL}/chat/history`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });

  if (!response.ok) {
    throw new Error('Failed to clear chat history');
  }
}

export interface AnalyticsData {
  date: string;
  fullDate?: string;
  mood: number;
  strength: number;
  stress: number;
}

export async function getAnalyticsData(): Promise<AnalyticsData[]> {
  const response = await fetch(`${API_URL}/chat/analytics`, {
    headers: getAuthHeader()
  });

  if (!response.ok) {
    if (response.status === 401) return [];
    throw new Error('Failed to fetch analytics data');
  }

  return response.json();
}

export const EMOTION_MAP: Record<string, { mood: number, strength: number, stress: number }> = {
  bravery: { mood: 9, strength: 10, stress: 1 },
  determination: { mood: 8, strength: 9, stress: 2 },
  sacrifice: { mood: 7, strength: 8, stress: 3 },
  patience: { mood: 7, strength: 7, stress: 2 },
  confusion: { mood: 4, strength: 4, stress: 6 },
  fear: { mood: 3, strength: 3, stress: 8 },
  anger: { mood: 2, strength: 5, stress: 9 },
  grief: { mood: 2, strength: 2, stress: 7 },
  weakness: { mood: 1, strength: 1, stress: 5 },
  neutral: { mood: 5, strength: 5, stress: 5 }
};

export async function saveAnalyticsToFirebase(userId: string, emotion: string): Promise<void> {
  if (!db) return;
  const metrics = EMOTION_MAP[emotion] || EMOTION_MAP.neutral;
  try {
    await addDoc(collection(db, "analytics"), {
      userId,
      emotion,
      ...metrics,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving analytics to Firebase:", error);
  }
}

export function subscribeToAnalytics(userId: string, callback: (data: AnalyticsData[]) => void) {
  if (!db) {
    callback([{
      date: 'Starting Point',
      mood: 5,
      strength: 5,
      stress: 5
    }]);
    return () => {};
  }
  
  const q = query(
    collection(db, "analytics"),
    where("userId", "==", userId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => {
      const d = doc.data();
      const date = d.timestamp?.toDate() || new Date();
      return {
        date: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: date.toLocaleDateString(),
        mood: d.mood,
        strength: d.strength,
        stress: d.stress
      };
    });
    
    if (data.length === 0) {
      callback([{
        date: 'Starting Point',
        mood: 5,
        strength: 5,
        stress: 5
      }]);
    } else {
      callback(data.slice(-10));
    }
  });
}

export async function generateElevenLabsSpeech(text: string): Promise<string | null> {
  const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  if (!apiKey) return null;

  const VOICE_ID = "pNInz6obpgnuM0sL6YpA"; // Adam/Josh-like male voice
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) throw new Error("ElevenLabs API error");

    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("ElevenLabs TTS failed:", error);
    return null;
  }
}