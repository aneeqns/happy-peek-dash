import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/creator/settings")({
  head: () => ({
    meta: [
      { title: "Admin Settings — Uptrend Admin" },
      { name: "description", content: "Platform configuration, feature flags and service status." },
      { property: "og:title", content: "Admin Settings — Uptrend Admin" },
      { property: "og:description", content: "Platform configuration, feature flags and service status." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Admin Settings" subtitle="Only real data is shown here." />
      <EmptyState title="Live service status" hint="Real service checks are shown on the Creator dashboard under System health." />
    </div>
  ),
});
