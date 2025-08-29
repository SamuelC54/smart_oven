import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cron job to fetch hardware data every 5 seconds
crons.interval(
  "fetch hardware data",
  { seconds: 10 },
  internal.convexActions.updateFromAPI.default
);

// Cron job to cleanup device status every 30 seconds
crons.interval(
  "cleanup device status",
  { seconds: 30 },
  internal.convexActions.cleanupDeviceStatus.default
);

export default crons;
