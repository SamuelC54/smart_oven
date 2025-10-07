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

// Cron job to control heater based on active cooking sessions every 5 seconds
crons.interval(
  "control heater from sessions",
  { seconds: 5 },
  internal.convexActions.controlHeaterFromSessions.default
);

export default crons;
