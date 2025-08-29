import { v } from "convex/values";
import { query } from "../_generated/server";

// Get oven settings for a user
export default query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    if (!settings) {
      // Return default settings
      return {
        userId: args.userId,
        temperatureUnit: "celsius" as const,
        preheating: true,
        alertSound: true,
        alertVolume: 70,
        cookingMode: "conventional",
        fanSpeed: 50,
        brightness: 80,
        ovenLight: true,
        autoShutoff: true,
        childLock: false,
        nightMode: false,
        updatedAt: Date.now(),
      };
    }

    return settings;
  },
});
