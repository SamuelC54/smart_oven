import { v } from "convex/values";
import { query } from "../_generated/server";

// Query all recipes with optional filtering
export default query({
  args: {
    category: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard"))
    ),
    isFavorite: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query;

    if (args.category && args.category !== "all") {
      query = ctx.db
        .query("recipes")
        .withIndex("by_category", (q) => q.eq("category", args.category!));
    } else if (args.difficulty) {
      query = ctx.db
        .query("recipes")
        .withIndex("by_difficulty", (q) =>
          q.eq("difficulty", args.difficulty!)
        );
    } else if (args.isFavorite !== undefined) {
      query = ctx.db
        .query("recipes")
        .withIndex("by_favorite", (q) => q.eq("isFavorite", args.isFavorite!));
    } else {
      query = ctx.db.query("recipes").withIndex("by_created_at");
    }

    const recipes = await query.order("desc").take(args.limit || 50);

    // Get phases for each recipe
    const recipesWithPhases = await Promise.all(
      recipes.map(async (recipe) => {
        const phases = await ctx.db
          .query("recipePhases")
          .withIndex("by_recipe_order", (q) => q.eq("recipeId", recipe._id))
          .order("asc")
          .collect();

        return {
          ...recipe,
          phases: phases.map((phase) => ({
            id: phase._id,
            name: phase.name,
            description: phase.description,
            temperature: phase.temperature,
            duration: phase.duration,
            mode: phase.mode,
            stopCondition: phase.stopCondition,
            icon: phase.icon,
          })),
        };
      })
    );

    return recipesWithPhases;
  },
});
