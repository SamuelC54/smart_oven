import { useAtom } from "jotai";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  Thermometer,
  Play,
  ChefHat,
  Flame,
  Wind,
  Zap,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { type EnhancedRecipe, selectedPhaseAtom } from "../store/atoms";

interface RecipeDetailsProps {
  recipe: EnhancedRecipe;
  onBack: () => void;
  onStartRecipe: (recipe: EnhancedRecipe) => void;
}

export function RecipeDetails({
  recipe,
  onBack,
  onStartRecipe,
}: RecipeDetailsProps) {
  const [selectedPhase, setSelectedPhase] = useAtom(selectedPhaseAtom);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "preheat":
        return <Flame className="w-3 h-3" />;
      case "conventional":
        return <Thermometer className="w-3 h-3" />;
      case "convection":
        return <Wind className="w-3 h-3" />;
      case "grill":
        return <Zap className="w-3 h-3" />;
      case "steam":
        return <Wind className="w-3 h-3" />;
      default:
        return <ChefHat className="w-3 h-3" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "preheat":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "conventional":
        return "bg-red-100 text-red-700 border-red-200";
      case "convection":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "grill":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "steam":
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="h-full flex flex-col p-3 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="w-10 h-10 rounded-full border-2 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-medium text-gray-800">Recipe Details</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {/* Hero Card */}
        <Card className="overflow-hidden rounded-2xl border-2 shadow-md">
          <div className="aspect-video relative">
            <ImageWithFallback
              src={`https://images.unsplash.com/800x600/?${recipe.image}`}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            {recipe.isFavorite && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <h2 className="text-xl font-bold mb-1">{recipe.name}</h2>
              <p className="text-sm opacity-90">{recipe.description}</p>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-gray-600" />
                <span>{recipe.totalTime} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-gray-600" />
                <span>{recipe.servings} servings</span>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-yellow-700">
                  {recipe.rating}
                </span>
              </div>
              <Badge
                className={`${getDifficultyColor(
                  recipe.difficulty
                )} border text-xs px-2 py-1`}
              >
                {recipe.difficulty}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Start Cooking Button */}
        <Button
          size="lg"
          onClick={() => onStartRecipe(recipe)}
          className="w-full h-12 rounded-xl text-base gap-2"
        >
          <Play className="w-5 h-5" />
          Start Cooking
        </Button>

        {/* Cooking Phases */}
        <Card className="p-3 rounded-2xl border-2 shadow-md">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Cooking Phases
          </h3>

          <div className="space-y-2 mb-4">
            {recipe.phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedPhase === index
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedPhase(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-white rounded-full border flex items-center justify-center font-bold text-xs text-gray-700">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 text-sm">
                        {phase.name}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      className={`${getModeColor(
                        phase.mode
                      )} border text-xs px-1.5 py-0.5`}
                    >
                      {getModeIcon(phase.mode)}
                      <span className="ml-1 capitalize">{phase.mode}</span>
                    </Badge>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-800">
                        {phase.temperature}°C
                      </div>
                      <div className="text-xs text-gray-600">
                        {phase.duration} min
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Phase Details */}
          {recipe.phases[selectedPhase] && (
            <Card className="p-3 rounded-xl bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {recipe.phases[selectedPhase].icon}
                </span>
                <h4 className="text-sm font-medium text-blue-800">
                  Phase {selectedPhase + 1}: {recipe.phases[selectedPhase].name}
                </h4>
              </div>
              <p className="text-xs text-blue-700 mb-2">
                {recipe.phases[selectedPhase].description}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-800">
                    {recipe.phases[selectedPhase].temperature}°C
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  <span className="text-blue-800">
                    {recipe.phases[selectedPhase].duration} min
                  </span>
                </div>
              </div>
            </Card>
          )}
        </Card>

        {/* Ingredients */}
        <Card className="p-3 rounded-2xl border-2 shadow-md">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Ingredients
          </h3>
          <ul className="space-y-1">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <span className="text-xs text-gray-700">{ingredient}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Cooking Tips */}
        {recipe.tips.length > 0 && (
          <Card className="p-3 rounded-2xl border-2 shadow-md">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              💡 Pro Tips
            </h3>
            <ul className="space-y-2">
              {recipe.tips.map((tip, index) => (
                <li
                  key={index}
                  className="p-2 bg-yellow-50 rounded-xl border border-yellow-200"
                >
                  <p className="text-xs text-yellow-800">{tip}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
