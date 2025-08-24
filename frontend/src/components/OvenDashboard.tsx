import React from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Thermometer, Clock, Droplets, ChefHat, Power, Settings, Pause, Play } from "lucide-react";

interface OvenDashboardProps {
  currentTemp: number;
  targetTemp: number;
  timeRemaining: string;
  humidity: number;
  ingredientTemp: number;
  isRunning: boolean;
  onToggleRunning: () => void;
  onOpenSettings: () => void;
}

export function OvenDashboard({
  currentTemp,
  targetTemp,
  timeRemaining,
  humidity,
  ingredientTemp,
  isRunning,
  onToggleRunning,
  onOpenSettings
}: OvenDashboardProps) {
  const tempProgress = (currentTemp / targetTemp) * 100;
  
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChefHat className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-medium">Smart Oven</h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant={isRunning ? "destructive" : "default"}
            size="lg"
            onClick={onToggleRunning}
            className="px-6"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start
              </>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={onOpenSettings}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Temperature Display */}
      <Card className="p-8 text-center bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <div className="space-y-4">
          <Thermometer className="w-12 h-12 mx-auto text-orange-600" />
          <div className="space-y-2">
            <div className="text-6xl font-bold text-gray-900">{currentTemp}°</div>
            <div className="text-xl text-gray-600">Target: {targetTemp}°C</div>
            <Progress value={tempProgress} className="w-full h-3 bg-orange-100" />
            <div className="text-sm text-gray-500">
              {tempProgress.toFixed(0)}% to target temperature
            </div>
          </div>
        </div>
      </Card>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timer Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium">Timer</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">{timeRemaining}</div>
          <div className="text-sm text-gray-500">Remaining</div>
        </Card>

        {/* Humidity Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Droplets className="w-6 h-6 text-cyan-600" />
            <h3 className="text-lg font-medium">Humidity</h3>
          </div>
          <div className="text-3xl font-bold text-cyan-600 mb-2">{humidity}%</div>
          <Progress value={humidity} className="w-full h-2 bg-cyan-100" />
        </Card>

        {/* Ingredient Temperature Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Thermometer className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-medium">Ingredient Temp</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{ingredientTemp}°</div>
          <div className="text-sm text-gray-500">Internal temperature</div>
        </Card>
      </div>

      {/* Quick Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Quick Controls</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Power className="w-5 h-5" />
            Preheat
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Thermometer className="w-5 h-5" />
            +25°C
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Clock className="w-5 h-5" />
            +15 min
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <Droplets className="w-5 h-5" />
            Steam
          </Button>
        </div>
      </Card>
    </div>
  );
}