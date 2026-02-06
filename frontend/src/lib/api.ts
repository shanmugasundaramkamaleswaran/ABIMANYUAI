const API_URL = 'https://localhost:8000';

export interface ChatResponse {
  reply: string;
  sentiment: string;
  audio?: string;
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

export async function sendMessage(message: string): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ message }),
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
      console.error("Connection Failed: Please ensure the backend is running.", error);
      throw new Error('Connection failed. Please ensure the backend is running at http://localhost:8000');
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