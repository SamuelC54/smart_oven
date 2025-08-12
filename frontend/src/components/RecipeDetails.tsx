import  { useState } from 'react';
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
  Zap
} from "lucide-react";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface RecipePhase {
  id: string;
  name: string;
  description: string;
  temperature: number;
  duration: number; // minutes
  mode: 'preheat' | 'conventional' | 'convection' | 'grill' | 'steam';
  stopCondition: 'time' | 'temperature';
  icon: string;
}

interface EnhancedRecipe {
  id: string;
  name: string;
  category: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  image: string;
  description: string;
  ingredients: string[];
  phases: RecipePhase[];
  totalTime: number;
  isFavorite: boolean;
  tips: string[];
}

interface RecipeDetailsProps {
  recipe: EnhancedRecipe;
  onBack: () => void;
  onStartRecipe: (recipe: EnhancedRecipe) => void;
}

export function RecipeDetails({ recipe, onBack, onStartRecipe }: RecipeDetailsProps) {
  const [selectedPhase, setSelectedPhase] = useState<number>(0);

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'preheat': return <Flame className="w-4 h-4" />;
      case 'conventional': return <Thermometer className="w-4 h-4" />;
      case 'convection': return <Wind className="w-4 h-4" />;
      case 'grill': return <Zap className="w-4 h-4" />;
      case 'steam': return <Wind className="w-4 h-4" />;
      default: return <ChefHat className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'preheat': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'conventional': return 'bg-red-100 text-red-700 border-red-200';
      case 'convection': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'grill': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'steam': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        
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
          <h1 className="text-3xl font-medium text-gray-800">Recipe Details</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recipe Overview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Card */}
            <Card className="overflow-hidden rounded-3xl border-2 shadow-lg">
              <div className="aspect-video relative">
                <ImageWithFallback
                  src={`https://images.unsplash.com/800x600/?${recipe.image}`}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
                {recipe.isFavorite && (
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-4xl font-bold mb-2">{recipe.name}</h2>
                  <p className="text-lg opacity-90">{recipe.description}</p>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{recipe.totalTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-yellow-700">{recipe.rating}</span>
                  </div>
                  <Badge className={`${getDifficultyColor(recipe.difficulty)} border font-medium`}>
                    {recipe.difficulty}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Cooking Phases */}
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <h3 className="text-2xl font-medium text-gray-800 mb-6">Cooking Phases</h3>
              
              <div className="space-y-4 mb-6">
                {recipe.phases.map((phase, index) => (
                  <div
                    key={phase.id}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPhase === index 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPhase(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full border-2 flex items-center justify-center font-bold text-gray-700">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800">{phase.name}</h4>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getModeColor(phase.mode)} border font-medium`}>
                          {getModeIcon(phase.mode)}
                          <span className="ml-1 capitalize">{phase.mode}</span>
                        </Badge>
                        <div className="text-right">
                          <div className="font-medium text-gray-800">{phase.temperature}°C</div>
                          <div className="text-sm text-gray-600">{phase.duration} min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Phase Details */}
              {recipe.phases[selectedPhase] && (
                <Card className="p-4 rounded-2xl bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{recipe.phases[selectedPhase].icon}</span>
                    <h4 className="text-lg font-medium text-blue-800">
                      Phase {selectedPhase + 1}: {recipe.phases[selectedPhase].name}
                    </h4>
                  </div>
                  <p className="text-blue-700 mb-3">{recipe.phases[selectedPhase].description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800">Temperature: {recipe.phases[selectedPhase].temperature}°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-800">Duration: {recipe.phases[selectedPhase].duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getModeIcon(recipe.phases[selectedPhase].mode)}
                      <span className="text-blue-800 capitalize">Mode: {recipe.phases[selectedPhase].mode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-800">
                        Stop when: {recipe.phases[selectedPhase].stopCondition === 'time' ? 'Timer ends' : 'Temperature reached'}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Start Cooking */}
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <Button
                size="lg"
                onClick={() => onStartRecipe(recipe)}
                className="w-full h-16 rounded-2xl text-lg gap-3"
              >
                <Play className="w-6 h-6" />
                Start Cooking
              </Button>
              
              <div className="mt-4 p-3 bg-orange-50 rounded-2xl border border-orange-200">
                <p className="text-sm text-orange-700">
                  <strong>Total cooking time:</strong> {recipe.totalTime} minutes
                </p>
                <p className="text-sm text-orange-700">
                  <strong>Phases:</strong> {recipe.phases.length} steps
                </p>
              </div>
            </Card>

            {/* Ingredients */}
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <h3 className="text-xl font-medium text-gray-800 mb-4">Ingredients</h3>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Cooking Tips */}
            {recipe.tips.length > 0 && (
              <Card className="p-6 rounded-3xl border-2 shadow-lg">
                <h3 className="text-xl font-medium text-gray-800 mb-4">💡 Pro Tips</h3>
                <ul className="space-y-3">
                  {recipe.tips.map((tip, index) => (
                    <li key={index} className="p-3 bg-yellow-50 rounded-2xl border border-yellow-200">
                      <p className="text-sm text-yellow-800">{tip}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}