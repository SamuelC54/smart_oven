import { v } from "convex/values";
import { mutation } from "../_generated/server";

// Toggle favorite status of a recipe
export default mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    await ctx.db.patch(args.id, {
      isFavorite: !recipe.isFavorite,
      updatedAt: Date.now(),
    });

    return { isFavorite: !recipe.isFavorite };
  },
});
