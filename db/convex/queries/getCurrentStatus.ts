import { query } from "../_generated/server";
import { v } from "convex/values";

// Query to get current device status
export default query({
  args: {
    deviceType: v.optional(
      v.union(v.literal("temperature_sensor"), v.literal("heating_element"))
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
