import { createFileRoute } from "@tanstack/react-router";
import { SmartAlerts } from "@/components/SmartAlerts";
import { PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/alerts")({
  head: () => ({
    meta: [
      { title: "Smart Alerts — Uptrend" },
      { name: "description", content: "Create price, percent-change and news alerts on Uptrend so the market notifies you instead of the other way around." },
      { property: "og:title", content: "Smart Alerts — Uptrend" },
      { property: "og:description", content: "Price, percent-change and news alerts that watch the tape for you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Smart Alerts" subtitle="Let the market tell you when something matters." accent="from-teal-400 via-emerald-400 to-lime-400" />
      <SmartAlerts />
    </div>
  ),
});
