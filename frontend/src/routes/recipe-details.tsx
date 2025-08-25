import { createFileRoute } from "@tanstack/react-router";
import { RecipeDetails } from "../components/RecipeDetails";

export const Route = createFileRoute("/recipe-details")({
  component: RecipeDetailsPage,
});

function RecipeDetailsPage() {
  return <RecipeDetails />;
}
