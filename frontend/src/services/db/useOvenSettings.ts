import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../db/convex/_generated/api";

// Get oven settings for a user
export const useOvenSettings = (userId?: string) => {
  return useQuery(api.queries.getOvenSettings.default, {
    userId: userId || "default",
  });
};

// Update oven settings
export const useUpdateOvenSettings = () => {
  return useMutation(api.mutations.updateOvenSettings.default);
};
