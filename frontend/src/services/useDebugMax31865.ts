import { useQuery } from "@tanstack/react-query";
import { debugApi } from "../clients/smart-oven-api";

export const useDebugMax31865 = () => {
  return useQuery({
    queryKey: ["debug-max31865"],
    queryFn: async () => {
      const response = await debugApi.debugMax31865DebugMax31865Get();
      return response.data;
    },
  });
};
