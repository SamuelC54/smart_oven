import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../db/convex/_generated/api";
import type { Id } from "../../../../db/convex/_generated/dataModel";

// Query all recipes with optional filtering
export const useRecipes = (options?: {
  category?: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  isFavorite?: boolean;
  limit?: number;
}) => {
  return useQuery(api.recipes.list, {
    category: options?.category,
    difficulty: options?.difficulty,
    isFavorite: options?.isFavorite,
    limit: options?.limit,
  });
};

// Get a single recipe by ID
export const useRecipe = (id: Id<"recipes"> | null) => {
  return useQuery(api.recipes.get, id ? { id } : "skip");
};

// Search recipes
export const useSearchRecipes = (searchTerm: string, limit?: number) => {
  return useQuery(api.recipes.search, {
    searchTerm,
    limit,
  });
};

// Get popular recipes
export const usePopularRecipes = (limit?: number) => {
  return useQuery(api.recipes.popular, { limit });
};

// Create a new recipe
export const useCreateRecipe = () => {
  return useMutation(api.recipes.create);
};

// Update a recipe
export const useUpdateRecipe = () => {
  return useMutation(api.recipes.update);
};

// Toggle favorite status
export const useToggleFavorite = () => {
  return useMutation(api.recipes.toggleFavorite);
};

// Delete a recipe
export const useDeleteRecipe = () => {
  return useMutation(api.recipes.remove);
};
