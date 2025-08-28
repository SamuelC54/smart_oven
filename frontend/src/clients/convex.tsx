import { ConvexProvider, ConvexReactClient } from "convex/react";

// Create a Convex client
export const convex = new ConvexReactClient(
  process.env.VITE_CONVEX_URL || "http://localhost:8000"
);

// Convex Provider component
export const ConvexClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
};
