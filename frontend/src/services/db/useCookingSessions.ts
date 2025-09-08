import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../db/convex/_generated/api";

// Get active cooking session
export const useActiveSession = () => {
  return useQuery(api.queries.getActiveCookingSession.default);
};

// Start a new cooking session
export const useStartCookingSession = () => {
  return useMutation(api.mutations.startCookingSession.default);
};
