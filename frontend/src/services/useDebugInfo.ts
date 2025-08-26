import { useQuery } from "@tanstack/react-query";
import { debugApi } from "../clients/smart-oven-api";

export const useDebugInfo = () => {
  return useQuery({
    queryKey: ["debug-info"],
    queryFn: async () => {
      const response = await debugApi.getLogsEndpointLogsGet();
      return response.data;
    },
  });
};
