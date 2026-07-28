import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { managedStocks } from "@/lib/admin-data";

export const Route = createFileRoute("/_app/creator/stocks")({
  head: () => ({
    meta: [
      { title: "Stock Management — Uptrend Admin" },
      { name: "description", content: "Listings, exchanges and featured symbols surfaced across the app." },
      { property: "og:title", content: "Stock Management — Uptrend Admin" },
      { property: "og:description", content: "Listings, exchanges and featured symbols surfaced across the app." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Stock Management" subtitle="Listings, exchanges and featured symbols surfaced across the app." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {managedStocks.map((s) => (
          <GlassCard key={s.symbol} className="bg-gradient-to-br from-emerald-500/15 to-sky-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-nums text-sm font-semibold">{s.symbol} <span className="ml-2 font-sans text-xs text-muted-foreground">{s.name}</span></p>
              <div className="flex gap-1.5">
                {s.featured && <Pill tone="warn">Featured</Pill>}
                <Pill tone={s.listed ? "bull" : "bear"}>{s.listed ? "Listed" : "Delisted"}</Pill>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{s.exchange} · {s.sector}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
