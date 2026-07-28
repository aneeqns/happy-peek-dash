import { createFileRoute } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip, GlassCard, Kpi, PageHeader, SectionTitle } from "@/components/ui-kit";
import { growthSeries, platformKpis, systemHealth } from "@/lib/admin-data";
import { fmt, fmtCompact } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — Uptrend Admin" },
      { name: "description", content: "Uptrend Creator dashboard: platform users, revenue, engagement and system health at a glance." },
      { property: "og:title", content: "Creator Dashboard — Uptrend Admin" },
      { property: "og:description", content: "Platform users, revenue, engagement and system health." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorHome,
});

function CreatorHome() {
  return (
    <div className="space-y-6">
      <PageHeader title="Creator Dashboard" subtitle="Platform-wide health, growth and revenue." accent="from-violet-400 via-fuchsia-400 to-rose-400" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Total users" value={fmtCompact(platformKpis.totalUsers)} delta={`${fmtCompact(platformKpis.activeUsers)} active`} tint="violet" />
        <Kpi label="MRR" value={`$${fmtCompact(platformKpis.mrr)}`} delta={`ARR $${fmtCompact(platformKpis.arr)}`} tint="emerald" />
        <Kpi label="Assets tracked" value={`$${fmtCompact(platformKpis.aum)}`} delta={`${fmtCompact(platformKpis.portfolios)} portfolios`} tint="sky" />
        <Kpi label="Churn" value={`${platformKpis.churn}%`} delta={`Avg session ${platformKpis.avgSession}`} tint="rose" />
      </div>
      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5" glow="violet">
        <SectionTitle>User growth</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthSeries}>
              <defs>
                <linearGradient id="creatorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bull)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--bull)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip unit="Users" valueFormatter={(v) => fmt(v, 0)} labelFormatter={(_l, p) => String(p?.month ?? "")} />} />
              <Area type="monotone" dataKey="users" stroke="var(--bull)" strokeWidth={2} fill="url(#creatorArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
      <GlassCard>
        <SectionTitle>System health</SectionTitle>
        <ul className="space-y-2 text-sm">
          {systemHealth.map((s) => (
            <li key={s.name} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
              <span>{s.name}</span>
              <span className={s.status === "Operational" ? "text-bull" : "text-bear"}>{s.status} · {s.latency} · {s.uptime}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
