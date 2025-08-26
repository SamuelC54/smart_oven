import {
  Configuration,
  HealthApi,
  TemperatureApi,
  GpioApi,
  DebugApi,
} from "smart-oven-api-sdk";

// Configure the SDK with the API base URL
const config = new Configuration({
  basePath: import.meta.env.VITE_API_URL || "http://localhost:8081",
});

// Create and export API instances
export const healthApi = new HealthApi(config);
export const temperatureApi = new TemperatureApi(config);
export const gpioApi = new GpioApi(config);
export const debugApi = new DebugApi(config);
