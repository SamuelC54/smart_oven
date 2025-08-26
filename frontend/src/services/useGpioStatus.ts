import { useQuery } from "@tanstack/react-query";
import { gpioApi } from "../clients/smart-oven-api";

export const useGpioStatus = () => {
  return useQuery({
    queryKey: ["gpio-status"],
    queryFn: async () => {
      const response = await gpioApi.getGpioStatusGpioStatusGet();
      return response.data;
    },
  });
};
