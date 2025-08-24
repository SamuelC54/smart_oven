import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Minus,
  Thermometer,
  Clock,
  ChefHat,
  Settings,
  BookOpen,
} from "lucide-react";

interface ThermomixDashboardProps {
  currentTemp: number;
  targetTemp: number;
  timeRemaining: string;
  humidity: number;
  ingredientTemp: number;
  isRunning: boolean;
  onToggleRunning: () => void;
  onOpenSettings: () => void;
  onOpenRecipes: () => void;
  onTempAdjust: (delta: number) => void;
  onTimeAdjust: (minutes: number) => void;
}

export function ThermomixDashboard({
  currentTemp,
  targetTemp,
  timeRemaining,
  humidity,
  ingredientTemp,
  isRunning,
  onToggleRunning,
  onOpenSettings,
  onOpenRecipes,
  onTempAdjust,
  onTimeAdjust,
}: ThermomixDashboardProps) {
  const tempProgress = Math.min((currentTemp / targetTemp) * 100, 100);
  const isHeating = currentTemp < targetTemp && isRunning;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with minimal branding */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-medium text-gray-800">Smart Oven</h1>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onOpenRecipes}
              className="rounded-2xl px-6 py-3 border-2"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Recipes
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onOpenSettings}
              className="rounded-2xl px-6 py-3 border-2"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side Controls */}
          <div className="space-y-6">
            {/* Temperature Control */}
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Thermometer className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-medium text-gray-700">
                    Temperature
                  </span>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onTempAdjust(-25)}
                    className="w-12 h-12 rounded-full border-2"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-800">
                      {targetTemp}°
                    </div>
                    <div className="text-sm text-gray-500">Target</div>
                  </div>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onTempAdjust(25)}
                    className="w-12 h-12 rounded-full border-2"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 flex-col gap-1"
                  onClick={() => onTempAdjust(50)}
                >
                  <div className="text-xl">🔥</div>
                  <span className="text-xs">Preheat</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 flex-col gap-1"
                  onClick={() => onTimeAdjust(15)}
                >
                  <div className="text-xl">⏱️</div>
                  <span className="text-xs">+15 min</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 flex-col gap-1"
                >
                  <div className="text-xl">💨</div>
                  <span className="text-xs">Steam</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-16 rounded-2xl border-2 flex-col gap-1"
                >
                  <div className="text-xl">🌪️</div>
                  <span className="text-xs">Fan</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Central Circular Display */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Main Circle */}
              <div className="w-80 h-80 rounded-full bg-white border-8 border-gray-200 shadow-2xl flex items-center justify-center relative overflow-hidden">
                {/* Progress Ring */}
                <div className="absolute inset-4">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 45 * (1 - tempProgress / 100)
                      }`}
                      className={`transition-all duration-1000 ${
                        isHeating ? "text-orange-500" : "text-green-500"
                      }`}
                    />
                  </svg>
                </div>

                {/* Center Content */}
                <div className="text-center z-10">
                  <div className="text-6xl font-bold text-gray-800 mb-2">
                    {currentTemp}°
                  </div>
                  <div className="text-lg text-gray-500 mb-1">Current</div>
                  <div
                    className={`text-sm px-3 py-1 rounded-full ${
                      isHeating
                        ? "bg-orange-100 text-orange-600"
                        : currentTemp >= targetTemp
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isHeating
                      ? "Heating..."
                      : currentTemp >= targetTemp
                      ? "Ready"
                      : "Standby"}
                  </div>
                </div>

                {/* Pulsing effect when running */}
                {isRunning && (
                  <div className="absolute inset-0 rounded-full bg-orange-400/10 animate-pulse" />
                )}
              </div>

              {/* Central Start/Stop Button */}
              <Button
                size="lg"
                onClick={onToggleRunning}
                className={`absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full shadow-2xl border-4 border-white text-white transition-all duration-300 ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 scale-110"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isRunning ? (
                  <Pause className="w-8 h-8" />
                ) : (
                  <Play className="w-8 h-8 ml-1" />
                )}
              </Button>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="space-y-6">
            {/* Timer */}
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-medium text-gray-700">
                    Timer
                  </span>
                </div>

                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {timeRemaining}
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTimeAdjust(-15)}
                    className="w-10 h-10 rounded-full border-2"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>

                  <span className="text-sm text-gray-500">Remaining</span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTimeAdjust(15)}
                    className="w-10 h-10 rounded-full border-2"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status Cards */}
            <div className="space-y-4">
              <Card className="p-4 rounded-2xl border-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Humidity
                    </span>
                  </div>
                  <span className="text-lg font-bold text-cyan-600">
                    {humidity}%
                  </span>
                </div>
                <Progress value={humidity} className="h-1 mt-2 bg-cyan-100" />
              </Card>

              <Card className="p-4 rounded-2xl border-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm font-medium text-gray-700">
                      Food Temp
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {ingredientTemp}°
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Internal probe</div>
              </Card>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full rounded-2xl border-2 py-4"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
