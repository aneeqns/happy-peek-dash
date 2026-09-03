import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Sparkline } from "@/components/ui-kit";
import { fmt, initialWatchlist } from "@/lib/market-data";
import { ShariahBadge } from "@/components/shariah-ui";
import { statusOf } from "@/lib/shariah";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/watchlist")({
  head: () => ({
    meta: [
      { title: "Watchlist — Uptrend" },
      { name: "description", content: "Your Uptrend watchlist with live prices, daily change and sparkline trends for every tracked symbol." },
      { property: "og:title", content: "Watchlist — Uptrend" },
      { property: "og:description", content: "Live prices, daily change and sparkline trends for every symbol you follow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WatchlistPage,
});

function WatchlistPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Watchlist" subtitle="Everything you follow, with trend at a glance." accent="from-emerald-400 via-lime-400 to-amber-400" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {initialWatchlist.map((t) => (
          <GlassCard key={t.symbol} className="bg-gradient-to-br from-emerald-500/15 to-lime-500/5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono-nums text-sm font-semibold">{t.symbol}</p>
                <p className="truncate text-[11px] text-muted-foreground">{t.name}</p>
              </div>
              <Sparkline data={t.spark} />
            </div>
            <div className="mt-3">
              <ShariahBadge status={statusOf(t.symbol)} />
            </div>
            <div className="mt-3 flex items-end justify-between">
              <p className="font-mono-nums text-lg">{fmt(t.price)}</p>
              <p className={cn("font-mono-nums text-sm", t.changePct >= 0 ? "text-bull" : "text-bear")}>
                {t.changePct >= 0 ? "+" : ""}
                {t.changePct.toFixed(2)}% ({t.change >= 0 ? "+" : ""}
                {fmt(t.change)})
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
