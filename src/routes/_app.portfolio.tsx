import { createFileRoute } from "@tanstack/react-router";
import { PortfolioInsights } from "@/components/PortfolioInsights";
import { GlassCard, Kpi, PageHeader, Pill, ProgressBar, SectionTitle } from "@/components/ui-kit";
import { fmt, goals, portfolio, positions } from "@/lib/market-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Uptrend" },
      { name: "description", content: "Track Uptrend positions, unrealized P/L, allocation, risk and goal-based investment plans in one place." },
      { property: "og:title", content: "Portfolio — Uptrend" },
      { property: "og:description", content: "Positions, P/L, allocation, risk and goal-based investing plans." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const invested = positions.reduce((s, p) => s + p.qty * p.price, 0);
  const cost = positions.reduce((s, p) => s + p.qty * p.avg, 0);
  const pl = invested - cost;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Portfolio"
        subtitle="Your holdings, performance and the goals they're funding."
        accent="from-emerald-400 via-teal-400 to-sky-400"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Market value" value={`$${fmt(invested)}`} delta={`+$${fmt(portfolio.change)} today`} tint="emerald" />
        <Kpi label="Cost basis" value={`$${fmt(cost)}`} tint="sky" />
        <Kpi label="Unrealized P/L" value={`$${fmt(pl)}`} delta={`${((pl / cost) * 100).toFixed(2)}%`} tint="violet" />
        <Kpi label="Cash" value={`$${fmt(portfolio.cash)}`} delta={`Buying power $${fmt(portfolio.buyingPower)}`} tint="amber" />
      </div>

      <GlassCard className="bg-gradient-to-br from-cyan-500/15 to-emerald-500/5" glow="emerald">
        <SectionTitle>Open positions</SectionTitle>
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
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const value = p.qty * p.price;
                const gain = value - p.qty * p.avg;
                return (
                  <tr key={p.symbol} className="border-b border-border/40 last:border-0">
                    <td className="py-2 font-mono-nums font-semibold">{p.symbol}</td>
                    <td className="py-2 text-right font-mono-nums">{p.qty}</td>
                    <td className="py-2 text-right font-mono-nums">{fmt(p.avg)}</td>
                    <td className="py-2 text-right font-mono-nums">{fmt(p.price)}</td>
                    <td className="py-2 text-right font-mono-nums">${fmt(value, 0)}</td>
                    <td className={cn("py-2 text-right font-mono-nums", gain >= 0 ? "text-bull" : "text-bear")}>
                      {gain >= 0 ? "+" : "-"}${fmt(Math.abs(gain), 0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <PortfolioInsights positions={positions} />

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
