import { useQuery } from "@tanstack/react-query";
import { apiCall } from "./api";

export interface DebugInfoResponse {
  [key: string]: string | number | boolean | object;
}

// API function
export const getDebugInfo = async (): Promise<DebugInfoResponse> => {
  return apiCall<DebugInfoResponse>("/debug");
};

// TanStack Query hook
export const useDebugInfo = () => {
  return useQuery({
    queryKey: ["debug"],
    queryFn: getDebugInfo,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};
