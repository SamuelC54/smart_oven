import { useQuery, useMutation } from "@tanstack/react-query";
import {
  healthApi,
  temperatureGetApi,
  gpioStatusApi,
  gpioSetApi,
  sensorDebugApi,
  debugMax31865Api,
  spiTestApi,
  gpioTestApi,
  corsTestApi,
  debugInfoApi,
  logsApi,
  rootApi,
} from "../../clients/smart-oven-api";

// Health check
export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.healthHealthGet();
      return response.data;
    },
  });
};

// Get temperature
export const useTemperature = () => {
  return useQuery({
    queryKey: ["temperature"],
    queryFn: async () => {
      const response = await temperatureGetApi.temperatureGetGet();
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

// Get GPIO status
export const useGpioStatus = () => {
  return useQuery({
    queryKey: ["gpio-status"],
    queryFn: async () => {
      const response = await gpioStatusApi.gpioStatusGet();
      return response.data;
    },
  });
};

// Set GPIO
export const useSetGpio = () => {
  return useMutation({
    mutationFn: async (data: { pin: number; state: boolean }) => {
      const response = await gpioSetApi.gpioSetPost(data);
      return response.data;
    },
  });
};

// Sensor debug
export const useSensorDebug = () => {
  return useQuery({
    queryKey: ["sensor-debug"],
    queryFn: async () => {
      const response = await sensorDebugApi.sensorDebugGet();
      return response.data;
    },
  });
};

// Debug MAX31865
export const useDebugMax31865 = () => {
  return useQuery({
    queryKey: ["debug-max31865"],
    queryFn: async () => {
      const response = await debugMax31865Api.debugMax31865Get();
      return response.data;
    },
  });
};

// SPI test
export const useSpiTest = () => {
  return useQuery({
    queryKey: ["spi-test"],
    queryFn: async () => {
      const response = await spiTestApi.spiTestGet();
      return response.data;
    },
  });
};

// GPIO test
export const useGpioTest = () => {
  return useQuery({
    queryKey: ["gpio-test"],
    queryFn: async () => {
      const response = await gpioTestApi.gpioTestGet();
      return response.data;
    },
  });
};

// CORS test
export const useCorsTest = () => {
  return useQuery({
    queryKey: ["cors-test"],
    queryFn: async () => {
      const response = await corsTestApi.corsTestGet();
      return response.data;
    },
  });
};

// Debug info
export const useDebugInfo = () => {
  return useQuery({
    queryKey: ["debug-info"],
    queryFn: async () => {
      const response = await debugInfoApi.debugInfoGet();
      return response.data;
    },
  });
};

// Get logs
export const useLogs = () => {
  return useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const response = await logsApi.logsGet();
      return response.data;
    },
  });
};

// Root endpoint
export const useRoot = () => {
  return useQuery({
    queryKey: ["root"],
    queryFn: async () => {
      const response = await rootApi.rootGet();
      return response.data;
    },
  });
};
