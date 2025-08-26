import { useQuery } from "@tanstack/react-query";
import { temperatureApi } from "../clients/smart-oven-api";

export const useSensorDebug = () => {
  return useQuery({
    queryKey: ["sensor-debug"],
    queryFn: async () => {
      const response = await temperatureApi.debugSensorSensorDebugGet();
      return response.data;
    },
  });
};
