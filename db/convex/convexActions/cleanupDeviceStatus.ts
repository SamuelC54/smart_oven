import { internalAction } from "../_generated/server";
import { api } from "../_generated/api";

export default internalAction({
  handler: async (ctx) => {
    console.log("Cleaning up device status");
    await ctx.runMutation(api.mutations.cleanupDeviceStatus.default, {
      maxAgeMinutes: 10,
    });
  },
});
