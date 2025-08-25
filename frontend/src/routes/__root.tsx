import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Provider } from "../store/Provider";
import { QueryProvider } from "../providers/QueryProvider";
import { Toaster } from "../components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <Provider>
        <div className="w-[480px] h-[800px] mx-auto bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
          <Toaster position="top-center" />
          <Outlet />
        </div>
      </Provider>
    </QueryProvider>
  ),
});
