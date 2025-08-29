import { query } from "../_generated/server";

// Get the active cooking session
export default query({
  handler: async (ctx) => {
    const sessions = await ctx.db
      .query("cookingSessions")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(1);

    return sessions[0] || null;
  },
});
