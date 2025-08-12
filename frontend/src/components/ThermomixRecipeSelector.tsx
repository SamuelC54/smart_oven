import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, Clock, Users, Star, ArrowLeft, Eye } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface RecipePhase {
  id: string;
  name: string;
  description: string;
  temperature: number;
  duration: number; // minutes
  mode: "preheat" | "conventional" | "convection" | "grill" | "steam";
  stopCondition: "time" | "temperature";
  icon: string;
}

interface EnhancedRecipe {
  id: string;
  name: string;
  category: string;
  servings: number;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: number;
  image: string;
  description: string;
  ingredients: string[];
  phases: RecipePhase[];
  totalTime: number;
  isFavorite: boolean;
  tips: string[];
}

interface ThermomixRecipeSelectorProps {
  onSelectRecipe: (recipe: EnhancedRecipe) => void;
  onViewRecipe: (recipe: EnhancedRecipe) => void;
  onBack: () => void;
}

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

export function ThermomixRecipeSelector({
  onSelectRecipe,
  onViewRecipe,
  onBack,
}: ThermomixRecipeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="lg"
            onClick={onBack}
            className="w-12 h-12 rounded-full border-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-medium text-gray-800">Choose Recipe</h1>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-2 text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="flex-shrink-0 h-12 px-6 rounded-2xl border-2 gap-2"
            >
              <span className="text-lg">{category.emoji}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Favorites Section */}
        {selectedCategory === "all" && favoriteRecipes.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-medium text-gray-700 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Your Favorites
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteRecipes.slice(0, 3).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onSelect={onSelectRecipe}
                  onView={onViewRecipe}
                  getDifficultyColor={getDifficultyColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Recipes */}
        <div>
          <h2 className="text-xl font-medium text-gray-700 mb-6">
            {selectedCategory === "all"
              ? "All Recipes"
              : categories.find((c) => c.id === selectedCategory)?.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onSelect={onSelectRecipe}
                onView={onViewRecipe}
                getDifficultyColor={getDifficultyColor}
              />
            ))}
          </div>
        </div>

        {filteredRecipes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeCard({
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-3xl border-2">
      <div className="aspect-video relative overflow-hidden">
        <ImageWithFallback
          src={`https://images.unsplash.com/600x400/?${recipe.image}`}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {recipe.isFavorite && (
          <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          </div>
        )}

        {/* Phase indicator */}
        <div className="absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-gray-700">
            {recipe.phases.length} phases
          </span>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-medium text-gray-800 leading-tight">
            {recipe.name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-yellow-700">
              {recipe.rating}
            </span>
          </div>
        </div>

        <p className="text-gray-600 leading-relaxed">{recipe.description}</p>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{recipe.totalTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              {recipe.servings} servings
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Badge
            className={`${getDifficultyColor(
              recipe.difficulty
            )} border font-medium`}
          >
            {recipe.difficulty}
          </Badge>
          <div className="text-right">
            <div className="text-lg font-bold text-orange-600">
              {recipe.phases[0]?.temperature}°C
            </div>
            <div className="text-xs text-gray-500">Start temp</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onView(recipe);
            }}
            className="flex-1 rounded-2xl border-2 gap-2"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(recipe);
            }}
            className="flex-1 rounded-2xl gap-2"
          >
            <Clock className="w-4 h-4" />
            Start Cooking
          </Button>
        </div>
      </div>
    </Card>
  );
}
