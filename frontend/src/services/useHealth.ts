import { useQuery } from "@tanstack/react-query";
import { healthApi } from "../clients/smart-oven-api";

export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await healthApi.healthHealthGet();
      return response.data;
    },
  });
};
