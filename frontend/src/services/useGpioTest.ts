import { useQuery } from "@tanstack/react-query";
import { gpioApi } from "../clients/smart-oven-api";

export const useGpioTest = () => {
  return useQuery({
    queryKey: ["gpio-test"],
    queryFn: async () => {
      const response = await gpioApi.testGpioAccessGpioTestGet();
      return response.data;
    },
    enabled: false, // Only run when explicitly called
  });
};
