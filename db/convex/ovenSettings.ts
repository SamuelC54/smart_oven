import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get oven settings for a user
export const get = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!settings) {
      // Return default settings if none exist
      return {
        userId: args.userId,
        temperatureUnit: "celsius" as const,
        preheating: true,
        alertSound: true,
        alertVolume: 50,
        cookingMode: "conventional",
        fanSpeed: 0,
        childLock: false,
        autoShutoff: true,
        ovenLight: true,
        brightness: 100,
        nightMode: false,
        updatedAt: Date.now(),
      };
    }

    return settings;
  },
});

// Get temperature unit preference
export const getTemperatureUnit = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const settings = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return settings?.temperatureUnit || "celsius";
  },
});

// Get all oven settings
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ovenSettings").collect();
  },
});

// Update oven settings
export const update = mutation({
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
    childLock: v.optional(v.boolean()),
    autoShutoff: v.optional(v.boolean()),
    ovenLight: v.optional(v.boolean()),
    brightness: v.optional(v.number()),
    nightMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const existing = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...updates,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      // Provide default values for required fields when creating new settings
      const defaultSettings = {
        temperatureUnit: "celsius" as const,
        preheating: true,
        alertSound: true,
        alertVolume: 50,
        cookingMode: "conventional",
        fanSpeed: 0,
        childLock: false,
        autoShutoff: true,
        ovenLight: true,
        brightness: 100,
        nightMode: false,
      };

      return await ctx.db.insert("ovenSettings", {
        userId,
        ...defaultSettings,
        ...updates,
        updatedAt: Date.now(),
      });
    }
  },
});

// Reset oven settings to defaults
export const reset = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const defaultSettings = {
      temperatureUnit: "celsius" as const,
      preheating: true,
      alertSound: true,
      alertVolume: 50,
      cookingMode: "conventional",
      fanSpeed: 0,
      childLock: false,
      autoShutoff: true,
      ovenLight: true,
      brightness: 100,
      nightMode: false,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, defaultSettings);
      return existing._id;
    } else {
      return await ctx.db.insert("ovenSettings", {
        userId: args.userId,
        ...defaultSettings,
      });
    }
  },
});

// Update a specific setting
export const updateSetting = mutation({
  args: {
    userId: v.string(),
    setting: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const update = {
      [args.setting]: args.value,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, update);
      return existing._id;
    } else {
      // Provide default values for required fields when creating new settings
      const defaultSettings = {
        temperatureUnit: "celsius" as const,
        preheating: true,
        alertSound: true,
        alertVolume: 50,
        cookingMode: "conventional",
        fanSpeed: 0,
        childLock: false,
        autoShutoff: true,
        ovenLight: true,
        brightness: 100,
        nightMode: false,
      };

      return await ctx.db.insert("ovenSettings", {
        userId: args.userId,
        ...defaultSettings,
        ...update,
      });
    }
  },
});

// Remove oven settings
export const remove = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ovenSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    return args.userId;
  },
});

// Convert temperature between units
export const convertTemperature = query({
  args: {
    temperature: v.number(),
    fromUnit: v.union(v.literal("celsius"), v.literal("fahrenheit")),
    toUnit: v.union(v.literal("celsius"), v.literal("fahrenheit")),
  },
  handler: async (ctx, args) => {
    if (args.fromUnit === args.toUnit) {
      return args.temperature;
    }

    if (args.fromUnit === "celsius" && args.toUnit === "fahrenheit") {
      return (args.temperature * 9) / 5 + 32;
    }

    if (args.fromUnit === "fahrenheit" && args.toUnit === "celsius") {
      return ((args.temperature - 32) * 5) / 9;
    }

    return args.temperature;
  },
});
