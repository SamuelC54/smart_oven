import { useQuery } from "@tanstack/react-query";
import { healthApi } from "../clients/smart-oven-api";

export const useRoot = () => {
  return useQuery({
    queryKey: ["root"],
    queryFn: async () => {
      const response = await healthApi.rootGet();
      return response.data;
    },
  });
};
