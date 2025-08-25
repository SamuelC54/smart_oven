import { createFileRoute } from "@tanstack/react-router";
import { RecipeSelector } from "../components/RecipeSelector";

export const Route = createFileRoute("/recipes")({
  component: RecipesPage,
});

function RecipesPage() {
  return <RecipeSelector />;
}
