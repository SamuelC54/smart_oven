import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Cleanup old device status entries (keep last 24 hours)
export default mutation({
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
