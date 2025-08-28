import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../db/convex/_generated/api";
import type { Id } from "../../../../db/convex/_generated/dataModel";

// Get active cooking session
export const useActiveSession = () => {
  return useQuery(api.cookingSessions.getActive);
};

// Get all cooking sessions
export const useCookingSessions = (options?: {
  status?: "active" | "paused" | "completed" | "cancelled";
  limit?: number;
}) => {
  return useQuery(api.cookingSessions.list, {
    status: options?.status,
    limit: options?.limit,
  });
};

// Get a single cooking session by ID
export const useCookingSession = (id: Id<"cookingSessions"> | null) => {
  return useQuery(api.cookingSessions.get, id ? { id } : "skip");
};

// Get cooking session statistics
export const useCookingStats = () => {
  return useQuery(api.cookingSessions.getStats);
};

// Start a new cooking session
export const useStartCookingSession = () => {
  return useMutation(api.cookingSessions.start);
};

// Update a cooking session
export const useUpdateCookingSession = () => {
  return useMutation(api.cookingSessions.update);
};

// Pause a cooking session
export const usePauseCookingSession = () => {
  return useMutation(api.cookingSessions.pause);
};

// Resume a cooking session
export const useResumeCookingSession = () => {
  return useMutation(api.cookingSessions.resume);
};

// Complete a cooking session
export const useCompleteCookingSession = () => {
  return useMutation(api.cookingSessions.complete);
};

// Cancel a cooking session
export const useCancelCookingSession = () => {
  return useMutation(api.cookingSessions.cancel);
};

// Move to next phase
export const useNextPhase = () => {
  return useMutation(api.cookingSessions.nextPhase);
};
