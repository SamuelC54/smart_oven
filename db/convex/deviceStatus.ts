import { query, mutation, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { TemperatureApi, Configuration } from "../../api-sdk/generated/index";

// Query to get current device status
export const getCurrentStatus = query({
  args: {
    deviceType: v.optional(
      v.union(
        v.literal("temperature_sensor"),
        v.literal("humidity_sensor"),
        v.literal("fan"),
        v.literal("heating_element"),
        v.literal("probe")
      )
    ),
  },
  handler: async (ctx, args) => {
    let devices;

    if (args.deviceType) {
      devices = await ctx.db
        .query("deviceStatus")
        .withIndex("by_device_type", (q) =>
          q.eq("deviceType", args.deviceType!)
        )
        .order("desc")
        .take(100);
    } else {
      devices = await ctx.db
        .query("deviceStatus")
        .withIndex("by_last_update")
        .order("desc")
        .take(100);
    }

    // Group by deviceId and get the latest status for each
    const latestStatus = new Map();

    for (const device of devices) {
      if (
        !latestStatus.has(device.deviceId) ||
        device.lastUpdate > latestStatus.get(device.deviceId).lastUpdate
      ) {
        latestStatus.set(device.deviceId, device);
      }
    }

    return Array.from(latestStatus.values());
  },
});

// Query to get system health overview
export const getSystemHealth = query({
  handler: async (ctx) => {
    const allDevices = await ctx.db
      .query("deviceStatus")
      .order("desc")
      .take(100);

    const deviceStatus = new Map();

    for (const device of allDevices) {
      if (
        !deviceStatus.has(device.deviceId) ||
        device.lastUpdate > deviceStatus.get(device.deviceId).lastUpdate
      ) {
        deviceStatus.set(device.deviceId, device);
      }
    }

    const devices = Array.from(deviceStatus.values());

    const onlineCount = devices.filter((d) => d.status === "online").length;
    const offlineCount = devices.filter((d) => d.status === "offline").length;
    const errorCount = devices.filter((d) => d.status === "error").length;

    const overallHealth =
      errorCount > 0 ? "error" : offlineCount > 0 ? "warning" : "healthy";

    return {
      overallHealth,
      totalDevices: devices.length,
      online: onlineCount,
      offline: offlineCount,
      errors: errorCount,
      devices: devices,
      lastUpdate: Math.max(...devices.map((d) => d.lastUpdate)),
    };
  },
});

// Mutation to manually update device status
export const updateDeviceStatus = mutation({
  args: {
    deviceType: v.union(
      v.literal("temperature_sensor"),
      v.literal("humidity_sensor"),
      v.literal("fan"),
      v.literal("heating_element"),
      v.literal("probe")
    ),
    deviceId: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("offline"),
      v.literal("error")
    ),
    lastReading: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deviceStatus", {
      deviceType: args.deviceType,
      deviceId: args.deviceId,
      status: args.status,
      lastReading: args.lastReading,
      lastUpdate: Date.now(),
      metadata: args.metadata,
    });
  },
});

// Cleanup old device status entries (keep last 24 hours)
export const cleanup = mutation({
  args: { olderThanHours: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const cutoffTime =
      Date.now() - (args.olderThanHours || 24) * 60 * 60 * 1000;

    const oldEntries = await ctx.db
      .query("deviceStatus")
      .withIndex("by_last_update", (q) => q.lt("lastUpdate", cutoffTime))
      .collect();

    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }

    return { deleted: oldEntries.length };
  },
});

// Internal function to update device status from API (called by cron job)
export const updateFromAPI = internalAction({
  handler: async (ctx) => {
    // Get API URL from Convex environment variables
    const API_BASE_URL = process.env.API_URL || "http://localhost:8081";

    console.log("process.env.API_URL", process.env.API_URL);

    try {
      // Initialize API SDK
      const config = new Configuration({
        basePath: API_BASE_URL,
      });
      const temperatureApi = new TemperatureApi(config);

      // Fetch temperature data using API SDK
      let tempData = null;
      try {
        const tempResponse = await temperatureApi.getTempTemperatureGet();
        tempData = tempResponse.data;
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
      await ctx.runMutation(api.deviceStatus.updateDeviceStatus, {
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
      await ctx.runMutation(api.deviceStatus.updateDeviceStatus, {
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
      await ctx.runMutation(api.deviceStatus.updateDeviceStatus, {
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
      await ctx.runMutation(api.deviceStatus.updateDeviceStatus, {
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
      await ctx.runMutation(api.deviceStatus.updateDeviceStatus, {
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
        await ctx.runMutation(api.deviceStatus.updateDeviceStatus, {
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
