import { atom } from "jotai";

// Types
export type View = "dashboard" | "recipes" | "recipe-details" | "settings";
export type CookingMode = "timer" | "probe" | null;

export interface RecipePhase {
  id: string;
  name: string;
  description: string;
  temperature: number;
  duration: number; // minutes
  mode: "preheat" | "conventional" | "convection" | "grill" | "steam";
  stopCondition: "time" | "temperature";
  icon: string;
}

export interface EnhancedRecipe {
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

export interface TempHistoryEntry {
  time: string;
  ovenTemp: number;
  humidity: number;
  foodTemp: number;
}

export interface CustomTimer {
  hours: number;
  minutes: number;
}

export interface OvenSettings {
  temperatureUnit: "celsius" | "fahrenheit";
  preheating: boolean;
  alertSound: boolean;
  alertVolume: number;
  cookingMode: string;
  fanSpeed: number;
  childLock: boolean;
  autoShutoff: boolean;
  ovenLight: boolean;
  brightness: number;
  nightMode: boolean;
  [key: string]: unknown;
}

// Oven state
export const isRunningAtom = atom(false);
export const currentTempAtom = atom(25);
export const targetTempAtom = atom(180);
export const timeRemainingAtom = atom("1:30:00");
export const humidityAtom = atom(45);
export const targetHumidityAtom = atom(50);
export const fanSpeedAtom = atom(75);
export const ingredientTempAtom = atom(22);

// Recipe state
export const selectedRecipeAtom = atom<EnhancedRecipe | null>(null);
export const viewingRecipeAtom = atom<EnhancedRecipe | null>(null);
export const currentPhaseAtom = atom(0);

// Temperature history
export const tempHistoryAtom = atom<TempHistoryEntry[]>([]);

// Cooking state
export const cookingStartTimeAtom = atom<Date | null>(null);
export const cookingModeAtom = atom<CookingMode>(null);
export const probeTargetTempAtom = atom(75);
export const customTimerAtom = atom<CustomTimer>({ hours: 1, minutes: 30 });

// Oven settings atom
export const ovenSettingsAtom = atom<OvenSettings>({
  temperatureUnit: "celsius",
  preheating: true,
  alertSound: true,
  alertVolume: 75,
  cookingMode: "conventional",
  fanSpeed: 50,
  childLock: false,
  autoShutoff: true,
  ovenLight: true,
  brightness: 80,
  nightMode: false,
});

// Recipe selector atoms
export const recipeSearchTermAtom = atom("");
export const recipeSelectedCategoryAtom = atom("all");

// Recipe details atoms
export const selectedPhaseAtom = atom<number>(0);

// Image fallback atoms
export const imageDidErrorAtom = atom(false);

// Derived atoms for computed values
export const totalPhasesAtom = atom((get) => {
  const selectedRecipe = get(selectedRecipeAtom);
  return selectedRecipe?.phases.length || 0;
});

export const phaseNameAtom = atom((get) => {
  const selectedRecipe = get(selectedRecipeAtom);
  const currentPhase = get(currentPhaseAtom);
  return selectedRecipe?.phases[currentPhase]?.name || "";
});
