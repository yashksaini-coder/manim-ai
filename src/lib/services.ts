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
      throw new Error(`Failed to create video: ${response.statusText}`);
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