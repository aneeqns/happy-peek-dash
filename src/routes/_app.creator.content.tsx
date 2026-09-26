import { createFileRoute } from "@tanstack/react-router";
import { EmptyState, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/creator/content")({
  head: () => ({
    meta: [
      { title: "Content Management — Uptrend Admin" },
      { name: "description", content: "News, banners, featured lists and insights published to customers." },
      { property: "og:title", content: "Content Management — Uptrend Admin" },
      { property: "og:description", content: "News, banners, featured lists and insights published to customers." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Content" subtitle="Only real, published items appear here." />
      <EmptyState title="Nothing published yet" hint="No content have been created on Uptrend so far." />
    </div>
  ),
});
