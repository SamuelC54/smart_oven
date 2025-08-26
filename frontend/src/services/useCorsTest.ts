import { useQuery } from "@tanstack/react-query";
import { healthApi } from "../clients/smart-oven-api";

export const useCorsTest = () => {
  return useQuery({
    queryKey: ["cors-test"],
    queryFn: async () => {
      const response = await healthApi.corsTestCorsTestGet();
      return response.data;
    },
    enabled: false, // Only run when explicitly called
  });
};
