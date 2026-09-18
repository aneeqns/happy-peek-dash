import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { PortfolioInsights } from "@/components/PortfolioInsights";
import { GlassCard, Kpi, PageHeader, Pill, ProgressBar, SectionTitle } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth";
import { addHolding, deleteHolding, listHoldings } from "@/lib/holdings.functions";
import { fmt, goals, positions as demoPositions } from "@/lib/market-data";
import { useQuotes } from "@/lib/useQuotes";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Uptrend" },
      { name: "description", content: "Track your real Uptrend holdings with live market prices, unrealized P/L, allocation and goal-based plans." },
      { property: "og:title", content: "Portfolio — Uptrend" },
      { property: "og:description", content: "Your holdings, live prices, P/L and goal-based investing plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const { mode } = useAuth();
  const isReal = mode === "real";

  const fetchHoldings = useServerFn(listHoldings);
  const holdingsQuery = useQuery({
    queryKey: ["holdings"],
    queryFn: () => fetchHoldings(),
    enabled: isReal,
  });

  const rows = useMemo(() => {
    if (!isReal) return demoPositions.map((p) => ({ id: p.symbol, symbol: p.symbol, quantity: p.qty, avg: p.avg }));
    return (holdingsQuery.data ?? []).map((h) => ({ id: h.id, symbol: h.symbol, quantity: h.quantity, avg: h.avg_cost }));
  }, [isReal, holdingsQuery.data]);

  const { quotes, error: quoteError, updatedAt, refetch } = useQuotes(rows.map((r) => r.symbol));

  const priced = rows.map((r) => {
    const q = quotes.get(r.symbol);
    const fallback = demoPositions.find((p) => p.symbol === r.symbol)?.price ?? r.avg;
    const price = q?.price ?? fallback;
    return { ...r, price, live: Boolean(q), changePct: q?.changePct ?? 0 };
  });

  const invested = priced.reduce((s, p) => s + p.quantity * p.price, 0);
  const cost = priced.reduce((s, p) => s + p.quantity * p.avg, 0);
  const pl = invested - cost;
  const dayChange = priced.reduce((s, p) => s + (p.quantity * p.price * p.changePct) / 100, 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio"
        subtitle={isReal ? "Your own holdings, valued with live market prices." : "Demo holdings — sample data, no real money."}
        accent="from-emerald-400 via-teal-400 to-sky-400"
        actions={
          <button
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh prices
          </button>
        }
      />

      {quoteError && <p className="text-xs text-amber-300">{quoteError}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Market value"
          value={`$${fmt(invested)}`}
          delta={`${dayChange >= 0 ? "+" : "-"}$${fmt(Math.abs(dayChange))} today`}
          tint="emerald"
        />
        <Kpi label="Cost basis" value={`$${fmt(cost)}`} tint="sky" />
        <Kpi
          label="Unrealized P/L"
          value={`$${fmt(pl)}`}
          delta={cost > 0 ? `${((pl / cost) * 100).toFixed(2)}%` : undefined}
          tint="violet"
        />
        <Kpi label="Holdings" value={String(priced.length)} delta={updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : undefined} tint="amber" />
      </div>

      <GlassCard className="bg-gradient-to-br from-cyan-500/15 to-emerald-500/5" glow="emerald">
        <SectionTitle>{isReal ? "Your holdings" : "Open positions (demo)"}</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2">Symbol</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Avg cost</th>
                <th className="py-2 text-right">Last</th>
                <th className="py-2 text-right">Value</th>
                <th className="py-2 text-right">P/L</th>
                {isReal && <th className="py-2" />}
              </tr>
            </thead>
            <tbody>
              {priced.map((p) => {
                const value = p.quantity * p.price;
                const gain = value - p.quantity * p.avg;
                return (
                  <tr key={p.id} className="border-b border-border/40 last:border-0">
                    <td className="py-2 font-mono-nums font-semibold">
                      {p.symbol}
                      {!p.live && <span className="ml-2 text-[10px] text-muted-foreground">no live price</span>}
                    </td>
                    <td className="py-2 text-right font-mono-nums">{fmt(p.quantity, 0)}</td>
                    <td className="py-2 text-right font-mono-nums">{fmt(p.avg)}</td>
                    <td className="py-2 text-right font-mono-nums">{fmt(p.price)}</td>
                    <td className="py-2 text-right font-mono-nums">${fmt(value, 0)}</td>
                    <td className={cn("py-2 text-right font-mono-nums", gain >= 0 ? "text-bull" : "text-bear")}>
                      {gain >= 0 ? "+" : "-"}${fmt(Math.abs(gain), 0)}
                    </td>
                    {isReal && (
                      <td className="py-2 text-right">
                        <RemoveHolding id={p.id} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {priced.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No holdings yet — add your first one below.
            </p>
          )}
        </div>
      </GlassCard>

      {isReal && <AddHoldingCard />}

      <PortfolioInsights positions={priced.map((p) => ({ symbol: p.symbol, qty: p.quantity, avg: p.avg, price: p.price }))} />

      <section>
        <SectionTitle>Goal-based investment ideas</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {goals.map((g) => {
            const pct = (g.saved / g.target) * 100;
            return (
              <GlassCard key={g.id} className="bg-gradient-to-br from-rose-500/15 to-fuchsia-500/5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{g.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {g.horizon} · ${fmt(g.monthly, 0)}/mo
                    </p>
                  </div>
                  <Pill tone={g.risk === "High" ? "bear" : g.risk === "Low" ? "bull" : "warn"}>{g.risk} risk</Pill>
                </div>

                <div className="mt-3">
                  <div className="mb-1 flex justify-between font-mono-nums text-[11px] text-muted-foreground">
                    <span>${fmt(g.saved, 0)}</span>
                    <span>${fmt(g.target, 0)}</span>
                  </div>
                  <ProgressBar pct={pct} tone={pct > 60 ? "bull" : pct > 25 ? "info" : "warn"} />
                </div>

                <div className="mt-3 space-y-1">
                  {g.allocation.map((a) => (
                    <div key={a.label} className="flex items-center gap-2 text-[11px]">
                      <span className="h-2 w-2 rounded-full" style={{ background: a.color }} />
                      <span className="flex-1 text-muted-foreground">{a.label}</span>
                      <span className="font-mono-nums">{a.pct}%</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {g.suggestions.map((s) => (
                    <span key={s} className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono-nums text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">{g.thesis}</p>
              </GlassCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function RemoveHolding({ id }: { id: string }) {
  const qc = useQueryClient();
  const remove = useServerFn(deleteHolding);
  const mutation = useMutation({
    mutationFn: () => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["holdings"] }),
  });
  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      aria-label="Remove holding"
      className="text-muted-foreground transition hover:text-rose-300"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

function AddHoldingCard() {
  const qc = useQueryClient();
  const add = useServerFn(addHolding);
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => add({ data: { symbol, quantity: Number(quantity), avgCost: Number(avgCost) } }),
    onSuccess: () => {
      setSymbol("");
      setQuantity("");
      setAvgCost("");
      setError(null);
      void qc.invalidateQueries({ queryKey: ["holdings"] });
    },
    onError: (e: unknown) => setError(e instanceof Error ? e.message : "Could not save that holding."),
  });

  return (
    <GlassCard className="bg-gradient-to-br from-sky-500/15 to-indigo-500/5" glow="sky">
      <SectionTitle>Add a holding</SectionTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
        className="flex flex-wrap items-center gap-2"
      >
        <input
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Symbol (e.g. AAPL)"
          className="min-w-36 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          inputMode="decimal"
          placeholder="Quantity"
          className="min-w-28 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
        />
        <input
          value={avgCost}
          onChange={(e) => setAvgCost(e.target.value)}
          inputMode="decimal"
          placeholder="Average cost"
          className="min-w-28 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
        />
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Holdings are private to your account and valued with live market prices.
      </p>
    </GlassCard>
  );
}
