import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Cron job to fetch hardware data every 5 seconds
crons.interval(
  "fetch hardware data",
  { seconds: 5 },
  internal.convexActions.updateFromAPI.default
);

export default crons;
