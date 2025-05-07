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
        projectName: v.string(),
        iteration: v.number(),
        videoUrl: v.string(),
        fileName: v.optional(v.string()),
        fileClass: v.optional(v.string()),
        aspectRatio: v.optional(v.string()),
        createdAt: v.string(),
        updatedAt: v.string(),
    }).index("by_clerkId", ["clerkId"]),
});