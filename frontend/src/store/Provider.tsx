import { Provider as JotaiProvider } from "jotai";
import type { ReactNode } from "react";

interface ProviderProps {
  children: ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return <JotaiProvider>{children}</JotaiProvider>;
}
