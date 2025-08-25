import { createFileRoute } from "@tanstack/react-router";
import { OvenDashboard } from "../components/OvenDashboard";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  return <OvenDashboard />;
}
