import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Create a new recipe
export default mutation({
  args: {
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
    totalTime: v.number(),
    tips: v.array(v.string()),
    phases: v.array(
      v.object({
        name: v.string(),
        description: v.string(),
        temperature: v.number(),
        duration: v.number(),
        mode: v.union(
          v.literal("preheat"),
          v.literal("conventional"),
          v.literal("convection"),
          v.literal("grill"),
          v.literal("steam")
        ),
        stopCondition: v.union(v.literal("time"), v.literal("temperature")),
        icon: v.string(),
      })
    ),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // Create the recipe
    const recipeId = await ctx.db.insert("recipes", {
      name: args.name,
      category: args.category,
      servings: args.servings,
      difficulty: args.difficulty,
      rating: args.rating,
      image: args.image,
      description: args.description,
      ingredients: args.ingredients,
      totalTime: args.totalTime,
      tips: args.tips,
      isFavorite: false,
      createdBy: args.createdBy || "anonymous",
      createdAt: now,
      updatedAt: now,
    });

    // Create the recipe phases
    for (let i = 0; i < args.phases.length; i++) {
      const phase = args.phases[i];
      await ctx.db.insert("recipePhases", {
        recipeId,
        name: phase.name,
        description: phase.description,
        temperature: phase.temperature,
        duration: phase.duration,
        mode: phase.mode,
        stopCondition: phase.stopCondition,
        icon: phase.icon,
        order: i + 1,
      });
    }

    return recipeId;
  },
});
