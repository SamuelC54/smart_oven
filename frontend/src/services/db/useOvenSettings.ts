import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../db/convex/_generated/api";

// Get oven settings for a user
export const useOvenSettings = (userId?: string) => {
  return useQuery(api.ovenSettings.get, { userId: userId || "default" });
};

// Get temperature unit preference
export const useTemperatureUnit = (userId?: string) => {
  return useQuery(api.ovenSettings.getTemperatureUnit, {
    userId: userId || "default",
  });
};

// Get all oven settings
export const useAllOvenSettings = () => {
  return useQuery(api.ovenSettings.listAll);
};

// Update oven settings
export const useUpdateOvenSettings = () => {
  return useMutation(api.ovenSettings.update);
};

// Reset oven settings to defaults
export const useResetOvenSettings = () => {
  return useMutation(api.ovenSettings.reset);
};

// Update a specific setting
export const useUpdateSetting = () => {
  return useMutation(api.ovenSettings.updateSetting);
};

// Remove oven settings
export const useRemoveOvenSettings = () => {
  return useMutation(api.ovenSettings.remove);
};

// Convert temperature between units
export const useConvertTemperature = (
  temperature: number,
  fromUnit: "celsius" | "fahrenheit",
  toUnit: "celsius" | "fahrenheit"
) => {
  return useQuery(api.ovenSettings.convertTemperature, {
    temperature,
    fromUnit,
    toUnit,
  });
};
