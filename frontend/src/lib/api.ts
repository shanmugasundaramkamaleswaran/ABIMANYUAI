const API_URL = import.meta.env.VITE_API_URL || 'https://abimanyuai-1.onrender.com';

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