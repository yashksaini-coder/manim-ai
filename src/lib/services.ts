// Client-side API helper functions

// Session APIs
export async function createSession(clerkId: string, prompt: string, title?: string) {
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        prompt,
        title: title || prompt.substring(0, Math.min(prompt.length, 30)) + (prompt.length > 30 ? '...' : ''),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

export async function getSessions(clerkId: string) {
  try {
    const response = await fetch(`/api/session?clerkId=${clerkId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch sessions: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
}

export async function getSession(clerkId: string, sessionId: string) {
  try {
    const response = await fetch(`/api/session?clerkId=${clerkId}&sessionId=${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch session: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching session:', error);
    throw error;
  }
}

export async function deleteSession(clerkId: string, sessionId: string) {
  try {
    const response = await fetch(`/api/session?clerkId=${clerkId}&sessionId=${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete session: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
}

export async function updateSessionWithVideo(clerkId: string, sessionId: string, videoId: string) {
  try {
    const response = await fetch('/api/session', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        sessionId,
        videoId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update session: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating session:', error);
    throw error;
  }
}

// Message APIs
export async function createMessage(clerkId: string, sessionId: string, role: string, content: string, videoId?: string) {
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        sessionId,
        role,
        content,
        videoId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create message: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating message:', error);
    throw error;
  }
}

export async function getMessages(clerkId: string, sessionId: string) {
  try {
    const response = await fetch(`/api/message?clerkId=${clerkId}&sessionId=${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch messages: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
}

export async function getLatestMessage(clerkId: string, sessionId: string) {
  try {
    const response = await fetch(`/api/message?clerkId=${clerkId}&sessionId=${sessionId}&latest=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch latest message: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching latest message:', error);
    throw error;
  }
}

// Video APIs
export async function createVideo(clerkId: string, videoUrl: string, code: string) {
  try {
    if (!clerkId || !videoUrl || !code) {
      console.error('Missing required parameters for createVideo:', { clerkId, videoUrl: !!videoUrl, code: !!code });
      throw new Error('Missing required parameters: clerkId, videoUrl, code');
    }

    const response = await fetch('/api/video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        videoUrl,
        code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server error response:', errorData);
      throw new Error(`Failed to create video: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

export async function getVideos(clerkId: string) {
  try {
    const response = await fetch(`/api/video?clerkId=${clerkId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch videos: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

export async function updateVideo(id: string, updateData: any) {
  try {
    const response = await fetch('/api/video', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        ...updateData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update video: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
}

// Chat APIs
export async function getChatCompletion(clerkId: string, sessionId: string, prompt: string, model?: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        sessionId,
        prompt,
        model
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Chat API error response:', errorData);
      throw new Error(`Failed to get chat completion: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}

export async function getChatHistory(clerkId: string, sessionId: string) {
  try {
    const response = await fetch(`/api/chat?clerkId=${clerkId}&sessionId=${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    throw error;
  }
}

// Animation APIs
export async function generateAnimation(clerkId: string, prompt: string, sessionId?: string, model?: string) {
  try {
    const response = await fetch('/api/animation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clerkId,
        sessionId,
        prompt,
        model: model || 'llama-3.3-70b-versatile',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Animation API error response:', errorData);
      throw new Error(`Failed to generate animation: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating animation:', error);
    throw error;
  }
}

export async function checkAnimationStatus(videoId: string) {
  try {
    const response = await fetch(`/api/animation?videoId=${videoId}`);

    if (!response.ok) {
      throw new Error(`Failed to check animation status: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking animation status:', error);
    throw error;
  }
} 