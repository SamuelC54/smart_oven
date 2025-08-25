import { useQuery } from "@tanstack/react-query";
import { apiCall } from "./api";

export interface HealthResponse {
  status: string;
}

// API function
export const getHealth = async (): Promise<HealthResponse> => {
  return apiCall<HealthResponse>("/health");
};

// TanStack Query hook
export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
