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

// Get GPIO status
export const useGpioStatus = () => {
  return useQuery({
    queryKey: ["gpio-status"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/gpio/status`);
      return response.json();
    },
  });
};

// Set GPIO
export const useSetGpio = () => {
  return useMutation({
    mutationFn: async (data: { pin: number; state: boolean }) => {
      const response = await fetch(`${API_BASE_URL}/gpio/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });
};

// Note: Debug endpoints are available but using direct fetch for now
// until the SDK is properly configured

// Sensor debug
export const useSensorDebug = () => {
  return useQuery({
    queryKey: ["sensor-debug"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/sensor/debug`);
      return response.json();
    },
  });
};

// Debug MAX31865
export const useDebugMax31865 = () => {
  return useQuery({
    queryKey: ["debug-max31865"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/debug/max31865`);
      return response.json();
    },
  });
};

// SPI test
export const useSpiTest = () => {
  return useQuery({
    queryKey: ["spi-test"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/spi/test`);
      return response.json();
    },
  });
};

// GPIO test
export const useGpioTest = () => {
  return useQuery({
    queryKey: ["gpio-test"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/gpio/test`);
      return response.json();
    },
  });
};

// CORS test
export const useCorsTest = () => {
  return useQuery({
    queryKey: ["cors-test"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/cors/test`);
      return response.json();
    },
  });
};

// Debug info
export const useDebugInfo = () => {
  return useQuery({
    queryKey: ["debug-info"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/debug/info`);
      return response.json();
    },
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
