import { v } from "convex/values";
import { query } from "../_generated/server";

// Search recipes by name or description
export default query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allRecipes = await ctx.db.query("recipes").collect();

    const searchTerm = args.searchTerm.toLowerCase();

    const filteredRecipes = allRecipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm)
        )
    );

    // Limit results
    const limitedRecipes = filteredRecipes.slice(0, args.limit || 20);

    // Get phases for each recipe
    const recipesWithPhases = await Promise.all(
      limitedRecipes.map(async (recipe) => {
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
