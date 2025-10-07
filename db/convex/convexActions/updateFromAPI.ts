import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";

// Internal function to update device status from API (called by cron job)
export default internalAction({
  handler: async (ctx) => {
    // Get API URL from Convex environment variables
    const API_BASE_URL = process.env.API_URL || "http://192.168.0.71:8081";

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

      // Mock GPIO status data for heater only
      const gpioData = {
        heater: {
          status: Math.random() > 0.7 ? "on" : "off",
          power: Math.floor(Math.random() * 1000), // 0-1000W
        },
      };

      // Update oven temperature sensor status
      await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
        deviceType: "temperature_sensor",
        deviceId: "main_temp_sensor",
        status: tempData ? "online" : "error",
        lastReading: tempData?.temperature || undefined,
        metadata: tempData
          ? {
              timestamp: tempData.timestamp,
            }
          : null,
      });

      // Update heater status
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

      console.log("Hardware data updated successfully");
    } catch (error) {
      console.error("Failed to fetch hardware data:", error);

      // Mark temperature and heater devices as error if API is unreachable
      const deviceTypes = ["temperature_sensor", "heating_element"];
      const deviceIds = ["main_temp_sensor", "main_heater"];

      for (let i = 0; i < deviceTypes.length; i++) {
        await ctx.runMutation(api.mutations.updateDeviceStatus.default, {
          deviceType: deviceTypes[i] as
            | "temperature_sensor"
            | "heating_element",
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
