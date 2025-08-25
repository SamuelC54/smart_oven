import { useAtom } from "jotai";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Clock, Users, Star, ArrowLeft, Eye } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  type EnhancedRecipe,
  recipeSearchTermAtom,
  recipeSelectedCategoryAtom,
  currentViewAtom,
  selectedRecipeAtom,
  viewingRecipeAtom,
  currentPhaseAtom,
  targetTempAtom,
  timeRemainingAtom,
  cookingModeAtom,
} from "../store/atoms";

const sampleRecipes: EnhancedRecipe[] = [
  {
    id: "1",
    name: "Perfect Roast Chicken",
    category: "poultry",
    servings: 4,
    difficulty: "Easy",
    rating: 4.8,
    image: "roast chicken",
    description: "Juicy chicken with golden crispy skin",
    ingredients: [
      "1 whole chicken (3-4 lbs)",
      "2 tbsp olive oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "1 tsp garlic powder",
      "1 tsp paprika",
      "Fresh rosemary sprigs",
    ],
    phases: [
      {
        id: "p1",
        name: "Preheat",
        description: "Preheat oven to target temperature",
        temperature: 200,
        duration: 15,
        mode: "preheat",
        stopCondition: "temperature",
        icon: "🔥",
      },
      {
        id: "p2",
        name: "Roast",
        description: "Roast chicken until golden and cooked through",
        temperature: 200,
        duration: 60,
        mode: "conventional",
        stopCondition: "time",
        icon: "🍗",
      },
    ],
    totalTime: 75,
    isFavorite: true,
    tips: [
      "Let chicken rest for 10 minutes before carving",
      "Use a meat thermometer to ensure internal temp reaches 165°F",
    ],
  },
  {
    id: "2",
    name: "Chocolate Chip Cookies",
    category: "desserts",
    servings: 24,
    difficulty: "Easy",
    rating: 4.9,
    image: "chocolate chip cookies",
    description: "Soft and chewy homemade cookies",
    ingredients: [
      "2¼ cups all-purpose flour",
      "1 tsp baking soda",
      "1 tsp salt",
      "1 cup butter, softened",
      "¾ cup granulated sugar",
      "¾ cup brown sugar",
      "2 large eggs",
      "2 tsp vanilla extract",
      "2 cups chocolate chips",
    ],
    phases: [
      {
        id: "p1",
        name: "Preheat",
        description: "Preheat oven for baking",
        temperature: 175,
        duration: 10,
        mode: "preheat",
        stopCondition: "temperature",
        icon: "🔥",
      },
      {
        id: "p2",
        name: "Bake",
        description: "Bake cookies until golden brown",
        temperature: 175,
        duration: 12,
        mode: "conventional",
        stopCondition: "time",
        icon: "🍪",
      },
    ],
    totalTime: 22,
    isFavorite: false,
    tips: [
      "Chill dough for 30 minutes for thicker cookies",
      "Don't overbake - they'll continue cooking on the hot pan",
    ],
  },
  {
    id: "3",
    name: "Beef Wellington",
    category: "meat",
    servings: 6,
    difficulty: "Hard",
    rating: 4.6,
    image: "beef wellington",
    description: "Premium beef in flaky pastry",
    ingredients: [
      "2 lbs beef tenderloin",
      "1 lb puff pastry",
      "8 oz mushrooms, finely chopped",
      "4 oz pâté",
      "8 thin slices prosciutto",
      "2 egg yolks",
      "Salt and pepper",
      "Fresh thyme",
    ],
    phases: [
      {
        id: "p1",
        name: "Preheat",
        description: "Preheat oven to high temperature",
        temperature: 220,
        duration: 15,
        mode: "preheat",
        stopCondition: "temperature",
        icon: "🔥",
      },
      {
        id: "p2",
        name: "Sear",
        description: "High heat searing for crust",
        temperature: 220,
        duration: 15,
        mode: "conventional",
        stopCondition: "time",
        icon: "🥩",
      },
      {
        id: "p3",
        name: "Bake",
        description: "Lower temperature to finish cooking",
        temperature: 180,
        duration: 25,
        mode: "conventional",
        stopCondition: "time",
        icon: "🥖",
      },
    ],
    totalTime: 55,
    isFavorite: true,
    tips: [
      "Let beef rest at room temperature for 30 minutes before cooking",
      "Use a meat thermometer for perfect doneness",
    ],
  },
  {
    id: "4",
    name: "Artisan Pizza",
    category: "pizza",
    servings: 2,
    difficulty: "Medium",
    rating: 4.7,
    image: "margherita pizza",
    description: "Wood-fired style pizza at home",
    ingredients: [
      "1 pizza dough ball",
      "1/2 cup pizza sauce",
      "8 oz fresh mozzarella",
      "Fresh basil leaves",
      "2 tbsp olive oil",
      "Sea salt",
      "Black pepper",
    ],
    phases: [
      {
        id: "p1",
        name: "Preheat",
        description: "Preheat to maximum temperature",
        temperature: 250,
        duration: 20,
        mode: "preheat",
        stopCondition: "temperature",
        icon: "🔥",
      },
      {
        id: "p2",
        name: "Bake",
        description: "High temperature baking for crispy crust",
        temperature: 250,
        duration: 12,
        mode: "convection",
        stopCondition: "time",
        icon: "🍕",
      },
    ],
    totalTime: 32,
    isFavorite: false,
    tips: [
      "Use a pizza stone for best results",
      "Stretch dough by hand for authentic texture",
    ],
  },
];

