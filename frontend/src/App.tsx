import { useEffect } from "react";
import { useAtom } from "jotai";
import { OvenDashboard } from "./components/OvenDashboard";
import { RecipeSelector } from "./components/RecipeSelector";
import { RecipeDetails } from "./components/RecipeDetails";
import { OvenSettings } from "./components/OvenSettings";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import {
  currentViewAtom,
  isRunningAtom,
  currentTempAtom,
  targetTempAtom,
  timeRemainingAtom,
  humidityAtom,
  targetHumidityAtom,
  fanSpeedAtom,
  ingredientTempAtom,
  selectedRecipeAtom,
  viewingRecipeAtom,
  currentPhaseAtom,
  tempHistoryAtom,
  cookingStartTimeAtom,
  cookingModeAtom,
  probeTargetTempAtom,
  customTimerAtom,
  totalPhasesAtom,
  phaseNameAtom,
  type EnhancedRecipe,
} from "./store/atoms";

export default function App() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [currentTemp, setCurrentTemp] = useAtom(currentTempAtom);
  const [targetTemp, setTargetTemp] = useAtom(targetTempAtom);
  const [timeRemaining, setTimeRemaining] = useAtom(timeRemainingAtom);
  const [humidity, setHumidity] = useAtom(humidityAtom);
  const [targetHumidity, setTargetHumidity] = useAtom(targetHumidityAtom);
  const [fanSpeed, setFanSpeed] = useAtom(fanSpeedAtom);
  const [ingredientTemp, setIngredientTemp] = useAtom(ingredientTempAtom);
  const [selectedRecipe, setSelectedRecipe] = useAtom(selectedRecipeAtom);
  const [viewingRecipe, setViewingRecipe] = useAtom(viewingRecipeAtom);
  const [currentPhase, setCurrentPhase] = useAtom(currentPhaseAtom);
  const [tempHistory, setTempHistory] = useAtom(tempHistoryAtom);
  const [cookingStartTime, setCookingStartTime] = useAtom(cookingStartTimeAtom);
  const [cookingMode, setCookingMode] = useAtom(cookingModeAtom);
  const [probeTargetTemp, setProbeTargetTemp] = useAtom(probeTargetTempAtom);
  const [customTimer, setCustomTimer] = useAtom(customTimerAtom);

  // Derived values
  const totalPhases = useAtom(totalPhasesAtom)[0];
  const phaseName = useAtom(phaseNameAtom)[0];

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
        // const expectedPhaseTime = currentRecipePhase.duration * 60;
        // const totalRecipeTime = selectedRecipe.totalTime * 60;
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

  const handleSaveSettings = () => {
    setCurrentView("dashboard");
    toast.success("⚙️ Settings saved successfully!");
  };

  const handleTempAdjust = (delta: number) => {
    const newTemp = Math.max(50, Math.min(300, targetTemp + delta));
    setTargetTemp(newTemp);
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

  // Main container with fixed dimensions for 800x480 vertical touch screen
  const containerClass =
    "w-[480px] h-[800px] mx-auto bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative";

  if (currentView === "recipes") {
    return (
      <div className={containerClass}>
        <Toaster position="top-center" />
        <RecipeSelector
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
        <OvenSettings
          onBack={() => setCurrentView("dashboard")}
          onSave={handleSaveSettings}
        />
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Toaster position="top-center" />
      <OvenDashboard
        currentTemp={currentTemp}
        targetTemp={targetTemp}
        timeRemaining={timeRemaining}
        humidity={humidity}
        targetHumidity={targetHumidity}
        fanSpeed={fanSpeed}
        ingredientTemp={ingredientTemp}
        isRunning={isRunning}
        currentPhase={currentPhase}
        totalPhases={totalPhases}
        phaseName={phaseName}
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
