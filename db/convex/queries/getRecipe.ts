import { v } from "convex/values";
import { query } from "../_generated/server";

// Get a single recipe by ID
export default query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) {
      return null;
    }

    // Get recipe phases
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
  },
});
