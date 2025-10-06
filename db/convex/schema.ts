import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Recipes table - stores all cooking recipes
  recipes: defineTable({
    name: v.string(),
    category: v.string(),
    servings: v.number(),
    difficulty: v.union(
      v.literal("Easy"),
      v.literal("Medium"),
      v.literal("Hard")
    ),
    rating: v.number(),
    image: v.string(),
    description: v.string(),
    ingredients: v.array(v.string()),
    totalTime: v.number(), // in minutes
    isFavorite: v.boolean(),
    tips: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // User who created the recipe (optional for now)
    createdBy: v.optional(v.string()),
  })
    .index("by_category", ["category"])
    .index("by_difficulty", ["difficulty"])
    .index("by_rating", ["rating"])
    .index("by_favorite", ["isFavorite"])
    .index("by_created_at", ["createdAt"]),

  // Recipe phases - cooking steps for each recipe
  recipePhases: defineTable({
    recipeId: v.id("recipes"),
    name: v.string(),
    description: v.string(),
    temperature: v.number(),
    duration: v.number(), // in minutes
    mode: v.union(
      v.literal("preheat"),
      v.literal("conventional"),
      v.literal("convection"),
      v.literal("grill"),
      v.literal("steam")
    ),
    stopCondition: v.union(v.literal("time"), v.literal("temperature")),
    icon: v.string(),
    order: v.number(), // for phase ordering
  })
    .index("by_recipe", ["recipeId"])
    .index("by_recipe_order", ["recipeId", "order"]),

  // Oven settings - user preferences and configurations
  ovenSettings: defineTable({
    userId: v.optional(v.string()), // For multi-user support later
    temperatureUnit: v.union(v.literal("celsius"), v.literal("fahrenheit")),
    preheating: v.boolean(),
    alertSound: v.boolean(),
    alertVolume: v.number(),
    cookingMode: v.string(),
    fanSpeed: v.number(),
    childLock: v.boolean(),
    autoShutoff: v.boolean(),
    ovenLight: v.boolean(),
    brightness: v.number(),
    nightMode: v.boolean(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Cooking sessions - track active and historical cooking sessions
  cookingSessions: defineTable({
    recipeId: v.optional(v.id("recipes")),
    recipeName: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    targetTemp: v.number(),
    actualTemp: v.optional(v.number()),
    humidity: v.optional(v.number()),
    targetHumidity: v.optional(v.number()),
    fanSpeed: v.number(),
    cookingMode: v.union(
      v.literal("timer"),
      v.literal("probe"),
      v.literal("manual")
    ),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    currentPhase: v.number(),
    totalPhases: v.number(),
    notes: v.optional(v.string()),
    userId: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_recipe", ["recipeId"])
    .index("by_user", ["userId"])
    .index("by_start_time", ["startTime"]),

  // User profiles - for future multi-user support
  users: defineTable({
    email: v.string(),
    name: v.string(),
    preferences: v.object({
      defaultTemperatureUnit: v.union(
        v.literal("celsius"),
        v.literal("fahrenheit")
      ),
      favoriteCategories: v.array(v.string()),
      skillLevel: v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      ),
    }),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  }).index("by_email", ["email"]),

  // Recipe collections - user-created recipe groups
  recipeCollections: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
    recipeIds: v.array(v.id("recipes")),
    isPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_public", ["isPublic"])
    .index("by_created_at", ["createdAt"]),

  // System logs - for debugging and monitoring
  systemLogs: defineTable({
    level: v.union(
      v.literal("debug"),
      v.literal("info"),
      v.literal("warn"),
      v.literal("error")
    ),
    message: v.string(),
    component: v.string(), // e.g., "oven-controller", "temperature-sensor", "frontend"
    metadata: v.optional(v.any()),
    timestamp: v.number(),
    sessionId: v.optional(v.id("cookingSessions")),
  })
    .index("by_level", ["level"])
    .index("by_component", ["component"])
    .index("by_timestamp", ["timestamp"])
    .index("by_session", ["sessionId"]),

  // Device status - current hardware status
  deviceStatus: defineTable({
    deviceType: v.union(
      v.literal("temperature_sensor"),
      v.literal("heating_element")
    ),
    deviceId: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("offline"),
      v.literal("error")
    ),
    lastReading: v.optional(v.number()),
    lastUpdate: v.number(),
    metadata: v.optional(v.any()), // device-specific data
  })
    .index("by_device_type", ["deviceType"])
    .index("by_device_id", ["deviceId"])
    .index("by_status", ["status"])
    .index("by_last_update", ["lastUpdate"]),
});
