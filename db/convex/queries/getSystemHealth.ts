import { query } from "../_generated/server";

// Query to get system health overview
export default query({
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
