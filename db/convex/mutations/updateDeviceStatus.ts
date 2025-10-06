import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Mutation to manually update device status
export default mutation({
  args: {
    deviceType: v.union(
      v.literal("temperature_sensor"),
      v.literal("heating_element")
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
