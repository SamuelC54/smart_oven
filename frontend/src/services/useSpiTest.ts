import { useQuery } from "@tanstack/react-query";
import { debugApi } from "../clients/smart-oven-api";

export const useSpiTest = () => {
  return useQuery({
    queryKey: ["spi-test"],
    queryFn: async () => {
      const response = await debugApi.testSpiDirectSpiTestGet();
      return response.data;
    },
    enabled: false, // Only run when explicitly called
  });
};
