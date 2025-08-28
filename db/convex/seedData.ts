import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Seed the database with sample recipes and data
export const seedDatabase = mutation({
  args: { reset: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    // If reset is true, clear existing data (be careful!)
    if (args.reset) {
      // This is a destructive operation - only use in development
      const recipes = await ctx.db.query("recipes").collect();
      for (const recipe of recipes) {
        await ctx.db.delete(recipe._id);
      }

      const phases = await ctx.db.query("recipePhases").collect();
      for (const phase of phases) {
        await ctx.db.delete(phase._id);
      }
    }

    const now = Date.now();

    // Sample recipes data
    const sampleRecipes = [
      {
        name: "Classic Roasted Chicken",
        category: "Main Course",
        servings: 4,
        difficulty: "Medium" as const,
        rating: 4.5,
        image: "roasted-chicken",
        description:
          "Perfectly seasoned and roasted chicken with crispy skin and juicy meat",
        ingredients: [
          "1 whole chicken (3-4 lbs)",
          "2 tbsp olive oil",
          "1 tsp salt",
          "1/2 tsp black pepper",
          "1 tsp garlic powder",
          "1 tsp paprika",
          "1 lemon, halved",
          "Fresh herbs (rosemary, thyme)",
        ],
        totalTime: 75,
        tips: [
          "Pat the chicken completely dry before seasoning",
          "Let the chicken rest for 10 minutes after cooking",
          "Use a meat thermometer to ensure internal temperature reaches 165°F",
        ],
        phases: [
          {
            name: "Preheat",
            description: "Preheat oven to roasting temperature",
            temperature: 200,
            duration: 10,
            mode: "preheat" as const,
            stopCondition: "time" as const,
            icon: "🔥",
          },
          {
            name: "Initial Roast",
            description: "High heat roasting for crispy skin",
            temperature: 220,
            duration: 20,
            mode: "conventional" as const,
            stopCondition: "time" as const,
            icon: "🍗",
          },
          {
            name: "Finish Cooking",
            description: "Lower temperature to finish cooking through",
            temperature: 180,
            duration: 45,
            mode: "conventional" as const,
            stopCondition: "temperature" as const,
            icon: "🌡️",
          },
        ],
      },
      {
        name: "Chocolate Chip Cookies",
        category: "Dessert",
        servings: 24,
        difficulty: "Easy" as const,
        rating: 4.8,
        image: "chocolate-chip-cookies",
        description:
          "Soft and chewy chocolate chip cookies with the perfect balance of sweetness",
        ingredients: [
          "2 1/4 cups all-purpose flour",
          "1 tsp baking soda",
          "1 tsp salt",
          "1 cup butter, softened",
          "3/4 cup granulated sugar",
          "3/4 cup brown sugar",
          "2 large eggs",
          "2 tsp vanilla extract",
          "2 cups chocolate chips",
        ],
        totalTime: 25,
        tips: [
          "Don't overbake - cookies should look slightly underdone when you remove them",
          "Chill the dough for 30 minutes for thicker cookies",
          "Use parchment paper for easy removal",
        ],
        phases: [
          {
            name: "Preheat",
            description: "Preheat oven for baking",
            temperature: 190,
            duration: 8,
            mode: "preheat" as const,
            stopCondition: "time" as const,
            icon: "🔥",
          },
          {
            name: "Bake",
            description: "Bake cookies until golden brown",
            temperature: 190,
            duration: 12,
            mode: "conventional" as const,
            stopCondition: "time" as const,
            icon: "🍪",
          },
        ],
      },
      {
        name: "Artisan Sourdough Bread",
        category: "Bread",
        servings: 8,
        difficulty: "Hard" as const,
        rating: 4.7,
        image: "sourdough-bread",
        description:
          "Traditional sourdough bread with a crispy crust and tangy flavor",
        ingredients: [
          "500g bread flour",
          "375ml water",
          "100g active sourdough starter",
          "10g salt",
        ],
        totalTime: 45,
        tips: [
          "Steam is crucial for a good crust - place a pan of water in the oven",
          "Score the dough just before baking for proper expansion",
          "The bread is done when it sounds hollow when tapped",
        ],
        phases: [
          {
            name: "Steam Preheat",
            description: "Preheat with steam setup",
            temperature: 240,
            duration: 20,
            mode: "steam" as const,
            stopCondition: "time" as const,
            icon: "💨",
          },
          {
            name: "Initial Bake",
            description: "High heat with steam",
            temperature: 240,
            duration: 15,
            mode: "steam" as const,
            stopCondition: "time" as const,
            icon: "🍞",
          },
          {
            name: "Finish Baking",
            description: "Reduce heat and remove steam",
            temperature: 210,
            duration: 25,
            mode: "conventional" as const,
            stopCondition: "time" as const,
            icon: "🌡️",
          },
        ],
      },
    ];

    const createdRecipes = [];

    // Create recipes and their phases
    for (const recipeData of sampleRecipes) {
      const { phases, ...recipeInfo } = recipeData;

      const recipeId = await ctx.db.insert("recipes", {
        ...recipeInfo,
        isFavorite: Math.random() > 0.7, // Randomly mark some as favorites
        createdAt: now,
        updatedAt: now,
      });

      // Create phases for this recipe
      for (let i = 0; i < phases.length; i++) {
        await ctx.db.insert("recipePhases", {
          recipeId,
          ...phases[i],
          order: i,
        });
      }

      createdRecipes.push(recipeId);
    }

    // Add initial system log
    await ctx.db.insert("systemLogs", {
      level: "info",
      message: `Database seeded with ${createdRecipes.length} recipes`,
      component: "seed-data",
      timestamp: now,
      metadata: {
        recipesCreated: createdRecipes.length,
        reset: args.reset || false,
      },
    });

    return {
      success: true,
      recipesCreated: createdRecipes.length,
      message: "Database seeded successfully",
    };
  },
});
