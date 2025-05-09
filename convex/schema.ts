import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { scheduler } from "timers/promises";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        videoCount: v.number(), 
    }).index("by_clerkId", ["clerkId"]),

    videos: defineTable({
        clerkId: v.string(),
        videoUrl: v.string(),
        code: v.string(),
        createdAt: v.string(),
        updatedAt: v.string(),
    }).index("by_clerkId", ["clerkId"]),
    
    messages: defineTable({
        clerkId: v.string(),
        sessionId: v.string(),
        videoId: v.optional(v.string()),
        role: v.string(), // "user" or "ai"
        content: v.string(),
        timestamp: v.string(),
    }).index("by_clerkId", ["clerkId"])
      .index("by_sessionId", ["sessionId"])
      .index("by_clerkId_and_sessionId", ["clerkId", "sessionId"]),
      
    sessions: defineTable({
        clerkId: v.string(),
        sessionId: v.string(),
        title: v.string(),
        prompt: v.string(),
        videoId: v.optional(v.string()),
        createdAt: v.string(),
        updatedAt: v.string(),
        isActive: v.boolean(),
    }).index("by_clerkId", ["clerkId"])
      .index("by_sessionId", ["sessionId"]),
});