import { createFileRoute } from "@tanstack/react-router";
import { useCreatorDirectory } from "@/lib/useCreatorDirectory";
import { EmptyState, GlassCard, PageHeader, Pill, SectionTitle, ChartTooltip } from "@/components/ui-kit";
import { fmt } from "@/lib/market-data";

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
  component: CreatorStocks,
});

function CreatorStocks() {
  const q = useCreatorDirectory();
  if (q.isLoading) return <EmptyState title="Loading real data…" />;
  if (q.error || !q.data) return <EmptyState title="Could not load data" hint={q.error ? String((q.error as Error).message) : undefined} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Stock Management" subtitle="Symbols your customers actually hold." accent="from-violet-400 via-sky-400 to-emerald-400" />
      {d.symbols.length === 0 ? <EmptyState title="No customer holdings yet" /> : (
      <div className="grid gap-3 lg:grid-cols-2">
        {d.symbols.map((s) => (
          <GlassCard key={s.symbol} className="bg-gradient-to-br from-emerald-500/15 to-sky-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono-nums text-sm font-semibold">{s.symbol}</p>
              <Pill tone="info">{s.holders} holder(s)</Pill>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{fmt(s.quantity, 2)} units · ${fmt(s.cost, 2)} invested</p>
          </GlassCard>))}
      </div>)}
    </div>
  );
}
