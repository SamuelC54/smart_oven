import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Delete a recipe and its phases
export default mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    // Delete recipe phases first
    const phases = await ctx.db
      .query("recipePhases")
      .withIndex("by_recipe_order", (q) => q.eq("recipeId", args.id))
      .collect();

    for (const phase of phases) {
      await ctx.db.delete(phase._id);
    }

    // Delete the recipe
    await ctx.db.delete(args.id);

    return { success: true };
  },
});
