import { createFileRoute } from "@tanstack/react-router";
import { useCreatorDirectory } from "@/lib/useCreatorDirectory";
import { EmptyState, GlassCard, PageHeader, Pill, SectionTitle, ChartTooltip } from "@/components/ui-kit";
import { fmt } from "@/lib/market-data";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  component: CreatorAnalytics,
});

function CreatorAnalytics() {
  const q = useCreatorDirectory();
  if (q.isLoading) return <EmptyState title="Loading real data…" />;
  if (q.error || !q.data) return <EmptyState title="Could not load data" hint={q.error ? String((q.error as Error).message) : undefined} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Platform Analytics" subtitle="Real sign-ups and holdings added, by day of week." accent="from-violet-400 via-sky-400 to-emerald-400" />
      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-violet-500/5" glow="sky">
        <SectionTitle>Activity by weekday (all time)</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.weekday}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <Tooltip content={<ChartTooltip valueFormatter={(v) => fmt(v, 0)} />} />
              <Bar dataKey="signups" name="Sign-ups" radius={[4, 4, 0, 0]} fill="var(--bull)" />
              <Bar dataKey="holdingsAdded" name="Holdings added" radius={[4, 4, 0, 0]} fill="var(--bear)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
