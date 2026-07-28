import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { contentItems } from "@/lib/admin-data";

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
      <PageHeader title="Content Management" subtitle="News, banners, featured lists and insights published to customers." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {contentItems.map((c) => (
          <GlassCard key={c.id} className="bg-gradient-to-br from-fuchsia-500/15 to-violet-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{c.title}</p>
              <Pill tone={c.status === "Published" ? "bull" : c.status === "Draft" ? "neutral" : "warn"}>{c.status}</Pill>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{c.type} · {c.author} · updated {c.updated}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
