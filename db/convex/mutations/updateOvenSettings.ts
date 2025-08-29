import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Update oven settings
export default mutation({
  args: {
    userId: v.string(),
    temperatureUnit: v.optional(
      v.union(v.literal("celsius"), v.literal("fahrenheit"))
    ),
    preheating: v.optional(v.boolean()),
    alertSound: v.optional(v.boolean()),
    alertVolume: v.optional(v.number()),
    cookingMode: v.optional(v.string()),
    fanSpeed: v.optional(v.number()),
    brightness: v.optional(v.number()),
    ovenLight: v.optional(v.boolean()),
    autoShutoff: v.optional(v.boolean()),
    childLock: v.optional(v.boolean()),
    nightMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingSettings = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();

    const now = Date.now();

    const settingsData = {
      userId: args.userId,
      temperatureUnit: args.temperatureUnit || ("celsius" as const),
      preheating: args.preheating ?? true,
      alertSound: args.alertSound ?? true,
      alertVolume: args.alertVolume ?? 70,
      cookingMode: args.cookingMode || "conventional",
      fanSpeed: args.fanSpeed ?? 50,
      brightness: args.brightness ?? 80,
      ovenLight: args.ovenLight ?? true,
      autoShutoff: args.autoShutoff ?? true,
      childLock: args.childLock ?? false,
      nightMode: args.nightMode ?? false,
      updatedAt: now,
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settingsData);
      return existingSettings._id;
    } else {
      return await ctx.db.insert("ovenSettings", settingsData);
    }
  },
});
