import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/creator/ai")({
  head: () => ({
    meta: [
      { title: "AI Management — Uptrend Admin" },
      { name: "description", content: "Moderation queue and UpBot recommendation oversight." },
      { property: "og:title", content: "AI Management — Uptrend Admin" },
      { property: "og:description", content: "Moderation queue and UpBot recommendation oversight." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="AI Management" subtitle="Only real data is shown here." />
      <EmptyState title="No flagged conversations" hint="Nothing has been reported for review yet." />
    </div>
  ),
});
