import { useAtom } from "jotai";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Slider } from "./ui/slider";
import {
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  ChefHat,
  Settings,
  BookOpen,
  CheckCircle,
  Timer,
  Wind,
  X,
  Droplets,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  isRunningAtom,
  currentTempAtom,
  targetTempAtom,
  timeRemainingAtom,
  humidityAtom,
  targetHumidityAtom,
  fanSpeedAtom,
  ingredientTempAtom,
  currentPhaseAtom,
  totalPhasesAtom,
  phaseNameAtom,
  cookingModeAtom,
  probeTargetTempAtom,
  customTimerAtom,
  tempHistoryAtom,
} from "../store/atoms";
import { useNavigate } from "@tanstack/react-router";

export function OvenDashboard() {
  const navigate = useNavigate();

  // Oven state atoms
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [currentTemp] = useAtom(currentTempAtom);
  const [targetTemp, setTargetTemp] = useAtom(targetTempAtom);
  const [timeRemaining, setTimeRemaining] = useAtom(timeRemainingAtom);
  const [humidity] = useAtom(humidityAtom);
  const [targetHumidity, setTargetHumidity] = useAtom(targetHumidityAtom);
  const [fanSpeed, setFanSpeed] = useAtom(fanSpeedAtom);
  const [ingredientTemp] = useAtom(ingredientTempAtom);
  const [currentPhase] = useAtom(currentPhaseAtom);
  const [totalPhases] = useAtom(totalPhasesAtom);
  const [phaseName] = useAtom(phaseNameAtom);
  const [cookingMode, setCookingMode] = useAtom(cookingModeAtom);
  const [probeTargetTemp, setProbeTargetTemp] = useAtom(probeTargetTempAtom);
  const [customTimer, setCustomTimer] = useAtom(customTimerAtom);
  const [tempHistory] = useAtom(tempHistoryAtom);

  // Handler functions
  const handleToggleRunning = () => {
    if (!isRunning && cookingMode === null) {
      // This will be handled by the parent component's toast
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleTempAdjust = (delta: number) => {
    const newTemp = Math.max(50, Math.min(300, targetTemp + delta));
    setTargetTemp(newTemp);
  };

  const handleAddTimer = () => {
    setCookingMode("timer");
    const totalMinutes = customTimer.hours * 60 + customTimer.minutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setTimeRemaining(`${hours}:${minutes.toString().padStart(2, "0")}:00`);
  };

  const handleAddProbe = () => {
    setCookingMode("probe");
  };

  const handleRemoveTimer = () => {
    setCookingMode(null);
    setTimeRemaining("0:00:00");
  };

  const handleRemoveProbe = () => {
    setCookingMode(null);
  };

  const handleHumidityChange = (value: number) => {
    setTargetHumidity(value);
  };

  const handleFanSpeedChange = (value: number) => {
    setFanSpeed(value);
  };

  const handleProbeTargetChange = (value: number) => {
    setProbeTargetTemp(value);
  };

  const handleCustomTimerChange = (hours: number, minutes: number) => {
    setCustomTimer({ hours, minutes });
  };

  // Computed values
  const tempProgress = Math.min((currentTemp / targetTemp) * 100, 100);
  const isHeating = currentTemp < targetTemp && isRunning;
  const phaseProgress =
    totalPhases > 0 ? ((currentPhase + 1) / totalPhases) * 100 : 0;
  // const humidityProgress = Math.min((humidity / targetHumidity) * 100, 100);
  const probeProgress =
    cookingMode === "probe"
      ? Math.min((ingredientTemp / probeTargetTemp) * 100, 100)
      : 0;

  return (
    <div className="h-full flex flex-col p-3 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-medium text-gray-800">Smart Oven</h1>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/recipes" })}
            className="rounded-xl px-3 border-2"
          >
            <BookOpen className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/settings" })}
            className="rounded-xl px-3 border-2"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Phase Progress (when running) */}
      {isRunning && totalPhases > 0 && (
        <Card className="p-3 rounded-2xl border-2 shadow-md mb-3 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">
                Phase {currentPhase + 1}/{totalPhases}: {phaseName}
              </h3>
            </div>
            <div className="text-sm font-medium text-blue-600">
              {phaseProgress.toFixed(0)}%
            </div>
          </div>
          <Progress value={phaseProgress} className="h-2 bg-blue-100" />
        </Card>
      )}

      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* Comprehensive Graph (when running) */}
        {isRunning && (
          <Card className="p-3 rounded-2xl border-2 shadow-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2 text-center">
              Cooking Progress
            </h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tempHistory}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Line
                    type="monotone"
                    dataKey="ovenTemp"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    name="Oven Temp"
                  />
                  <Line
                    type="monotone"
                    dataKey="foodTemp"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name="Food Temp"
                  />
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={false}
                    name="Humidity"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Oven</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Food</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Humidity</span>
              </div>
            </div>
          </Card>
        )}

        {/* Central Circular Display */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Main Circle */}
            <div className="w-40 h-40 rounded-full bg-white border-4 border-gray-200 shadow-xl flex items-center justify-center relative overflow-hidden">
              {/* Progress Ring */}
              <div className="absolute inset-2">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 *
                      Math.PI *
                      45 *
                      (1 -
                        (cookingMode === "probe"
                          ? probeProgress
                          : tempProgress) /
                          100)
                    }`}
                    className={`transition-all duration-1000 ${
                      cookingMode === "probe"
                        ? ingredientTemp >= probeTargetTemp
                          ? "text-green-500"
                          : "text-orange-500"
                        : isHeating
                          ? "text-orange-500"
                          : "text-green-500"
                    }`}
                  />
                </svg>
              </div>

              {/* Center Content */}
              <div className="text-center z-10">
                {cookingMode === "probe" ? (
                  <>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {ingredientTemp}°
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Food Temp</div>
                    <div className="text-xs text-gray-400 mb-1">
                      Target: {probeTargetTemp}°
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {currentTemp}°
                    </div>
                    <div className="text-xs text-gray-500 mb-1">Current</div>
                    <div className="text-xs text-gray-400 mb-1">
                      Target: {targetTemp}°
                    </div>
                  </>
                )}
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    cookingMode === "probe"
                      ? ingredientTemp >= probeTargetTemp
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                      : isHeating
                        ? "bg-orange-100 text-orange-600"
                        : currentTemp >= targetTemp
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {cookingMode === "probe"
                    ? ingredientTemp >= probeTargetTemp
                      ? "Ready"
                      : "Cooking"
                    : isHeating
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
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
              <Button
                size="lg"
                onClick={handleToggleRunning}
                className={`w-14 h-14 rounded-full shadow-lg border-2 border-white text-white transition-all duration-300 ${
                  isRunning
                    ? "bg-red-500 hover:bg-red-600 scale-105"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Cooking Mode Selection */}
        <Card className="p-3 rounded-2xl border-2 shadow-md">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            Cooking Mode
          </h3>

          {cookingMode === null && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAddTimer}
                className="h-10 rounded-xl gap-2 text-xs"
                variant="outline"
              >
                <Timer className="w-3 h-3" />
                Timer
              </Button>
              <Button
                onClick={handleAddProbe}
                className="h-10 rounded-xl gap-2 text-xs"
                variant="outline"
              >
                <Thermometer className="w-3 h-3" />
                Probe
              </Button>
            </div>
          )}

          {cookingMode === "timer" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Timer Mode</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveTimer}
                  className="w-6 h-6 rounded-full p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-xl font-bold text-center text-blue-600">
                {timeRemaining}
              </div>
              {!isRunning && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Hours
                    </label>
                    <Slider
                      value={[customTimer.hours]}
                      onValueChange={([value]) =>
                        handleCustomTimerChange(value, customTimer.minutes)
                      }
                      min={0}
                      max={12}
                      step={1}
                      className="h-1"
                    />
                    <div className="text-center text-xs text-gray-500">
                      {customTimer.hours}h
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">
                      Minutes
                    </label>
                    <Slider
                      value={[customTimer.minutes]}
                      onValueChange={([value]) =>
                        handleCustomTimerChange(customTimer.hours, value)
                      }
                      min={0}
                      max={59}
                      step={5}
                      className="h-1"
                    />
                    <div className="text-center text-xs text-gray-500">
                      {customTimer.minutes}m
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {cookingMode === "probe" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Probe Mode</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveProbe}
                  className="w-6 h-6 rounded-full p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="text-xl font-bold text-center text-green-600">
                {ingredientTemp}°C / {probeTargetTemp}°C
              </div>
              {!isRunning && (
                <div>
                  <label className="text-xs font-medium text-gray-700">
                    Target Temperature
                  </label>
                  <Slider
                    value={[probeTargetTemp]}
                    onValueChange={([value]) => handleProbeTargetChange(value)}
                    min={40}
                    max={100}
                    step={1}
                    className="h-1"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>40°C</span>
                    <span>{probeTargetTemp}°C</span>
                    <span>100°C</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Temperature Controls */}
        <Card className="p-3 rounded-2xl border-2 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Oven Temperature
              </span>
            </div>
            <span className="text-lg font-bold text-gray-800">
              {targetTemp}°C
            </span>
          </div>

          {!isRunning && (
            <div>
              <Slider
                value={[targetTemp]}
                onValueChange={([value]) =>
                  handleTempAdjust(value - targetTemp)
                }
                min={50}
                max={300}
                step={5}
                className="h-1 mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>50°C</span>
                <span>300°C</span>
              </div>
            </div>
          )}
        </Card>

        {/* Humidity Controls */}
        <Card className="p-3 rounded-2xl border-2 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-medium text-gray-700">
                Humidity
              </span>
            </div>
            <div className="text-sm">
              <span className="font-bold text-cyan-600">{humidity}%</span>
              <span className="text-gray-500"> / {targetHumidity}%</span>
            </div>
          </div>

          {!isRunning && (
            <div>
              <Slider
                value={[targetHumidity]}
                onValueChange={([value]) => handleHumidityChange(value)}
                min={0}
                max={100}
                step={5}
                className="h-1 mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          )}
        </Card>

        {/* Fan Speed Controls */}
        <Card className="p-3 rounded-2xl border-2 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Fan Speed
              </span>
            </div>
            <span className="text-lg font-bold text-blue-600">{fanSpeed}%</span>
          </div>

          {!isRunning && (
            <div>
              <Slider
                value={[fanSpeed]}
                onValueChange={([value]) => handleFanSpeedChange(value)}
                min={0}
                max={100}
                step={10}
                className="h-1 mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Off</span>
                <span>Max</span>
              </div>
            </div>
          )}
        </Card>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-2 py-3"
          onClick={() => window.location.reload()}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>
    </div>
  );
}
