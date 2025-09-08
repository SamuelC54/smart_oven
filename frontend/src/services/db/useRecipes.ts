import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../db/convex/_generated/api";
import type { Id } from "../../../../db/convex/_generated/dataModel";
import type { FunctionArgs } from "convex/server";

// Query all recipes with optional filtering
export const useRecipes = (
  args?: FunctionArgs<typeof api.queries.listRecipes.default>
) => {
  return useQuery(api.queries.listRecipes.default, args ?? {});
};

// Get a single recipe by ID
export const useRecipe = (id: Id<"recipes"> | null) => {
  return useQuery(api.queries.getRecipe.default, id ? { id } : "skip");
};

// Search recipes
export const useSearchRecipes = (searchTerm: string, limit?: number) => {
  return useQuery(api.queries.searchRecipes.default, {
    searchTerm,
    limit,
  });
};

// Get popular recipes
export const usePopularRecipes = (limit?: number) => {
  return useQuery(api.queries.popularRecipes.default, { limit });
};

// Create a new recipe
export const useCreateRecipe = () => {
  return useMutation(api.mutations.createRecipe.default);
};

// Toggle favorite status
export const useToggleFavorite = () => {
  return useMutation(api.mutations.toggleRecipeFavorite.default);
};

// Delete a recipe
export const useDeleteRecipe = () => {
  return useMutation(api.mutations.deleteRecipe.default);
};
