import React, { useState, useEffect } from "react";
import { EnhancedThermomixDashboard } from "./components/EnhancedThermomixDashboard";
import { ThermomixRecipeSelector } from "./components/ThermomixRecipeSelector";
import { RecipeDetails } from "./components/RecipeDetails";
import { ThermomixSettings } from "./components/ThermomixSettings";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

type View = "dashboard" | "recipes" | "recipe-details" | "settings";
type CookingMode = "timer" | "probe" | null;

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

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [isRunning, setIsRunning] = useState(false);
  const [currentTemp, setCurrentTemp] = useState(25);
  const [targetTemp, setTargetTemp] = useState(180);
  const [timeRemaining, setTimeRemaining] = useState("1:30:00");
  const [humidity, setHumidity] = useState(45);
  const [targetHumidity, setTargetHumidity] = useState(50);
  const [fanSpeed, setFanSpeed] = useState(75);
  const [ingredientTemp, setIngredientTemp] = useState(22);
  const [selectedRecipe, setSelectedRecipe] = useState<EnhancedRecipe | null>(
    null
  );
  const [viewingRecipe, setViewingRecipe] = useState<EnhancedRecipe | null>(
    null
  );
  const [currentPhase, setCurrentPhase] = useState(0);
  const [tempHistory, setTempHistory] = useState<
    Array<{
      time: string;
      ovenTemp: number;
      humidity: number;
      foodTemp: number;
    }>
  >([]);
  const [cookingStartTime, setCookingStartTime] = useState<Date | null>(null);

  // New cooking mode states
  const [cookingMode, setCookingMode] = useState<CookingMode>(null);
  const [probeTargetTemp, setProbeTargetTemp] = useState(75);
  const [customTimer, setCustomTimer] = useState({ hours: 1, minutes: 30 });

  // Initialize temperature history
  useEffect(() => {
    const initialHistory = [];
    for (let i = 19; i >= 0; i--) {
      initialHistory.push({
        time: `${i}m ago`,
        ovenTemp: 25 + Math.random() * 5,
        humidity: 40 + Math.random() * 10,
        foodTemp: 20 + Math.random() * 3,
      });
    }
    setTempHistory(initialHistory);
  }, []);

  // Update temperature history when cooking
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setTempHistory((prev) => {
          const newHistory = [...prev.slice(1)];
          const now = new Date();
          const timeLabel = cookingStartTime
            ? `${Math.floor(
                (now.getTime() - cookingStartTime.getTime()) / 60000
              )}m`
            : "now";

          newHistory.push({
            time: timeLabel,
            ovenTemp: currentTemp,
            humidity: humidity,
            foodTemp: ingredientTemp,
          });
          return newHistory;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRunning, currentTemp, humidity, ingredientTemp, cookingStartTime]);

  // Simulate oven heating when running
  useEffect(() => {
    if (isRunning && currentTemp < targetTemp) {
      const interval = setInterval(() => {
        setCurrentTemp((prev) => {
          const increase = Math.random() * 3 + 1; // Random increase between 1-4 degrees
          const newTemp = Math.min(prev + increase, targetTemp);
          return Math.round(newTemp);
        });
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRunning, currentTemp, targetTemp]);

  // Simulate humidity control
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setHumidity((prev) => {
          const diff = targetHumidity - prev;
          const change =
            Math.sign(diff) * Math.min(Math.abs(diff), Math.random() * 2 + 0.5);
          return Math.round(Math.max(0, Math.min(100, prev + change)));
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRunning, targetHumidity]);

  // Simulate ingredient temperature increase
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setIngredientTemp((prev) => {
          const increase = Math.random() * 2 + 0.5;
          return Math.round(Math.min(prev + increase, currentTemp - 10));
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRunning, currentTemp]);

  // Check probe completion
  useEffect(() => {
    if (
      isRunning &&
      cookingMode === "probe" &&
      ingredientTemp >= probeTargetTemp
    ) {
      setIsRunning(false);
      setCookingStartTime(null);
      toast.success(`🎯 Probe target reached! Food is at ${ingredientTemp}°C`);
    }
  }, [isRunning, cookingMode, ingredientTemp, probeTargetTemp]);

  // Phase management for recipe cooking
  useEffect(() => {
    if (isRunning && selectedRecipe) {
      const currentRecipePhase = selectedRecipe.phases[currentPhase];
      if (currentRecipePhase) {
        // Check if we should move to next phase
        const [hours, minutes, seconds] = timeRemaining.split(":").map(Number);
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        // Calculate expected time for this phase
        const expectedPhaseTime = currentRecipePhase.duration * 60;
        const totalRecipeTime = selectedRecipe.totalTime * 60;
        const remainingPhases = selectedRecipe.phases.slice(currentPhase + 1);
        const remainingPhaseTime =
          remainingPhases.reduce((acc, phase) => acc + phase.duration, 0) * 60;

        if (
          totalSeconds <= remainingPhaseTime &&
          currentPhase < selectedRecipe.phases.length - 1
        ) {
          // Move to next phase
          setCurrentPhase((prev) => prev + 1);
          const nextPhase = selectedRecipe.phases[currentPhase + 1];
          if (nextPhase) {
            setTargetTemp(nextPhase.temperature);
            toast.info(
              `🔄 Moving to ${nextPhase.name}: ${nextPhase.description}`
            );
          }
        }
      }
    }
  }, [isRunning, selectedRecipe, currentPhase, timeRemaining]);

  // Simulate timer countdown
  useEffect(() => {
    if (isRunning && cookingMode === "timer") {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const [hours, minutes, seconds] = prev.split(":").map(Number);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds - 1;

          if (totalSeconds <= 0) {
            setIsRunning(false);
            setCurrentPhase(0);
            setCookingStartTime(null);
            toast.success("🎉 Timer complete! Your dish is ready.");
            return "0:00:00";
          }

          const h = Math.floor(totalSeconds / 3600);
          const m = Math.floor((totalSeconds % 3600) / 60);
          const s = totalSeconds % 60;

          return `${h}:${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, cookingMode]);

  const handleToggleRunning = () => {
    if (!isRunning && cookingMode === null) {
      toast.error("⚠️ Please select Timer or Probe mode first");
      return;
    }

    setIsRunning(!isRunning);
    if (!isRunning) {
      setCookingStartTime(new Date());
      const modeText = cookingMode === "timer" ? "Timer" : "Probe";
      toast.success(`🔥 Oven started in ${modeText} mode!`);
    } else {
      setCookingStartTime(null);
      toast.info("⏸️ Oven paused.");
    }
  };

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
    toast.success(`📋 Recipe "${recipe.name}" loaded successfully!`);
  };

  const handleViewRecipe = (recipe: EnhancedRecipe) => {
    setViewingRecipe(recipe);
    setCurrentView("recipe-details");
  };

  const handleStartRecipeFromDetails = (recipe: EnhancedRecipe) => {
    handleSelectRecipe(recipe);
  };

  const handleSaveSettings = (settings: any) => {
    setCurrentView("dashboard");
    toast.success("⚙️ Settings saved successfully!");
  };

  const handleTempAdjust = (delta: number) => {
    const newTemp = Math.max(50, Math.min(300, targetTemp + delta));
    setTargetTemp(newTemp);
    toast.info(`🌡️ Target temperature set to ${newTemp}°C`);
  };

  const handleTimeAdjust = (minutes: number) => {
    const [hours, mins, seconds] = timeRemaining.split(":").map(Number);
    let totalMinutes = hours * 60 + mins + minutes;

    // Prevent negative time
    if (totalMinutes < 0) totalMinutes = 0;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    setTimeRemaining(
      `${newHours}:${newMinutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );

    if (minutes > 0) {
      toast.info(`⏱️ Added ${minutes} minutes to timer`);
    } else {
      toast.info(`⏱️ Removed ${Math.abs(minutes)} minutes from timer`);
    }
  };

  const handleAddTimer = () => {
    setCookingMode("timer");
    const totalMinutes = customTimer.hours * 60 + customTimer.minutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    setTimeRemaining(`${hours}:${minutes.toString().padStart(2, "0")}:00`);
    toast.success("⏱️ Timer mode activated");
  };

  const handleAddProbe = () => {
    setCookingMode("probe");
    toast.success("🌡️ Probe mode activated");
  };

  const handleRemoveTimer = () => {
    setCookingMode(null);
    setTimeRemaining("0:00:00");
    toast.info("⏱️ Timer mode removed");
  };

  const handleRemoveProbe = () => {
    setCookingMode(null);
    toast.info("🌡️ Probe mode removed");
  };

  const handleHumidityChange = (value: number) => {
    setTargetHumidity(value);
    toast.info(`💧 Target humidity set to ${value}%`);
  };

  const handleFanSpeedChange = (value: number) => {
    setFanSpeed(value);
    toast.info(`🌪️ Fan speed set to ${value}%`);
  };

  const handleProbeTargetChange = (value: number) => {
    setProbeTargetTemp(value);
    toast.info(`🎯 Probe target set to ${value}°C`);
  };

  const handleCustomTimerChange = (hours: number, minutes: number) => {
    setCustomTimer({ hours, minutes });
  };

  // Main container with fixed dimensions for 800x480 vertical touch screen
  const containerClass =
    "w-[480px] h-[800px] mx-auto bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative";

  if (currentView === "recipes") {
    return (
      <div className={containerClass}>
        <Toaster position="top-center" />
        <ThermomixRecipeSelector
          onSelectRecipe={handleSelectRecipe}
          onViewRecipe={handleViewRecipe}
          onBack={() => setCurrentView("dashboard")}
        />
      </div>
    );
  }

  if (currentView === "recipe-details" && viewingRecipe) {
    return (
      <div className={containerClass}>
        <Toaster position="top-center" />
        <RecipeDetails
          recipe={viewingRecipe}
          onBack={() => setCurrentView("recipes")}
          onStartRecipe={handleStartRecipeFromDetails}
        />
      </div>
    );
  }

  if (currentView === "settings") {
    return (
      <div className={containerClass}>
        <Toaster position="top-center" />
        <ThermomixSettings
          onBack={() => setCurrentView("dashboard")}
          onSave={handleSaveSettings}
        />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Toaster position="top-center" />
      <EnhancedThermomixDashboard
        currentTemp={currentTemp}
        targetTemp={targetTemp}
        timeRemaining={timeRemaining}
        humidity={humidity}
        targetHumidity={targetHumidity}
        fanSpeed={fanSpeed}
        ingredientTemp={ingredientTemp}
        isRunning={isRunning}
        currentPhase={currentPhase}
        totalPhases={selectedRecipe?.phases.length || 0}
        phaseName={selectedRecipe?.phases[currentPhase]?.name || ""}
        cookingMode={cookingMode}
        probeTargetTemp={probeTargetTemp}
        customTimer={customTimer}
        onToggleRunning={handleToggleRunning}
        onOpenSettings={() => setCurrentView("settings")}
        onOpenRecipes={() => setCurrentView("recipes")}
        onTempAdjust={handleTempAdjust}
        onTimeAdjust={handleTimeAdjust}
        onAddTimer={handleAddTimer}
        onAddProbe={handleAddProbe}
        onRemoveTimer={handleRemoveTimer}
        onRemoveProbe={handleRemoveProbe}
        onHumidityChange={handleHumidityChange}
        onFanSpeedChange={handleFanSpeedChange}
        onProbeTargetChange={handleProbeTargetChange}
        onCustomTimerChange={handleCustomTimerChange}
        tempHistory={tempHistory}
      />
    </div>
  );
}
