import { api } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createVideo = mutation({
  args: {
    clerkId: v.string(),
    projectName: v.string(),
    iteration: v.number(),
    videoUrl: v.string(),
    fileName: v.optional(v.string()),
    fileClass: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const videoId = await ctx.db.insert("videos", {
      ...args,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    // Increment the user's videoCount
    await ctx.runMutation(api.users.incrementVideoCount, { clerkId: args.clerkId });
    return videoId;
  },
});

export const updateVideo = mutation({
  args: {
    id: v.id("videos"),
    projectName: v.optional(v.string()),
    iteration: v.optional(v.number()),
    videoUrl: v.optional(v.string()),
    fileName: v.optional(v.string()),
    fileClass: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      ...args,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const getVideosByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("videos")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .collect();
  },
}); 