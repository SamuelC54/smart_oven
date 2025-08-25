import { useEffect } from "react";
import { useAtom } from "jotai";
import { toast } from "sonner";
import {
  isRunningAtom,
  timeRemainingAtom,
  humidityAtom,
  targetHumidityAtom,
  ingredientTempAtom,
  currentPhaseAtom,
  cookingModeAtom,
  probeTargetTempAtom,
  selectedRecipeAtom,
  targetTempAtom,
} from "./store/atoms";

export default function App() {
  // Oven state atoms
  const [isRunning, setIsRunning] = useAtom(isRunningAtom);
  const [timeRemaining, setTimeRemaining] = useAtom(timeRemainingAtom);
  const [humidity, setHumidity] = useAtom(humidityAtom);
  const [targetHumidity] = useAtom(targetHumidityAtom);
  const [ingredientTemp, setIngredientTemp] = useAtom(ingredientTempAtom);
  const [currentPhase, setCurrentPhase] = useAtom(currentPhaseAtom);
  const [cookingMode] = useAtom(cookingModeAtom);
  const [probeTargetTemp] = useAtom(probeTargetTempAtom);
  const [selectedRecipe] = useAtom(selectedRecipeAtom);
  const [, setTargetTemp] = useAtom(targetTempAtom);

  // Update temperature history when running
  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        // Temperature history updates removed since we're using real API data
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isRunning, humidity, ingredientTemp]);

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
          return Math.round(Math.min(prev + increase, 100)); // Using fixed max temp since we now get real temp from API
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isRunning]);

  // Check probe completion
  useEffect(() => {
    if (
      isRunning &&
      cookingMode === "probe" &&
      ingredientTemp >= probeTargetTemp
    ) {
      setIsRunning(false);
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

  // This component now only handles simulation logic
  // Routing is handled by TanStack Router
  return null;
}
