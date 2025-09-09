import { useQuery, useMutation } from "@tanstack/react-query";

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

// Health check
export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.json();
    },
  });
};

// Get temperature
export const useTemperature = () => {
  return useQuery({
    queryKey: ["temperature"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/temperature`);
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

// Get logs
export const useLogs = () => {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/logs`);
      return response.json();
    },
  });
};

// Root endpoint
export const useRoot = () => {
  return useQuery({
    queryKey: ["root"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/`);
      return response.json();
    },
  });
};
