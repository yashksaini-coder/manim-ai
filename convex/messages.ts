import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new message
export const createMessage = mutation({
  args: {
    clerkId: v.string(),
    sessionId: v.string(),
    videoId: v.optional(v.string()),
    role: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const { clerkId, sessionId, videoId, role, content } = args;
    
    // Update the corresponding session's updatedAt timestamp
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    
    if (sessions.length > 0) {
      await ctx.db.patch(sessions[0]._id, { 
        updatedAt: new Date().toISOString() 
      });
    }
    
    return await ctx.db.insert("messages", {
      clerkId,
      sessionId,
      videoId,
      role,
      content,
      timestamp: new Date().toISOString(),
    });
  },
});

// Get messages by session ID
export const getMessagesBySessionId = query({
  args: { 
    sessionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, clerkId } = args;
    
    // First filter by sessionId
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    
    // Then filter by clerkId
    const userMessages = messages.filter(msg => msg.clerkId === clerkId);
    
    // Sort messages by timestamp
    return userMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  },
});

// Get the latest message in a session
export const getLatestMessageBySessionId = query({
  args: { 
    sessionId: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const { sessionId, clerkId } = args;
    
    // First filter by sessionId
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", sessionId))
      .collect();
    
    // Then filter by clerkId
    const userMessages = messages.filter(msg => msg.clerkId === clerkId);
    
    // Sort messages by timestamp and get the latest
    if (userMessages.length === 0) return null;
    
    return userMessages.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  },
}); 