import { createFileRoute } from "@tanstack/react-router";
import { RecipeDetails } from "../../components/RecipeDetails";

export const Route = createFileRoute("/recipes/$recipeId")({
  component: RecipeDetailsPage,
});

function RecipeDetailsPage() {
  const { recipeId } = Route.useParams();
  return <RecipeDetails recipeId={recipeId} />;
}
