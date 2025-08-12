import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import { Switch } from "./ui/switch";
import { 
  Play, 
  Pause, 
  RotateCcw,
  Plus,
  Minus,
  Thermometer,
  Clock,
  Droplets,
  ChefHat,
  Settings,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Edit
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface EnhancedThermomixDashboardProps {
  currentTemp: number;
  targetTemp: number;
  timeRemaining: string;
  humidity: number;
  ingredientTemp: number;
  isRunning: boolean;
  currentPhase: number;
  totalPhases: number;
  phaseName: string;
  onToggleRunning: () => void;
  onOpenSettings: () => void;
  onOpenRecipes: () => void;
  onTempAdjust: (delta: number) => void;
  onTimeAdjust: (minutes: number) => void;
  onSetupMode: () => void;
  tempHistory: Array<{time: string, temp: number, humidity: number}>;
}

type InterfaceMode = 'standby' | 'setup' | 'running';

export function EnhancedThermomixDashboard({
  currentTemp,
  targetTemp,
  timeRemaining,
  humidity,
  ingredientTemp,
  isRunning,
  currentPhase,
  totalPhases,
  phaseName,
  onToggleRunning,
  onOpenSettings,
  onOpenRecipes,
  onTempAdjust,
  onTimeAdjust,
  onSetupMode,
  tempHistory
}: EnhancedThermomixDashboardProps) {
  const [interfaceMode, setInterfaceMode] = useState<InterfaceMode>('standby');
  const [setupTemp, setSetupTemp] = useState(targetTemp);
  const [setupTime, setSetupTime] = useState({ hours: 1, minutes: 30 });
  const [stopCondition, setStopCondition] = useState<'time' | 'temperature'>('time');

  const tempProgress = Math.min((currentTemp / targetTemp) * 100, 100);
  const isHeating = currentTemp < targetTemp && isRunning;
  const phaseProgress = totalPhases > 0 ? ((currentPhase + 1) / totalPhases) * 100 : 0;

  useEffect(() => {
    if (isRunning) {
      setInterfaceMode('running');
    } else {
      setInterfaceMode('standby');
    }
  }, [isRunning]);

  const handleStartSetup = () => {
    setInterfaceMode('setup');
    setSetupTemp(targetTemp);
    const [hours, minutes] = timeRemaining.split(':').slice(0, 2).map(Number);
    setSetupTime({ hours, minutes });
  };

  const handleConfirmSetup = () => {
    onTempAdjust(setupTemp - targetTemp);
    const totalMinutes = setupTime.hours * 60 + setupTime.minutes;
    const currentTotalMinutes = timeRemaining.split(':').slice(0, 2).reduce((acc, curr, i) => 
      acc + parseInt(curr) * (i === 0 ? 60 : 1), 0);
    onTimeAdjust(totalMinutes - currentTotalMinutes);
    setInterfaceMode('standby');
  };

  if (interfaceMode === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Setup Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-medium text-gray-800">Setup Cooking</h1>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setInterfaceMode('standby')}
                className="rounded-2xl border-2 px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSetup}
                className="rounded-2xl px-6"
              >
                Confirm
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Temperature Setup */}
            <Card className="p-8 rounded-3xl border-2 shadow-lg">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Thermometer className="w-6 h-6 text-orange-500" />
                  <h2 className="text-2xl font-medium text-gray-800">Temperature</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-orange-600 mb-2">{setupTemp}°</div>
                    <div className="text-lg text-gray-600">Target Temperature</div>
                  </div>
                  
                  <div className="space-y-4">
                    <Slider
                      value={[setupTemp]}
                      onValueChange={([value]) => setSetupTemp(value)}
                      min={50}
                      max={300}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>50°C</span>
                      <span>300°C</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSetupTemp(Math.max(50, setupTemp - 25))}
                      className="w-12 h-12 rounded-full"
                    >
                      <Minus className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSetupTemp(Math.min(300, setupTemp + 25))}
                      className="w-12 h-12 rounded-full"
                    >
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Timer Setup */}
            <Card className="p-8 rounded-3xl border-2 shadow-lg">
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-medium text-gray-800">Timer</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                      {setupTime.hours}:{setupTime.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-lg text-gray-600">Cooking Time</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hours</label>
                      <Slider
                        value={[setupTime.hours]}
                        onValueChange={([value]) => setSetupTime(prev => ({ ...prev, hours: value }))}
                        min={0}
                        max={12}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minutes</label>
                      <Slider
                        value={[setupTime.minutes]}
                        onValueChange={([value]) => setSetupTime(prev => ({ ...prev, minutes: value }))}
                        min={0}
                        max={59}
                        step={5}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stop Condition */}
          <Card className="p-6 rounded-3xl border-2 shadow-lg mt-8">
            <h3 className="text-xl font-medium text-gray-800 mb-4">Stop Condition</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="stop-time"
                  name="stopCondition"
                  checked={stopCondition === 'time'}
                  onChange={() => setStopCondition('time')}
                  className="w-4 h-4"
                />
                <label htmlFor="stop-time" className="text-gray-700">Stop when timer ends</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="stop-temp"
                  name="stopCondition"
                  checked={stopCondition === 'temperature'}
                  onChange={() => setStopCondition('temperature')}
                  className="w-4 h-4"
                />
                <label htmlFor="stop-temp" className="text-gray-700">Stop when temperature reached</label>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
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

        {/* Phase Progress (when running) */}
        {isRunning && totalPhases > 0 && (
          <Card className="p-6 rounded-3xl border-2 shadow-lg mb-8 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-medium text-blue-800">
                  Phase {currentPhase + 1} of {totalPhases}: {phaseName}
                </h3>
              </div>
              <div className="text-lg font-medium text-blue-600">{phaseProgress.toFixed(0)}%</div>
            </div>
            <Progress value={phaseProgress} className="h-3 bg-blue-100" />
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Side - Graph */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-4 text-center">Temperature & Humidity</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={tempHistory}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Area 
                      type="monotone" 
                      dataKey="temp" 
                      stroke="#f97316" 
                      fill="#fed7aa" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#06b6d4" 
                      fill="#a7f3d0" 
                      strokeWidth={2}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-300 rounded-full"></div>
                  <span>Temperature</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-cyan-300 rounded-full"></div>
                  <span>Humidity</span>
                </div>
              </div>
            </Card>

            {/* Status Indicators */}
            <div className="space-y-4">
              <Card className="p-4 rounded-2xl border-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span className="text-sm font-medium text-gray-700">Humidity</span>
                  </div>
                  <span className="text-lg font-bold text-cyan-600">{humidity}%</span>
                </div>
                <Progress value={humidity} className="h-1 mt-2 bg-cyan-100" />
              </Card>

              <Card className="p-4 rounded-2xl border-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-sm font-medium text-gray-700">Food Temp</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{ingredientTemp}°</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Internal probe</div>
              </Card>
            </div>
          </div>

          {/* Central Circular Display */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Main Circle */}
              <div className="w-80 h-80 rounded-full bg-white border-8 border-gray-200 shadow-2xl flex items-center justify-center relative overflow-hidden">
                
                {/* Progress Ring */}
                <div className="absolute inset-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
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
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - tempProgress / 100)}`}
                      className={`transition-all duration-1000 ${
                        isHeating ? 'text-orange-500' : 'text-green-500'
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
                  <div className="text-sm text-gray-400 mb-2">Target: {targetTemp}°</div>
                  <div className={`text-sm px-3 py-1 rounded-full ${
                    isHeating 
                      ? 'bg-orange-100 text-orange-600' 
                      : currentTemp >= targetTemp 
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isHeating ? 'Heating...' : currentTemp >= targetTemp ? 'Ready' : 'Standby'}
                  </div>
                </div>

                {/* Pulsing effect when running */}
                {isRunning && (
                  <div className="absolute inset-0 rounded-full bg-orange-400/10 animate-pulse" />
                )}
              </div>

              {/* Central Start/Stop/Setup Button */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                {!isRunning && (
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleStartSetup}
                    className="w-16 h-16 rounded-full shadow-2xl border-4 border-white"
                  >
                    <Edit className="w-6 h-6" />
                  </Button>
                )}
                
                <Button
                  size="lg"
                  onClick={onToggleRunning}
                  className={`w-20 h-20 rounded-full shadow-2xl border-4 border-white text-white transition-all duration-300 ${
                    isRunning 
                      ? 'bg-red-500 hover:bg-red-600 scale-110' 
                      : 'bg-green-500 hover:bg-green-600'
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
          </div>

          {/* Right Side - Timer & Controls */}
          <div className="space-y-6">
            <Card className="p-6 rounded-3xl border-2 shadow-lg">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-medium text-gray-700">Timer</span>
                </div>
                
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {timeRemaining}
                </div>
                
                <div className="text-sm text-gray-500">Remaining</div>
                
                {!isRunning && (
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTimeAdjust(-15)}
                      className="w-10 h-10 rounded-full border-2"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onTimeAdjust(15)}
                      className="w-10 h-10 rounded-full border-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Temperature Controls */}
            {!isRunning && (
              <Card className="p-6 rounded-3xl border-2 shadow-lg">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    <span className="text-lg font-medium text-gray-700">Temperature</span>
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
                      <div className="text-3xl font-bold text-gray-800">{targetTemp}°</div>
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
            )}

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