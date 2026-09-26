import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/creator/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Uptrend Admin" },
      { name: "description", content: "Broadcast product news and maintenance windows to segments." },
      { property: "og:title", content: "Announcements — Uptrend Admin" },
      { property: "og:description", content: "Broadcast product news and maintenance windows to segments." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle="Only real, published items appear here." />
      <EmptyState title="Nothing published yet" hint="No announcements have been created on Uptrend so far." />
    </div>
  ),
});
