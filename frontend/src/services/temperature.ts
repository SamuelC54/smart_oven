import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "./api";

export interface TemperatureResponse {
  current: number;
  target: number;
}

export interface SetTemperatureRequest {
  temperature: number;
}

// API functions
export const getTemperature = async (): Promise<TemperatureResponse> => {
  return apiCall<TemperatureResponse>("/temperature");
};

export const setTemperature = async (temperature: number): Promise<void> => {
  return apiCall("/temperature", {
    method: "POST",
    body: JSON.stringify({ temperature }),
  });
};

// TanStack Query hooks
export const useTemperature = () => {
  return useQuery({
    queryKey: ["temperature"],
    queryFn: getTemperature,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useSetTemperature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setTemperature,
    onSuccess: () => {
      // Invalidate and refetch temperature data
      queryClient.invalidateQueries({ queryKey: ["temperature"] });
    },
  });
};
