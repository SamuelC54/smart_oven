import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get active cooking session
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const activeSession = await ctx.db
      .query("cookingSessions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();

    return activeSession;
  },
});

// List cooking sessions with optional filtering
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("active"),
        v.literal("paused"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query;

    if (args.status) {
      query = ctx.db
        .query("cookingSessions")
        .withIndex("by_status", (q) => q.eq("status", args.status!));
    } else {
      query = ctx.db.query("cookingSessions").withIndex("by_start_time");
    }

    return await query.order("desc").take(args.limit || 50);
  },
});

// Get a single cooking session
export const get = query({
  args: { id: v.id("cookingSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get cooking session statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("cookingSessions").collect();

    const stats = {
      total: sessions.length,
      active: sessions.filter((s) => s.status === "active").length,
      completed: sessions.filter((s) => s.status === "completed").length,
      cancelled: sessions.filter((s) => s.status === "cancelled").length,
      totalTime: sessions.reduce((acc, s) => {
        if (s.endTime && s.startTime) {
          return acc + (s.endTime - s.startTime);
        }
        return acc;
      }, 0),
    };

    return stats;
  },
});

// Start a new cooking session
export const start = mutation({
  args: {
    recipeId: v.optional(v.id("recipes")),
    recipeName: v.string(),
    targetTemp: v.number(),
    targetHumidity: v.optional(v.number()),
    fanSpeed: v.number(),
    cookingMode: v.union(
      v.literal("timer"),
      v.literal("probe"),
      v.literal("manual")
    ),
    totalPhases: v.number(),
    notes: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("cookingSessions", {
      recipeId: args.recipeId,
      recipeName: args.recipeName,
      startTime: Date.now(),
      targetTemp: args.targetTemp,
      targetHumidity: args.targetHumidity,
      fanSpeed: args.fanSpeed,
      cookingMode: args.cookingMode,
      status: "active",
      currentPhase: 0,
      totalPhases: args.totalPhases,
      notes: args.notes,
      userId: args.userId,
    });

    return sessionId;
  },
});

// Update a cooking session
export const update = mutation({
  args: {
    id: v.id("cookingSessions"),
    actualTemp: v.optional(v.number()),
    humidity: v.optional(v.number()),
    currentPhase: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

// Pause a cooking session
export const pause = mutation({
  args: { id: v.id("cookingSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "paused" });
    return args.id;
  },
});

// Resume a cooking session
export const resume = mutation({
  args: { id: v.id("cookingSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "active" });
    return args.id;
  },
});

// Complete a cooking session
export const complete = mutation({
  args: { id: v.id("cookingSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      endTime: Date.now(),
    });
    return args.id;
  },
});

// Cancel a cooking session
export const cancel = mutation({
  args: { id: v.id("cookingSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "cancelled",
      endTime: Date.now(),
    });
    return args.id;
  },
});

// Move to next phase
export const nextPhase = mutation({
  args: { id: v.id("cookingSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) throw new Error("Session not found");

    const nextPhase = Math.min(
      session.currentPhase + 1,
      session.totalPhases - 1
    );
    await ctx.db.patch(args.id, { currentPhase: nextPhase });

    return nextPhase;
  },
});
