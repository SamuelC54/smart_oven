import React, { useState } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Clock, Users, Star, ChefHat } from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Recipe {
  id: string;
  name: string;
  category: string;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  temperature: number;
  image: string;
  description: string;
  isFavorite: boolean;
}

interface RecipeSelectorProps {
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
}

const sampleRecipes: Recipe[] = [
  {
    id: '1',
    name: 'Classic Roast Chicken',
    category: 'poultry',
    cookTime: 75,
    servings: 4,
    difficulty: 'Easy',
    rating: 4.8,
    temperature: 200,
    image: 'roast chicken',
    description: 'Perfectly seasoned roast chicken with crispy skin',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Chocolate Chip Cookies',
    category: 'desserts',
    cookTime: 12,
    servings: 24,
    difficulty: 'Easy',
    rating: 4.9,
    temperature: 175,
    image: 'chocolate chip cookies',
    description: 'Soft and chewy cookies with premium chocolate chips',
    isFavorite: false
  },
  {
    id: '3',
    name: 'Beef Wellington',
    category: 'meat',
    cookTime: 45,
    servings: 6,
    difficulty: 'Hard',
    rating: 4.6,
    temperature: 220,
    image: 'beef wellington',
    description: 'Tender beef fillet wrapped in puff pastry',
    isFavorite: true
  },
  {
    id: '4',
    name: 'Margherita Pizza',
    category: 'pizza',
    cookTime: 15,
    servings: 2,
    difficulty: 'Medium',
    rating: 4.7,
    temperature: 250,
    image: 'margherita pizza',
    description: 'Classic Italian pizza with fresh basil and mozzarella',
    isFavorite: false
  },
  {
    id: '5',
    name: 'Salmon Fillet',
    category: 'fish',
    cookTime: 20,
    servings: 2,
    difficulty: 'Easy',
    rating: 4.5,
    temperature: 180,
    image: 'salmon fillet',
    description: 'Perfectly cooked salmon with herbs and lemon',
    isFavorite: false
  },
  {
    id: '6',
    name: 'Sourdough Bread',
    category: 'bread',
    cookTime: 35,
    servings: 8,
    difficulty: 'Medium',
    rating: 4.4,
    temperature: 230,
    image: 'sourdough bread',
    description: 'Artisan sourdough with crispy crust',
    isFavorite: true
  }
];

export function RecipeSelector({ onSelectRecipe, onBack }: RecipeSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Recipes', icon: ChefHat },
    { id: 'poultry', name: 'Poultry', icon: ChefHat },
    { id: 'meat', name: 'Meat', icon: ChefHat },
    { id: 'fish', name: 'Fish', icon: ChefHat },
    { id: 'desserts', name: 'Desserts', icon: ChefHat },
    { id: 'bread', name: 'Bread', icon: ChefHat },
    { id: 'pizza', name: 'Pizza', icon: ChefHat },
  ];

  const filteredRecipes = sampleRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const favoriteRecipes = sampleRecipes.filter(recipe => recipe.isFavorite);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const RecipeCard = ({ recipe }: { recipe: Recipe }) => (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onSelectRecipe(recipe)}
    >
      <div className="aspect-video relative">
        <ImageWithFallback
          src={`https://images.unsplash.com/400x300/?${recipe.image}`}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {recipe.isFavorite && (
          <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-500 fill-yellow-500" />
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-lg">{recipe.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm text-gray-600">{recipe.rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">{recipe.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recipe.cookTime} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {recipe.servings} servings
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty}
          </Badge>
          <span className="text-sm font-medium text-orange-600">
            {recipe.temperature}°C
          </span>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6 max-h-screen overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-3xl font-medium">Choose Recipe</h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        {/* Category Tabs */}
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-6">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All Recipes */}
        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </TabsContent>

        {/* Category-specific content */}
        {categories.slice(1).map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Favorites Section */}
      {favoriteRecipes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Your Favorites
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}