import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { fmt, marketUniverse, type MarketKind } from "@/lib/market-data";
import { ShariahBadge } from "@/components/shariah-ui";
import { statusOf } from "@/lib/shariah";
import { cn } from "@/lib/utils";

type Search = { q?: string };

export const Route = createFileRoute("/_app/markets")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Markets — Uptrend" },
      { name: "description", content: "Explore every market on Uptrend: US stocks, ETFs, global indices, crypto, FX and commodities with live prices." },
      { property: "og:title", content: "Markets — Uptrend" },
      { property: "og:description", content: "Search stocks, ETFs, indices, crypto, FX and commodities in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketsPage,
});

const KINDS: (MarketKind | "All")[] = ["All", "Stock", "ETF", "Index", "Crypto", "FX", "Commodity"];

function MarketsPage() {
  const { q } = Route.useSearch();
  const [query, setQuery] = useState(q ?? "");
  const [kind, setKind] = useState<MarketKind | "All">("All");
  const [shariah, setShariah] = useState<"All" | "compliant" | "non_compliant" | "unavailable">("All");

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return marketUniverse.filter((m) => {
      const matchesKind = kind === "All" || m.kind === kind;
      const matchesQuery =
        !needle || m.symbol.toLowerCase().includes(needle) || m.name.toLowerCase().includes(needle);
      const matchesShariah = shariah === "All" || statusOf(m.symbol) === shariah;
      return matchesKind && matchesQuery && matchesShariah;
    });
  }, [query, kind, shariah]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Markets"
        subtitle="Search and filter the whole universe — equities, funds, indices, crypto, currencies and commodities."
        accent="from-sky-400 via-cyan-400 to-emerald-400"
      />

      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-cyan-500/5" glow="sky">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by symbol or name…"
            className="min-w-48 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
          />
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  kind === k ? "border-primary/60 bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Shariah</span>
          {([
            ["All", "All"],
            ["compliant", "🟢 Compliant"],
            ["non_compliant", "🔴 Not compliant"],
            ["unavailable", "🟡 Unavailable"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setShariah(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                shariah === value
                  ? "border-emerald-400/60 bg-emerald-500/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2">Symbol</th>
                <th className="py-2">Name</th>
                <th className="py-2">Type</th>
                <th className="py-2">Region</th>
                <th className="py-2">Shariah</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={`${m.kind}-${m.symbol}`} className="border-b border-border/40 last:border-0 hover:bg-surface-elevated/60">
                  <td className="py-2 font-mono-nums font-semibold">{m.symbol}</td>
                  <td className="py-2 text-muted-foreground">{m.name}</td>
                  <td className="py-2">
                    <Pill tone="info">{m.kind}</Pill>
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">{m.region}</td>
                  <td className="py-2">
                    <ShariahBadge status={statusOf(m.symbol)} />
                  </td>
                  <td className="py-2 text-right font-mono-nums">{fmt(m.price)}</td>
                  <td className={cn("py-2 text-right font-mono-nums", m.pct >= 0 ? "text-bull" : "text-bear")}>
                    {m.pct >= 0 ? "+" : ""}
                    {m.pct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No markets match that search.</p>}
        </div>
      </GlassCard>
    </div>
  );
}
