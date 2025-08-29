import { v } from "convex/values";
import { query } from "../_generated/server";

// Get popular recipes based on some criteria (here we'll use cookCount)
export default query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_rating")
      .order("desc")
      .take(args.limit || 10);

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
