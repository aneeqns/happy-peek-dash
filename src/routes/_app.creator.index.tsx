import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip, GlassCard, Kpi, PageHeader, SectionTitle } from "@/components/ui-kit";
import { getCreatorStats } from "@/lib/creator-stats.functions";
import { systemHealth } from "@/lib/admin-data";
import { fmt, fmtCompact } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — Uptrend Admin" },
      { name: "description", content: "Uptrend Creator dashboard: real sign-ups, investors, holdings and system health at a glance." },
      { property: "og:title", content: "Creator Dashboard — Uptrend Admin" },
      { property: "og:description", content: "Real sign-ups, investors, holdings and system health." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorHome,
});

function CreatorHome() {
  const fetchStats = useServerFn(getCreatorStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["creator-stats"],
    queryFn: () => fetchStats(),
    refetchInterval: 60_000,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator Dashboard"
        subtitle="Real platform figures, straight from your live database."
        accent="from-violet-400 via-fuchsia-400 to-rose-400"
      />

      {error && (
        <GlassCard>
          <p className="text-sm text-bear">Could not load platform figures. Try reloading the page.</p>
        </GlassCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="Registered users"
          value={isLoading ? "—" : fmtCompact(data?.totalUsers ?? 0)}
          delta={`${fmtCompact(data?.signupsLast30Days ?? 0)} in last 30 days`}
          tint="violet"
        />
        <Kpi
          label="Investors"
          value={isLoading ? "—" : fmtCompact(data?.investors ?? 0)}
          delta={`${fmtCompact(data?.totalHoldings ?? 0)} holdings tracked`}
          tint="emerald"
        />
        <Kpi
          label="Total invested (cost)"
          value={isLoading ? "—" : `$${fmtCompact(data?.costBasis ?? 0)}`}
          delta="Sum of quantity × average cost"
          tint="sky"
        />
        <Kpi
          label="Bank details on file"
          value={isLoading ? "—" : fmtCompact(data?.usersWithBank ?? 0)}
          delta={`of ${fmtCompact(data?.totalUsers ?? 0)} users`}
          tint="amber"
        />
      </div>

      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5" glow="violet">
        <SectionTitle>Most held symbols</SectionTitle>
        {(data?.topSymbols?.length ?? 0) === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading real figures…" : "No holdings have been added yet."}
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topSymbols ?? []}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="symbol" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis hide allowDecimals={false} />
                <Tooltip
                  content={
                    <ChartTooltip
                      unit="Holders"
                      valueFormatter={(v) => fmt(v, 0)}
                      labelFormatter={(_l, p) => String(p?.symbol ?? "")}
                    />
                  }
                />
                <Bar dataKey="holders" radius={[4, 4, 0, 0]} fill="var(--bull)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <SectionTitle>System health</SectionTitle>
        <ul className="space-y-2 text-sm">
          {systemHealth.map((s) => (
            <li key={s.name} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
              <span>{s.name}</span>
              <span className={s.status === "Operational" ? "text-bull" : "text-bear"}>
                {s.status} · {s.latency} · {s.uptime}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {data?.at && (
        <p className="text-xs text-muted-foreground">Updated {new Date(data.at).toLocaleTimeString()}</p>
      )}
    </div>
  );
}
