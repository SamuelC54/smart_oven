import { useQuery, useMutation } from "@tanstack/react-query";

// Base API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://192.168.0.71:8081";

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

// Camera endpoints
export const useCameraInfo = () => {
  return useQuery({
    queryKey: ["camera", "info"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/camera/info`);
      if (!response.ok) {
        throw new Error("Failed to fetch camera info");
      }
      return response.json();
    },
    retry: 1,
  });
};

export const useCameraDiagnose = () => {
  return useQuery({
    queryKey: ["camera", "diagnose"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/camera/diagnose`);
      if (!response.ok) {
        throw new Error("Failed to run camera diagnostics");
      }
      return response.json();
    },
    enabled: false, // Only run when explicitly called
  });
};

export const useCameraStart = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/camera/start`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to start camera");
      }
      return response.json();
    },
  });
};

export const useCameraStop = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/camera/stop`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to stop camera");
      }
      return response.json();
    },
  });
};

// Helper function to get camera stream URL
export const getCameraStreamUrl = (quality: number = 85) => {
  return `${API_BASE_URL}/camera/stream?quality=${quality}`;
};

// Helper function to get camera snapshot URL
export const getCameraSnapshotUrl = () => {
  return `${API_BASE_URL}/camera/snapshot`;
};
