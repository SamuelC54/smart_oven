import { useQuery } from "@tanstack/react-query";
import { temperatureApi } from "../clients/smart-oven-api";

export const useTemperature = () => {
  return useQuery({
    queryKey: ["temperature"],
    queryFn: async () => {
      const response = await temperatureApi.getTempTemperatureGet();
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};
