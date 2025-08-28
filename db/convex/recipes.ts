import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Query all recipes with optional filtering
export const list = query({
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

// Get a single recipe by ID
export const get = query({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) return null;

    const phases = await ctx.db
      .query("recipePhases")
      .withIndex("by_recipe_order", (q) => q.eq("recipeId", args.id))
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

// Search recipes by name or ingredients
export const search = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_created_at")
      .order("desc")
      .collect();

    const searchTerm = args.searchTerm.toLowerCase();

    const filteredRecipes = recipes
      .filter(
        (recipe) =>
          recipe.name.toLowerCase().includes(searchTerm) ||
          recipe.description.toLowerCase().includes(searchTerm) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchTerm)
          )
      )
      .slice(0, args.limit || 20);

    // Get phases for filtered recipes
    const recipesWithPhases = await Promise.all(
      filteredRecipes.map(async (recipe) => {
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

// Create a new recipe
export const create = mutation({
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
      isFavorite: false,
      tips: args.tips,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });

    // Create the phases
    const phasePromises = args.phases.map((phase, index) =>
      ctx.db.insert("recipePhases", {
        recipeId,
        name: phase.name,
        description: phase.description,
        temperature: phase.temperature,
        duration: phase.duration,
        mode: phase.mode,
        stopCondition: phase.stopCondition,
        icon: phase.icon,
        order: index,
      })
    );

    await Promise.all(phasePromises);

    return recipeId;
  },
});

// Update a recipe
export const update = mutation({
  args: {
    id: v.id("recipes"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    servings: v.optional(v.number()),
    difficulty: v.optional(
      v.union(v.literal("Easy"), v.literal("Medium"), v.literal("Hard"))
    ),
    rating: v.optional(v.number()),
    image: v.optional(v.string()),
    description: v.optional(v.string()),
    ingredients: v.optional(v.array(v.string())),
    totalTime: v.optional(v.number()),
    tips: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) throw new Error("Recipe not found");

    await ctx.db.patch(args.id, {
      isFavorite: !recipe.isFavorite,
      updatedAt: Date.now(),
    });

    return !recipe.isFavorite;
  },
});

// Delete a recipe and its phases
export const remove = mutation({
  args: { id: v.id("recipes") },
  handler: async (ctx, args) => {
    // Delete all phases first
    const phases = await ctx.db
      .query("recipePhases")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.id))
      .collect();

    await Promise.all(phases.map((phase) => ctx.db.delete(phase._id)));

    // Delete the recipe
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// Get popular recipes (by rating)
export const popular = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query("recipes")
      .withIndex("by_rating")
      .order("desc")
      .take(args.limit || 10);

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
