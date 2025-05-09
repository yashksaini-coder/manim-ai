/**
 * API helper functions for Manim AI
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_PROCESSOR || 'http://localhost:5000';

/**
 * Cleans code output by removing markdown code blocks
 */
export const cleanCode = (code: string): string => {
  return code.replace(/```python/g, "").replace(/```/g, "");
};

/**
 * Generates Manim code from a text prompt
 */
export const generateCode = async (prompt: string, model: string = 'gemma-2-9b-it'): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/v1/generate/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt,
        model,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate code: ${response.status}`);
    }

    const data = await response.json();
    return cleanCode(data.code);
  } catch (error) {
    console.error('Error generating code:', error);
    throw error;
  }
};

/**
 * Renders a Manim animation from code
 */
export const renderAnimation = async (code: string): Promise<string> => {
  try {
    const response = await fetch(`${BACKEND_URL}/v1/render/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to render animation: ${response.status}`);
    }

    const data = await response.json();
    return data.video_url;
  } catch (error) {
    console.error('Error rendering animation:', error);
    throw error;
  }
};

/**
 * Cached data utilities
 */
export const cacheManager = {
  // Store code in localStorage
  storeCode: (chatId: string, code: string) => {
    try {
      localStorage.setItem(`chat_${chatId}_code`, code);
      return true;
    } catch (error) {
      console.error('Error storing code:', error);
      return false;
    }
  },

  // Store video URL in localStorage
  storeVideo: (chatId: string, videoUrl: string) => {
    try {
      localStorage.setItem(`chat_${chatId}_video`, videoUrl);
      return true;
    } catch (error) {
      console.error('Error storing video URL:', error);
      return false;
    }
  },

  // Store prompt in localStorage
  storePrompt: (chatId: string, prompt: string) => {
    try {
      localStorage.setItem(`chat_${chatId}_prompt`, prompt);
      return true;
    } catch (error) {
      console.error('Error storing prompt:', error);
      return false;
    }
  },

  // Check if cached data exists for a chat
  hasCachedData: (chatId: string) => {
    const cachedCode = localStorage.getItem(`chat_${chatId}_code`);
    const cachedVideo = localStorage.getItem(`chat_${chatId}_video`);
    return !!(cachedCode && cachedVideo);
  },

  // Get cached data for a chat
  getCachedData: (chatId: string) => {
    return {
      code: localStorage.getItem(`chat_${chatId}_code`),
      videoUrl: localStorage.getItem(`chat_${chatId}_video`),
      prompt: localStorage.getItem(`chat_${chatId}_prompt`),
    };
  },

  // Clear cached data for a chat
  clearCachedData: (chatId: string) => {
    try {
      localStorage.removeItem(`chat_${chatId}_code`);
      localStorage.removeItem(`chat_${chatId}_video`);
      localStorage.removeItem(`chat_${chatId}_prompt`);
      return true;
    } catch (error) {
      console.error('Error clearing cached data:', error);
      return false;
    }
  }
}; 