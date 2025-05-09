/**
 * API helper functions for Manim AI
 */

// Set this to true to use mock data when the server is not available
const USE_MOCK_DATA = true;

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_PROCESSOR || 'http://localhost:5000';

// Mock data for development when server is not available
const MOCK_CODE = `from manim import *

class GenScene(Scene):
    def construct(self):
        # Create a blue square
        square = Square(color=BLUE, fill_opacity=0.5)
        
        # Display the square with an animation
        self.play(Create(square))
        
        # Define a red circle
        circle = Circle(color=RED, fill_opacity=0.5)
        
        # Transform the square into the circle
        self.play(Transform(square, circle))
        
        # Wait a bit before ending the animation
        self.wait()`;

const MOCK_VIDEO_URL = "https://storage.googleapis.com/manim-engine-examples/basic_example.mp4";

/**
 * Cleans code output by removing markdown code blocks
 */
export const cleanCode = (code: string): string => {
  return code.replace(/```python/g, "").replace(/```/g, "");
};

/**
 * Generates Manim code from a text prompt
 */
export const generateCode = async (prompt: string, model: string = 'llama-3.3-70b-versatile'): Promise<string> => {
  try {
    console.log(`Connecting to ${BACKEND_URL}/v1/generate/code`);
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
    
    if (!USE_MOCK_DATA) {
      throw error;
    }
    
    // Fallback to mock data if real request fails
    console.log("Falling back to mock data after error");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return MOCK_CODE;
  }
};

/**
 * Renders a Manim animation from code
 */
export const renderAnimation = async (code: string): Promise<string> => {
  // If using mock data, return mock video URL after a delay
  if (USE_MOCK_DATA) {
    console.log("Using mock video data as server is not available");
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate rendering time
    return MOCK_VIDEO_URL;
  }
  
  try {
    console.log(`Connecting to ${BACKEND_URL}/v1/render/video`);
    const response = await fetch(`${BACKEND_URL}/v1/render/video`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        file_name: "GenScene.py",
        file_class: "GenScene",
        iteration: Math.floor(Math.random() * 1000000),
        project_name: "GenScene",
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to render animation: ${response.status}`);
    }

    const data = await response.json();
    return data.video_url;
  } catch (error) {
    console.error('Error rendering animation:', error);
    
    if (!USE_MOCK_DATA) {
      throw error;
    }
    
    // Fallback to mock data if real request fails
    console.log("Falling back to mock video data after error");
    await new Promise(resolve => setTimeout(resolve, 2000));
    return MOCK_VIDEO_URL;
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

  // Store model in localStorage
  storeModel: (chatId: string, model: string) => {
    try {
      localStorage.setItem(`chat_${chatId}_model`, model);
      return true;
    } catch (error) {
      console.error('Error storing model:', error);
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
      model: localStorage.getItem(`chat_${chatId}_model`) || 'llama-3.3-70b-versatile',
    };
  },

  // Clear cached data for a chat
  clearCachedData: (chatId: string) => {
    try {
      localStorage.removeItem(`chat_${chatId}_code`);
      localStorage.removeItem(`chat_${chatId}_video`);
      localStorage.removeItem(`chat_${chatId}_prompt`);
      localStorage.removeItem(`chat_${chatId}_model`);
      return true;
    } catch (error) {
      console.error('Error clearing cached data:', error);
      return false;
    }
  }
}; 