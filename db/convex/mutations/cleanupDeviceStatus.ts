import { mutation } from "../_generated/server";
import { v } from "convex/values";

// Cleanup old device status entries
export default mutation({
  args: { maxAgeMinutes: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const maxAge = args.maxAgeMinutes ?? 10;
    const cutoffTime = Date.now() - maxAge * 60 * 1000;

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
