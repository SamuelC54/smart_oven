import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCall } from "./api";

export interface GpioStatusResponse {
  [key: string]: boolean;
}

export interface SetGpioRequest {
  pin: string;
  value: boolean;
}

// API functions
export const getGpioStatus = async (): Promise<GpioStatusResponse> => {
  return apiCall<GpioStatusResponse>("/gpio");
};

export const setGpio = async (pin: string, value: boolean): Promise<void> => {
  return apiCall("/gpio", {
    method: "POST",
    body: JSON.stringify({ pin, value }),
  });
};

// TanStack Query hooks
export const useGpioStatus = () => {
  return useQuery({
    queryKey: ["gpio"],
    queryFn: getGpioStatus,
    refetchInterval: 2000, // Refetch every 2 seconds for real-time updates
  });
};

export const useSetGpio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pin, value }: SetGpioRequest) => setGpio(pin, value),
    onSuccess: () => {
      // Invalidate and refetch GPIO status
      queryClient.invalidateQueries({ queryKey: ["gpio"] });
    },
  });
};
