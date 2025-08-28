import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/globals.css";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { QueryProvider } from "./providers/QueryProvider";
import { ConvexClientProvider } from "./clients/convex";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ConvexClientProvider>
        <RouterProvider router={router} />
      </ConvexClientProvider>
    </QueryProvider>
  </StrictMode>
);
