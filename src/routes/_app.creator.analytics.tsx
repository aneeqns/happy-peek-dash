import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip, GlassCard, PageHeader, SectionTitle } from "@/components/ui-kit";
import { engagementSeries } from "@/lib/admin-data";
import { fmt } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/analytics")({
  head: () => ({
    meta: [
      { title: "Platform Analytics — Uptrend Admin" },
      { name: "description", content: "Weekly sessions and trade volume across the Uptrend platform." },
      { property: "og:title", content: "Platform Analytics — Uptrend Admin" },
      { property: "og:description", content: "Weekly sessions and trade volume across the platform." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Platform Analytics" subtitle="Engagement across the week." accent="from-sky-400 via-violet-400 to-fuchsia-400" />
      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-violet-500/5" glow="sky">
        <SectionTitle>Sessions by day</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementSeries}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip unit="Sessions" valueFormatter={(v) => fmt(v, 0)} labelFormatter={(_l, p) => String(p?.day ?? "")} />} />
              <Bar dataKey="sessions" radius={[4, 4, 0, 0]} fill="var(--bull)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  ),
});
