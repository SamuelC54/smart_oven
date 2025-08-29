import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Start a new cooking session
export default mutation({
  args: {
    recipeId: v.optional(v.id("recipes")),
    userId: v.optional(v.string()),
    targetTemp: v.optional(v.number()),
    currentPhase: v.optional(v.number()),
    totalPhases: v.optional(v.number()),
    mode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const sessionId = await ctx.db.insert("cookingSessions", {
      recipeId: args.recipeId,
      recipeName: "Custom Recipe", // Default name
      userId: args.userId || "anonymous",
      status: "active",
      startTime: now,
      targetTemp: args.targetTemp || 180,
      actualTemp: 0,
      currentPhase: args.currentPhase || 1,
      totalPhases: args.totalPhases || 1,
      cookingMode: args.mode === "conventional" ? "timer" : "timer", // Map to valid enum
      fanSpeed: 50, // Default fan speed
    });

    return sessionId;
  },
});
