import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";

// Internal function to update device status from API (called by cron job)
export default internalAction({
  handler: async (ctx) => {
    // Get API URL from Convex environment variables
    const API_BASE_URL = process.env.API_URL || "http://localhost:8081";

    try {
      // Fetch temperature data using direct fetch
      let tempData = null;
      try {
        const tempResponse = await fetch(`${API_BASE_URL}/temperature`);
        tempData = tempResponse.ok ? await tempResponse.json() : null;
      } catch (error) {
        console.error("Failed to fetch temperature data:", error);
        tempData = null;
      }

      // Mock humidity data (since we're not using API SDK for this)
      const humidityData = {
        humidity: 45 + Math.random() * 10, // Mock humidity between 45-55%
        timestamp: Date.now(),
      };

      // Mock GPIO status data
      const gpioData = {
        fan: {
          status: Math.random() > 0.5 ? "on" : "off",
          speed: Math.floor(Math.random() * 100), // 0-100%
        },
        heater: {
          status: Math.random() > 0.7 ? "on" : "off",
          power: Math.floor(Math.random() * 1000), // 0-1000W
        },
      };

      // Update temperature sensor status
      await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
        deviceType: "temperature_sensor",
        deviceId: "main_temp_sensor",
        status: tempData ? "online" : "error",
        lastReading: tempData?.temperature || undefined,
        metadata: tempData
          ? {
              humidity: tempData.humidity,
              timestamp: tempData.timestamp,
            }
          : null,
      });

      // Update humidity sensor status
      await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
        deviceType: "humidity_sensor",
        deviceId: "main_humidity_sensor",
        status: humidityData ? "online" : "error",
        lastReading: humidityData?.humidity || undefined,
        metadata: humidityData
          ? {
              timestamp: humidityData.timestamp,
            }
          : null,
      });

      // Update fan status
      await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
        deviceType: "fan",
        deviceId: "main_fan",
        status: gpioData?.fan?.status === "on" ? "online" : "offline",
        lastReading: gpioData?.fan?.speed || 0,
        metadata: gpioData?.fan
          ? {
              speed: gpioData.fan.speed,
              status: gpioData.fan.status,
            }
          : null,
      });

      // Update heating element status
      await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
        deviceType: "heating_element",
        deviceId: "main_heater",
        status: gpioData?.heater?.status === "on" ? "online" : "offline",
        lastReading: gpioData?.heater?.power || 0,
        metadata: gpioData?.heater
          ? {
              power: gpioData.heater.power,
              status: gpioData.heater.status,
            }
          : null,
      });

      // Mock probe data (since we're not using API SDK for this)
      const probeData = {
        connected: Math.random() > 0.3, // 70% chance of being connected
        temperature: 20 + Math.random() * 80, // Mock temperature between 20-100°C
      };

      // Update probe status
      await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
        deviceType: "probe",
        deviceId: "food_probe",
        status: probeData.connected ? "online" : "offline",
        lastReading: probeData.connected ? probeData.temperature : undefined,
        metadata: {
          connected: probeData.connected,
          temperature: probeData.connected ? probeData.temperature : null,
        },
      });

      console.log("Hardware data updated successfully");
    } catch (error) {
      console.error("Failed to fetch hardware data:", error);

      // Mark all devices as error if API is unreachable
      const deviceTypes = [
        "temperature_sensor",
        "humidity_sensor",
        "fan",
        "heating_element",
        "probe",
      ];
      const deviceIds = [
        "main_temp_sensor",
        "main_humidity_sensor",
        "main_fan",
        "main_heater",
        "food_probe",
      ];

      for (let i = 0; i < deviceTypes.length; i++) {
        await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
          deviceType: deviceTypes[i] as
            | "temperature_sensor"
            | "humidity_sensor"
            | "fan"
            | "heating_element"
            | "probe",
          deviceId: deviceIds[i],
          status: "error",
          lastReading: undefined,
          metadata: {
            error: "API unreachable",
            timestamp: Date.now(),
          },
        });
      }
    }
  },
});
