import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new session
export const createSession = mutation({
  args: {
    clerkId: v.string(),
    prompt: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { clerkId, prompt } = args;
    
    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Use the first ~30 chars of prompt as title if not provided
    const title = args.title || prompt.substring(0, Math.min(prompt.length, 30)) + (prompt.length > 30 ? '...' : '');
    
    const timestamp = new Date().toISOString();
    
    const id = await ctx.db.insert("sessions", {
      clerkId,
      sessionId,
      title,
      prompt,
      createdAt: timestamp,
      updatedAt: timestamp,
      isActive: true,
    });
    
    // Return both the ID and the sessionId for easier access
    return { id, sessionId };
  },
});

// Get a session by ID
export const getSessionById = query({
  args: { 
    sessionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, clerkId } = args;
    
    // First try to find by sessionId
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();
    
    // Verify the session belongs to the user
    if (session && session.clerkId === clerkId) {
      return session;
    }
    
    return null;
  },
});

// Get all sessions for a user
export const getSessionsByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .collect();
    
    // Sort by updatedAt (newest first)
    return sessions.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },
});

// Update a session with video ID
export const updateSessionWithVideo = mutation({
  args: {
    sessionId: v.string(),
    clerkId: v.string(),
    videoId: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, clerkId, videoId } = args;
    
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();
    
    if (!session || session.clerkId !== clerkId) {
      throw new Error("Session not found or unauthorized");
    }
    
    return await ctx.db.patch(session._id, { 
      videoId,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Delete a session and all its messages
export const deleteSession = mutation({
  args: {
    sessionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, clerkId } = args;
    
    // Find the session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .first();
    
    if (!session || session.clerkId !== clerkId) {
      throw new Error("Session not found or unauthorized");
    }
    
    // Delete all messages in this session
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    // Delete the session
    await ctx.db.delete(session._id);
    
    return { success: true };
  },
}); 