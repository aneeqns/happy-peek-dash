import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip, GlassCard, Kpi, PageHeader, SectionTitle } from "@/components/ui-kit";
import { getCreatorStats } from "@/lib/creator-stats.functions";
import { useQuotes } from "@/lib/useQuotes";
import { fmt, fmtCompact } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — Uptrend Admin" },
      { name: "description", content: "Uptrend Creator dashboard: real sign-ups, investors, holdings and live system health." },
      { property: "og:title", content: "Creator Dashboard — Uptrend Admin" },
      { property: "og:description", content: "Real sign-ups, investors, holdings and live system health." },
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

  const symbols = (data?.topSymbols ?? []).map((s) => s.symbol);
  const { quotes, updatedAt } = useQuotes(symbols);

  const priced = (data?.topSymbols ?? []).map((s) => {
    const q = quotes.get(s.symbol);
    const marketValue = q ? q.price * s.quantity : null;
    return { ...s, price: q?.price ?? null, marketValue, pl: marketValue === null ? null : marketValue - s.cost };
  });
  const marketValue = priced.reduce((sum, s) => sum + (s.marketValue ?? s.cost), 0);
  const unrealised = marketValue - (data?.costBasis ?? 0);
  const bankPct = data && data.totalUsers > 0 ? (data.usersWithBank / data.totalUsers) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator Dashboard"
        subtitle="Every figure here is read live from your own database and the market data feed."
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
          delta={`${fmtCompact(data?.signupsLast30Days ?? 0)} in 30d · ${fmtCompact(data?.signupsLast7Days ?? 0)} in 7d`}
          tint="violet"
        />
        <Kpi
          label="Investors"
          value={isLoading ? "—" : fmtCompact(data?.investors ?? 0)}
          delta={`${fmtCompact(data?.totalHoldings ?? 0)} holdings tracked`}
          tint="emerald"
        />
        <Kpi
          label="Invested (cost basis)"
          value={isLoading ? "—" : `$${fmtCompact(data?.costBasis ?? 0)}`}
          delta={`Live value $${fmtCompact(marketValue)} · ${unrealised >= 0 ? "+" : "−"}$${fmtCompact(Math.abs(unrealised))}`}
          tint="sky"
        />
        <Kpi
          label="Bank details on file"
          value={isLoading ? "—" : fmtCompact(data?.usersWithBank ?? 0)}
          delta={`${fmt(bankPct, 0)}% of ${fmtCompact(data?.totalUsers ?? 0)} users`}
          tint="amber"
        />
      </div>

      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-violet-500/5" glow="sky">
        <SectionTitle>Sign-ups — last 14 days</SectionTitle>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.signupSeries ?? []}>
              <defs>
                <linearGradient id="signupFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--bull)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--bull)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
              <Tooltip content={<ChartTooltip valueFormatter={(v) => fmt(v, 0)} />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="signups"
                name="New sign-ups"
                stroke="var(--bull)"
                fill="url(#signupFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Total users"
                stroke="var(--muted-foreground)"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5" glow="violet">
        <SectionTitle>Most held symbols (live prices)</SectionTitle>
        {priced.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading real figures…" : "No holdings have been added yet."}
          </p>
        ) : (
          <>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priced}>
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
                  <Bar dataKey="holders" name="Holders" radius={[4, 4, 0, 0]} fill="var(--bull)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="py-2 text-left">Symbol</th>
                    <th className="py-2 text-right">Holders</th>
                    <th className="py-2 text-right">Units</th>
                    <th className="py-2 text-right">Live price</th>
                    <th className="py-2 text-right">Value</th>
                    <th className="py-2 text-right">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {priced.map((s) => (
                    <tr key={s.symbol} className="border-t border-border/40">
                      <td className="py-2 font-medium">{s.symbol}</td>
                      <td className="py-2 text-right">{s.holders}</td>
                      <td className="py-2 text-right">{fmt(s.quantity, 2)}</td>
                      <td className="py-2 text-right">{s.price === null ? "—" : `$${fmt(s.price, 2)}`}</td>
                      <td className="py-2 text-right">{s.marketValue === null ? "—" : `$${fmt(s.marketValue, 2)}`}</td>
                      <td className={`py-2 text-right ${(s.pl ?? 0) >= 0 ? "text-bull" : "text-bear"}`}>
                        {s.pl === null ? "—" : `${s.pl >= 0 ? "+" : "−"}$${fmt(Math.abs(s.pl), 2)}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>

      <GlassCard className="bg-gradient-to-br from-emerald-500/12 to-sky-500/5" glow="emerald">
        <SectionTitle>Newest accounts</SectionTitle>
        {(data?.recentUsers?.length ?? 0) === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {isLoading ? "Loading…" : "No accounts have been created yet."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 text-left">Email</th>
                  <th className="py-2 text-left">Username</th>
                  <th className="py-2 text-left">Joined</th>
                  <th className="py-2 text-right">Holdings</th>
                  <th className="py-2 text-right">Bank</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentUsers.map((u) => (
                  <tr key={`${u.email}-${u.createdAt}`} className="border-t border-border/40">
                    <td className="py-2">{u.email}</td>
                    <td className="py-2 text-muted-foreground">{u.username ?? "—"}</td>
                    <td className="py-2 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 text-right">{u.holdings}</td>
                    <td className={`py-2 text-right ${u.hasBank ? "text-bull" : "text-muted-foreground"}`}>
                      {u.hasBank ? "On file" : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <GlassCard>
        <SectionTitle>System health (live checks)</SectionTitle>
        <ul className="space-y-2 text-sm">
          {(data?.health ?? []).map((s) => (
            <li key={s.name} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
              <span>{s.name}</span>
              <span className={s.status === "Operational" ? "text-bull" : "text-bear"}>
                {s.status} · {s.detail}
              </span>
            </li>
          ))}
          {isLoading && <li className="text-muted-foreground">Running checks…</li>}
        </ul>
      </GlassCard>

      <p className="text-xs text-muted-foreground">
        {data?.at ? `Database read ${new Date(data.at).toLocaleTimeString()}` : ""}
        {updatedAt ? ` · prices ${new Date(updatedAt).toLocaleTimeString()}` : ""}
      </p>
    </div>
  );
}
