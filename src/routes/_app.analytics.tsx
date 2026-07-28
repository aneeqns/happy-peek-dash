import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip, GlassCard, Kpi, PageHeader, SectionTitle } from "@/components/ui-kit";
import { fmt, portfolio, sectorData } from "@/lib/market-data";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Uptrend" },
      { name: "description", content: "Uptrend analytics: sector exposure, risk metrics and performance against the benchmark for your portfolio." },
      { property: "og:title", content: "Analytics — Uptrend" },
      { property: "og:description", content: "Sector exposure, risk metrics and benchmark-relative performance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Deeper numbers behind the performance." accent="from-sky-400 via-indigo-400 to-violet-400" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Alpha vs S&P" value="+3.42%" delta="Trailing 12m" tint="emerald" />
        <Kpi label="Beta" value="1.18" delta="Slightly aggressive" tint="sky" />
        <Kpi label="Sharpe" value="1.42" delta="Good risk-adjusted" tint="violet" />
        <Kpi label="Max drawdown" value="-12.6%" delta="-12.6%" tint="rose" />
      </div>
      <GlassCard className="bg-gradient-to-br from-indigo-500/15 to-violet-500/5" glow="sky">
        <SectionTitle>Sector contribution</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sectorData}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip accentByValue unit="Change" valueFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`} labelFormatter={(_l, p) => String(p?.name ?? "")} />} />
              <Bar dataKey="pct" radius={[4, 4, 0, 0]} fill="var(--bull)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Win rate {portfolio.winRate}% · Avg position size ${fmt(portfolio.value / 5, 0)}</p>
      </GlassCard>
    </div>
  );
}