const categories = [
  { id: "all", name: "All", emoji: "🍽️" },
  { id: "poultry", name: "Poultry", emoji: "🐔" },
  { id: "meat", name: "Meat", emoji: "🥩" },
  { id: "fish", name: "Fish", emoji: "🐟" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
  { id: "bread", name: "Bread", emoji: "🍞" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
];

export function RecipeSelector() {
  // Navigation atoms
  const [, setCurrentView] = useAtom(currentViewAtom);
  const [, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [, setViewingRecipe] = useAtom(viewingRecipeAtom);
  const [, setCurrentPhase] = useAtom(currentPhaseAtom);
  const [, setTargetTemp] = useAtom(targetTempAtom);
  const [, setTimeRemaining] = useAtom(timeRemainingAtom);
  const [, setCookingMode] = useAtom(cookingModeAtom);
  const [searchTerm, setSearchTerm] = useAtom(recipeSearchTermAtom);
  const [selectedCategory, setSelectedCategory] = useAtom(
    recipeSelectedCategoryAtom
  );

  // Handler functions
  const handleSelectRecipe = (recipe: EnhancedRecipe) => {
    setSelectedRecipe(recipe);
    setCurrentPhase(0);

    // Set initial phase parameters
    if (recipe.phases.length > 0) {
      setTargetTemp(recipe.phases[0].temperature);
    }

    // Convert total cook time to timer format
    const hours = Math.floor(recipe.totalTime / 60);
    const minutes = recipe.totalTime % 60;
    setTimeRemaining(`${hours}:${minutes.toString().padStart(2, "0")}:00`);

    // Auto-select timer mode for recipes
    setCookingMode("timer");

    setCurrentView("dashboard");
  };

  const handleViewRecipe = (recipe: EnhancedRecipe) => {
    setViewingRecipe(recipe);
    setCurrentView("recipe-details");
  };

  const filteredRecipes = sampleRecipes.filter((recipe) => {
    const matchesSearch = recipe.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteRecipes = sampleRecipes.filter((recipe) => recipe.isFavorite);

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
          onClick={() => setCurrentView("dashboard")}
          className="w-10 h-10 rounded-full border-2 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-medium text-gray-800">Choose Recipe</h1>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-10 rounded-xl border-2 text-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex-shrink-0 h-8 px-3 rounded-xl border-2 gap-1 text-xs"
          >
            <span className="text-sm">{category.emoji}</span>
            {category.name}
          </Button>
        ))}
      </div>

      {/* Recipes List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Favorites Section */}
        {selectedCategory === "all" && favoriteRecipes.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              Favorites
            </h2>
            <div className="space-y-3">
              {favoriteRecipes.slice(0, 2).map((recipe) => (
                <CompactRecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={handleSelectRecipe}
                  onView={handleViewRecipe}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Recipes */}
        <div>
          <h2 className="text-sm font-medium text-gray-700 mb-3">
            {selectedCategory === "all"
              ? "All Recipes"
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <div className="space-y-3">
            {filteredRecipes.map((recipe) => (
              <CompactRecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={handleSelectRecipe}
                onView={handleViewRecipe}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-lg font-medium text-gray-600 mb-1">
              No recipes found
            </h3>
            <p className="text-sm text-gray-500">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CompactRecipeCard({
  recipe,
  onSelect,
  onView,
  getDifficultyColor,
}: {
  recipe: EnhancedRecipe;
  onSelect: (recipe: EnhancedRecipe) => void;
  onView: (recipe: EnhancedRecipe) => void;
  getDifficultyColor: (difficulty: string) => string;
}) {
  return (
    <Card className="overflow-hidden border-2 rounded-2xl">
      <div className="flex gap-3 p-3">
        {/* Recipe Image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
          <ImageWithFallback
            src={`https://images.unsplash.com/600x400/?${recipe.image}`}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
          {recipe.isFavorite && (
            <div className="absolute top-1 right-1 w-4 h-4 bg-white/90 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            </div>
          )}
        </div>

        {/* Recipe Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-medium text-gray-800 text-sm leading-tight truncate pr-2">
              {recipe.name}
            </h3>
            <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded-full flex-shrink-0">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-medium text-yellow-700">
                {recipe.rating}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
            {recipe.description}
          </p>

          <div className="flex items-center gap-3 text-gray-600 mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{recipe.totalTime}min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="text-xs">{recipe.servings}</span>
            </div>
            <Badge
              className={`${getDifficultyColor(
                recipe.difficulty
              )} border text-xs px-1.5 py-0.5`}
            >
              {recipe.difficulty}
            </Badge>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onView(recipe);
              }}
              className="flex-1 h-7 rounded-lg border text-xs px-2"
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(recipe);
              }}
              className="flex-1 h-7 rounded-lg text-xs px-2"
            >
              Start
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
