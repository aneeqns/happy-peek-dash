import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowUpRight, Sparkles, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartLegend, ChartTooltip, GlassCard, Kpi, PageHeader, Pill, SectionTitle, Sparkline } from "@/components/ui-kit";
import { aiRecommendations, chartData, fmt, fmtCompact, initialWatchlist, news, portfolio, sectorData } from "@/lib/market-data";
import { useQuotes } from "@/lib/useQuotes";
import { useAuth } from "@/lib/auth";
import { useDemoWallet } from "@/lib/demo-wallet";
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { listHoldings } from '@/lib/holdings.functions';
import { positionDayChange } from '@/lib/portfolio-math';

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Uptrend" },
      { name: "description", content: "Your Uptrend dashboard: portfolio value, market movers, sector performance and AI recommendations in real time." },
      { property: "og:title", content: "Dashboard — Uptrend" },
      { property: "og:description", content: "Portfolio value, market movers, sector performance and AI recommendations in real time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const top = initialWatchlist.slice(0, 5);
  const { mode, user } = useAuth();
  const fetchHoldings = useServerFn(listHoldings);
  const holdingsQuery = useQuery({ queryKey: ['holdings', user?.id], queryFn: () => fetchHoldings(), enabled: mode === 'real' && Boolean(user?.id) });
  const wallet = useDemoWallet();
  const demo = mode !== "real" && wallet;
  const held = demo ? wallet.holdings : (holdingsQuery.data ?? []).map(h => ({ symbol: h.symbol, quantity: h.quantity, avgCost: h.avg_cost }));
  const { quotes, error: quoteError } = useQuotes([...top.map((t) => t.symbol), ...held.map((h) => h.symbol)]);
  const heldValue = held.reduce((s, h) => s + h.quantity * (quotes.get(h.symbol)?.price ?? h.avgCost), 0);
  const heldDay = held.reduce((s, h) => { const q = quotes.get(h.symbol); return s + (q ? positionDayChange(h.quantity, q.price, q.changePct) : 0); }, 0);
  const cost = held.reduce((s, h) => s + h.quantity * h.avgCost, 0);
  const inProfit = held.filter((h) => (quotes.get(h.symbol)?.price ?? h.avgCost) > h.avgCost).length;
  const watch = top.map((t) => {
    const q = quotes.get(t.symbol);
    return q ? { ...t, price: q.price, changePct: q.changePct, live: true } : { ...t, live: false };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="A live snapshot of your money and the market moving it."
        actions={<Pill tone="neutral">{[...quotes.values()].some(q => q.marketState === 'REGULAR') ? 'Markets open' : 'Market session closed'}</Pill>}
      />
      {quoteError && <p className="text-sm text-muted-foreground">{quoteError}</p>}
      {holdingsQuery.error && <p className="text-sm text-bear">Your holdings could not be loaded. Please refresh or sign in again.</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {demo ? (
          <>
            <Kpi label="Demo account value" value={`$${fmt(wallet.cash + heldValue)}`} delta={`${heldDay >= 0 ? "+" : "-"}$${fmt(Math.abs(heldDay))} today · pretend money`} tint="emerald" icon={<Wallet className="h-4 w-4" />} />
            <Kpi label="Virtual cash" value={`$${fmt(wallet.cash)}`} delta={`Started with $${fmt(wallet.startingCash, 0)}`} tint="sky" icon={<Activity className="h-4 w-4" />} />
            <Kpi label="Total return" value={`${(((wallet.cash + heldValue) / wallet.startingCash - 1) * 100).toFixed(2)}%`} delta="Real live prices" tint="violet" icon={<TrendingUp className="h-4 w-4" />} />
            <Kpi label="Open positions" value={String(held.length)} delta={`${inProfit} in profit`} tint="amber" icon={<ArrowUpRight className="h-4 w-4" />} />
          </>
        ) : (
          <>
        <Kpi label="Holdings value" value={`$${fmt(heldValue)}`} delta={`${heldDay >= 0 ? '+' : '-'}$${fmt(Math.abs(heldDay))} today`} tint="emerald" icon={<Wallet className="h-4 w-4" />} />
        <Kpi label="Cost basis" value={`$${fmt(cost)}`} tint="sky" icon={<Activity className="h-4 w-4" />} />
        <Kpi label="Unrealized return" value={cost > 0 ? `${((heldValue / cost - 1) * 100).toFixed(2)}%` : '—'} tint="violet" icon={<TrendingUp className="h-4 w-4" />} />
        <Kpi label="Open positions" value={String(held.length)} delta={`${inProfit} in profit`} tint="amber" icon={<ArrowUpRight className="h-4 w-4" />} />
          </>
        )}
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 bg-gradient-to-br from-sky-500/15 to-indigo-500/5" glow="sky">
          <SectionTitle right={<ChartLegend items={[{ label: "Bull", color: "var(--bull)" }, { label: "Bear", color: "var(--bear)" }]} />}>
            Illustrative performance chart
          </SectionTitle>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bull)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--bull)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" hide />
                <YAxis hide domain={["dataMin - 3000", "dataMax + 3000"]} />
                <Tooltip content={<ChartTooltip unit="Value" valueFormatter={(v) => `$${fmt(v, 0)}`} labelFormatter={() => "Portfolio"} />} />
                <Area type="monotone" dataKey="v" stroke="var(--bull)" strokeWidth={2} fill="url(#dashArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5" glow="emerald">
          <SectionTitle right={<Link to="/watchlist" className="text-[10px] uppercase tracking-wider text-emerald-300">View all</Link>}>
            Watchlist
          </SectionTitle>
          <ul className="space-y-2">
            {watch.map((t) => (
              <li key={t.symbol} className="flex items-center gap-3 rounded-xl border border-border/60 bg-surface/60 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="font-mono-nums text-sm font-semibold">{t.symbol}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{t.name}</p>
                </div>
                <div className="w-20 text-right">
                  <p className="font-mono-nums text-sm">{t.live ? fmt(t.price) : '—'}</p>
                  <p className={`font-mono-nums text-[11px] ${t.changePct >= 0 ? "text-bull" : "text-bear"}`}>
                    {t.live ? `${t.changePct >= 0 ? '+' : ''}${t.changePct.toFixed(2)}%` : 'Unavailable'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5" glow="violet">
          <SectionTitle>Illustrative sector performance</SectionTitle>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} interval={0} angle={-25} textAnchor="end" height={50} />
                <YAxis hide />
                <Tooltip content={<ChartTooltip accentByValue unit="Change" valueFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}%`} labelFormatter={(_l, p) => String(p?.name ?? "")} />} />
                <Bar dataKey="pct" radius={[4, 4, 0, 0]} fill="var(--bull)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-amber-500/15 to-orange-500/5" glow="amber">
          <SectionTitle right={<Link to="/news" className="text-[10px] uppercase tracking-wider text-amber-300">All news</Link>}>
            Example news
          </SectionTitle>
          <ul className="space-y-3">
            {news.slice(0, 4).map((n) => (
              <li key={n.title} className="border-b border-border/50 pb-2 last:border-0">
                <div className="flex items-center gap-2">
                  <Pill tone={n.impact === "high" ? "bear" : n.impact === "med" ? "warn" : "neutral"}>{n.tag}</Pill>
                  <span className="text-[10px] text-muted-foreground">
                    {n.source} · {n.time}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-snug">{n.title}</p>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="bg-gradient-to-br from-rose-500/15 to-pink-500/5" glow="rose">
          <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />}>Example research ideas</SectionTitle>
          <ul className="space-y-3">
            {aiRecommendations.map((r) => (
              <li key={r.symbol} className="rounded-xl border border-border/60 bg-surface/60 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-nums text-sm font-semibold">{r.symbol}</span>
                  <Pill tone={r.stance === "Trim" ? "bear" : r.stance === "Hold" ? "neutral" : "bull"}>{r.stance}</Pill>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{r.note}</p>
                <p className="mt-1 font-mono-nums text-[10px] text-muted-foreground">Confidence {r.confidence}%</p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </section>

    </div>
  );
}
