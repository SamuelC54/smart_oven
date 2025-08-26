import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gpioApi } from "../clients/smart-oven-api";

export const useSetGpio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pin, state }: { pin: number; state: boolean }) => {
      const response = await gpioApi.setGpioEndpointGpioPost({ pin, state });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gpio-status"] });
    },
  });
};
