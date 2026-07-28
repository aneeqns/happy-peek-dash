import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { news } from "@/lib/market-data";

export const Route = createFileRoute("/_app/news")({
  head: () => ({
    meta: [
      { title: "Market News — Uptrend" },
      { name: "description", content: "Market-moving current affairs curated for Uptrend investors, tagged by sector and expected impact." },
      { property: "og:title", content: "Market News — Uptrend" },
      { property: "og:description", content: "Market-moving current affairs tagged by sector and expected impact." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewsPage,
});

function NewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Current affairs" subtitle="What's moving the tape right now." accent="from-amber-400 via-orange-400 to-rose-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {news.map((n) => (
          <GlassCard key={n.title} className="bg-gradient-to-br from-amber-500/15 to-orange-500/5">
            <div className="flex items-center gap-2">
              <Pill tone={n.impact === "high" ? "bear" : n.impact === "med" ? "warn" : "neutral"}>{n.tag}</Pill>
              <span className="text-[10px] text-muted-foreground">{n.source} · {n.time} ago</span>
            </div>
            <p className="mt-2 text-sm leading-snug">{n.title}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
