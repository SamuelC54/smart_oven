import { createFileRoute } from "@tanstack/react-router";
import { OvenSettings } from "../components/OvenSettings";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return <OvenSettings />;
}
