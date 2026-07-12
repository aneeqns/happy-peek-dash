import { useMemo } from "react";
import { Activity, PieChart as PieIcon, Shield, TrendingUp, TrendingDown, Gauge } from "lucide-react";

type Position = { symbol: string; qty: number; avg: number; price: number; sector?: string };

const SECTOR_MAP: Record<string, string> = {
  NVDA: "Tech", AAPL: "Tech", MSFT: "Tech", GOOGL: "Tech", META: "Tech",
  AMZN: "Consumer", TSLA: "Consumer",
  JPM: "Finance", BAC: "Finance",
  XOM: "Energy", CVX: "Energy",
  JNJ: "Health", PFE: "Health",
};

const SECTOR_COLORS: Record<string, string> = {
  Tech: "oklch(0.7 0.18 260)",
  Consumer: "oklch(0.78 0.17 155)",
  Finance: "oklch(0.75 0.14 90)",
  Energy: "oklch(0.68 0.22 25)",
  Health: "oklch(0.72 0.15 200)",
  Other: "oklch(0.5 0.03 265)",
};

export function PortfolioInsights({ positions }: { positions: Position[] }) {
  const stats = useMemo(() => {
    const enriched = positions.map((p) => {
      const mv = p.qty * p.price;
      const pl = (p.price - p.avg) * p.qty;
      const plPct = ((p.price - p.avg) / p.avg) * 100;
      return { ...p, mv, pl, plPct, sector: p.sector ?? SECTOR_MAP[p.symbol] ?? "Other" };
    });
    const total = enriched.reduce((s, p) => s + p.mv, 0);
    const invested = enriched.reduce((s, p) => s + p.avg * p.qty, 0);
    const totalPL = total - invested;
    const totalPLPct = invested ? (totalPL / invested) * 100 : 0;

    const bySector = new Map<string, number>();
    enriched.forEach((p) => bySector.set(p.sector, (bySector.get(p.sector) ?? 0) + p.mv));
    const allocation = [...bySector.entries()]
      .map(([name, mv]) => ({ name, mv, pct: (mv / total) * 100 }))
      .sort((a, b) => b.mv - a.mv);

    // Concentration: Herfindahl-like on positions
    const weights = enriched.map((p) => p.mv / total);
    const hhi = weights.reduce((s, w) => s + w * w, 0);
    const diversification = Math.round((1 - hhi) * 100); // 0-100

    const top = [...enriched].sort((a, b) => b.plPct - a.plPct)[0];
    const worst = [...enriched].sort((a, b) => a.plPct - b.plPct)[0];
    const topWeight = weights.length ? Math.max(...weights) * 100 : 0;

    // Mock benchmark
    const benchYtd = 12.4;
    const portYtd = totalPLPct;
    const alpha = portYtd - benchYtd;

    // Risk score 0-100 (higher = riskier). Rough blend of concentration + tech weight
    const techPct = allocation.find((a) => a.name === "Tech")?.pct ?? 0;
    const risk = Math.min(100, Math.round(hhi * 100 + techPct * 0.4));

    return { enriched, total, totalPL, totalPLPct, allocation, diversification, top, worst, topWeight, alpha, portYtd, benchYtd, risk };
  }, [positions]);

  return (
    <section id="insights" className="mt-6 scroll-mt-24">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold">Portfolio insights</h2>
          </div>
          <p className="text-xs text-muted-foreground">Diversification, risk & benchmark analytics on your open positions.</p>
        </div>
        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
          Premium preview
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Allocation donut */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <PieIcon className="h-4 w-4 text-muted-foreground" /> Sector allocation
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Donut segments={stats.allocation.map((a) => ({ pct: a.pct, color: SECTOR_COLORS[a.name] ?? SECTOR_COLORS.Other }))} />
            <ul className="flex-1 space-y-1.5 text-xs">
              {stats.allocation.map((a) => (
                <li key={a.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: SECTOR_COLORS[a.name] ?? SECTOR_COLORS.Other }} />
                  <span className="flex-1 text-foreground">{a.name}</span>
                  <span className="font-mono-nums text-muted-foreground">{a.pct.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risk & diversification */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="h-4 w-4 text-muted-foreground" /> Risk profile
          </div>
          <div className="mt-4 space-y-4">
            <Meter label="Risk score" value={stats.risk} tone={stats.risk > 60 ? "bear" : stats.risk > 35 ? "warn" : "bull"} suffix="/100" />
            <Meter label="Diversification" value={stats.diversification} tone={stats.diversification > 60 ? "bull" : stats.diversification > 40 ? "warn" : "bear"} suffix="/100" />
            <div className="rounded-lg border border-border/70 bg-background/40 p-3 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" /> Largest single position
              </div>
              <p className="mt-1 font-mono-nums text-sm font-semibold">
                {stats.topWeight.toFixed(1)}% of portfolio
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {stats.topWeight > 30 ? "High concentration — consider trimming." : "Concentration looks healthy."}
              </p>
            </div>
          </div>
        </div>

        {/* Benchmark + movers */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-muted-foreground" /> vs S&amp;P 500 (YTD)
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Stat label="Portfolio" value={`${stats.portYtd >= 0 ? "+" : ""}${stats.portYtd.toFixed(2)}%`} tone={stats.portYtd >= 0 ? "bull" : "bear"} />
            <Stat label="S&P 500" value={`+${stats.benchYtd.toFixed(2)}%`} tone="muted" />
            <Stat label="Alpha" value={`${stats.alpha >= 0 ? "+" : ""}${stats.alpha.toFixed(2)}%`} tone={stats.alpha >= 0 ? "bull" : "bear"} />
          </div>
          <div className="mt-4 space-y-2 text-xs">
            {stats.top && (
              <div className="flex items-center justify-between rounded-lg border border-bull/30 bg-bull/5 px-3 py-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5 text-bull" /> Top gainer
                </span>
                <span className="font-mono-nums">
                  <span className="font-semibold text-foreground">{stats.top.symbol}</span>{" "}
                  <span className="text-bull">+{stats.top.plPct.toFixed(2)}%</span>
                </span>
              </div>
            )}
            {stats.worst && (
              <div className="flex items-center justify-between rounded-lg border border-bear/30 bg-bear/5 px-3 py-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <TrendingDown className="h-3.5 w-3.5 text-bear" /> Laggard
                </span>
                <span className="font-mono-nums">
                  <span className="font-semibold text-foreground">{stats.worst.symbol}</span>{" "}
                  <span className={stats.worst.plPct >= 0 ? "text-bull" : "text-bear"}>
                    {stats.worst.plPct >= 0 ? "+" : ""}{stats.worst.plPct.toFixed(2)}%
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Donut({ segments }: { segments: { pct: number; color: string }[] }) {
  const R = 34;
  const C = 2 * Math.PI * R;
  let offset = 0;
  return (
    <svg viewBox="0 0 90 90" className="h-24 w-24 -rotate-90">
      <circle cx="45" cy="45" r={R} fill="none" stroke="oklch(0.26 0.025 265)" strokeWidth="12" />
      {segments.map((s, i) => {
        const len = (s.pct / 100) * C;
        const el = (
          <circle
            key={i}
            cx="45"
            cy="45"
            r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="12"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-offset}
          />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

function Meter({ label, value, tone, suffix }: { label: string; value: number; tone: "bull" | "bear" | "warn"; suffix?: string }) {
  const color = tone === "bull" ? "var(--bull)" : tone === "bear" ? "var(--bear)" : "oklch(0.78 0.15 80)";
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono-nums font-semibold">{value}{suffix}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background/60">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "bull" | "bear" | "muted" }) {
  const color = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border/70 bg-background/40 p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-mono-nums text-sm font-semibold ${color}`}>{value}</p>
    </div>
  );
}
