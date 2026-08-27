import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, Info } from "lucide-react";
import { GlassCard, PageHeader, Pill, SectionTitle } from "@/components/ui-kit";
import { CriterionRow, ShariahBadge, ShariahDisclaimer } from "@/components/shariah-ui";
import { fmt, marketUniverse } from "@/lib/market-data";
import {
  activeMethodology,
  exchangeOf,
  marketCapsB,
  METHODOLOGIES,
  screeningInputs,
  screen,
  sectorOf,
  SHARIAH_DISCLAIMER,
  STATUS_META,
  type ShariahStatus,
} from "@/lib/shariah";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/shariah")({
  head: () => ({
    meta: [
      { title: "Shariah Compliant Stocks — Uptrend" },
      { name: "description", content: "Discover, filter and understand stocks screened against a defined Shariah methodology — business activity and financial ratio screens with transparent results." },
      { property: "og:title", content: "Shariah Compliant Stocks — Uptrend" },
      { property: "og:description", content: "Screened stocks with business-activity and financial-ratio results, plus the methodology behind each status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShariahPage,
});

type SortKey = "price" | "cap" | "performance";
const STATUS_FILTERS: ("all" | ShariahStatus)[] = ["all", "compliant", "non_compliant", "unavailable"];

function ShariahPage() {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("All");
  const [sector, setSector] = useState("All");
  const [status, setStatus] = useState<"all" | ShariahStatus>("all");
  const [sort, setSort] = useState<SortKey>("cap");
  const [showMethodology, setShowMethodology] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const byNeedle = (symbol: string, name: string, sec: string) =>
      !needle ||
      symbol.toLowerCase().includes(needle) ||
      name.toLowerCase().includes(needle) ||
      sec.toLowerCase().includes(needle);

    const list = screeningInputs.map((input) => {
      const meta = marketUniverse.find((m) => m.symbol === input.symbol);
      const s = screen(input.symbol)!;
      return {
        symbol: input.symbol,
        name: meta?.name ?? input.symbol,
        price: meta?.price ?? 0,
        pct: meta?.pct ?? 0,
        cap: marketCapsB[input.symbol] ?? 0,
        sector: sectorOf[input.symbol] ?? "Other",
        exchange: exchangeOf[input.symbol] ?? "—",
        screening: s,
      };
    });

    return list
      .filter(
        (r) =>
          byNeedle(r.symbol, r.name, r.sector) &&
          (market === "All" || r.exchange === market) &&
          (sector === "All" || r.sector === sector) &&
          (status === "all" || r.screening.status === status),
      )
      .sort((a, b) =>
        sort === "price" ? b.price - a.price : sort === "performance" ? b.pct - a.pct : b.cap - a.cap,
      );
  }, [query, market, sector, status, sort]);

  const markets = ["All", ...Array.from(new Set(screeningInputs.map((s) => exchangeOf[s.symbol] ?? "—")))];
  const sectors = ["All", ...Array.from(new Set(screeningInputs.map((s) => sectorOf[s.symbol] ?? "Other")))];

  const counts = STATUS_FILTERS.slice(1).map((s) => ({
    status: s as ShariahStatus,
    n: screeningInputs.filter((i) => screen(i.symbol)!.status === s).length,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="🕌 Shariah Compliant Stocks"
        subtitle="Stocks that pass our selected Shariah screening criteria — business activity plus financial ratio screens, with every result shown."
        accent="from-emerald-400 via-teal-400 to-sky-400"
        actions={
          <button
            type="button"
            onClick={() => setShowMethodology((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
          >
            <BookOpen className="h-3.5 w-3.5" /> Screening Methodology
          </button>
        }
      />

      {showMethodology && (
        <GlassCard className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5" glow="emerald">
          <SectionTitle icon={<BookOpen className="h-3.5 w-3.5" />}>Screening Methodology</SectionTitle>
          <p className="text-sm text-muted-foreground">
            Uptrend uses a defined Shariah screening methodology to classify securities. Shariah screening standards can
            differ, so compliance status depends on the methodology selected and the latest available company
            information.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {METHODOLOGIES.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "rounded-xl border p-3",
                  m.id === activeMethodology.id ? "border-emerald-500/50 bg-emerald-500/10" : "border-border/60 bg-surface/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{m.name}</p>
                  <Pill tone={m.id === activeMethodology.id ? "bull" : "neutral"}>
                    {m.id === activeMethodology.id ? "Active" : m.configured ? "Available" : "Not connected"}
                  </Pill>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{m.provider}</p>
                {m.configured ? (
                  <ul className="mt-2 space-y-1 font-mono-nums text-[11px] text-muted-foreground">
                    <li>Ratio basis: {m.ratioBasis}</li>
                    <li>Interest-bearing debt ≤ {(m.thresholds.debt * 100).toFixed(2)}%</li>
                    <li>Cash + interest-bearing securities ≤ {(m.thresholds.liquidAssets * 100).toFixed(2)}%</li>
                    <li>Accounts receivable + cash ≤ {(m.thresholds.receivables * 100).toFixed(2)}%</li>
                    <li>Non-permissible income ≤ {(m.thresholds.nonPermissibleIncome * 100).toFixed(2)}%</li>
                  </ul>
                ) : (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Thresholds are supplied by the provider once connected — Uptrend does not substitute its own.
                  </p>
                )}
                <p className="mt-2 text-[11px] text-muted-foreground">{m.notes}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-cyan-500/5" glow="sky">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company or sector — e.g. “technology”…"
            className="min-w-52 flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary/60"
          />
          <select value={market} onChange={(e) => setMarket(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs">
            {markets.map((m) => (
              <option key={m} value={m}>{m === "All" ? "All markets" : m}</option>
            ))}
          </select>
          <select value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs">
            {sectors.map((s) => (
              <option key={s} value={s}>{s === "All" ? "All industries" : s}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs">
            <option value="cap">Sort: Market cap</option>
            <option value="price">Sort: Price</option>
            <option value="performance">Sort: Performance</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                status === s ? "border-primary/60 bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "all" ? "All stocks" : `${STATUS_META[s].emoji} ${STATUS_META[s].label}`}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
          {counts.map((c) => (
            <span key={c.status} className="font-mono-nums">
              {STATUS_META[c.status].emoji} {c.n} {STATUS_META[c.status].label}
            </span>
          ))}
        </div>
      </GlassCard>

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((r) => (
          <GlassCard key={r.symbol} className="bg-gradient-to-br from-emerald-500/12 to-sky-500/5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-mono-nums text-sm font-semibold">
                  {r.symbol} <span className="ml-1 font-sans text-xs text-muted-foreground">— {r.name}</span>
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{r.exchange} · {r.sector}</p>
              </div>
              <ShariahBadge status={r.screening.status} />
            </div>

            <div className="mt-3 flex items-end gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Price</p>
                <p className="font-mono-nums text-lg font-semibold">${fmt(r.price)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Today</p>
                <p className={cn("font-mono-nums text-lg font-semibold", r.pct >= 0 ? "text-bull" : "text-bear")}>
                  {r.pct >= 0 ? "+" : ""}{r.pct.toFixed(2)}%
                </p>
              </div>
              {r.cap > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Mkt cap</p>
                  <p className="font-mono-nums text-lg font-semibold">${r.cap}B</p>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Shariah Screening</p>
              {r.screening.criteria.map((c) => (
                <CriterionRow key={c.key} c={c} />
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span>Screened: {r.screening.lastScreened}</span>
              <Link
                to="/shariah/$symbol"
                params={{ symbol: r.symbol }}
                className="rounded-full border border-border px-2.5 py-1 transition hover:text-foreground"
              >
                Open details
              </Link>
            </div>
          </GlassCard>
        ))}
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">No securities match those filters.</p>
        )}
      </div>

      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-fuchsia-500/5" glow="violet">
        <SectionTitle icon={<Info className="h-3.5 w-3.5" />}>What does “Shariah Compliant” mean?</SectionTitle>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-semibold">Business Activity Screening</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The company should not be primarily involved in prohibited business activities. Depending on the selected
              methodology these may include:
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {activeMethodology.exclusions.map((e) => (
                <Pill key={e} tone="bear">{e}</Pill>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Index providers such as MSCI apply business-activity screens covering areas including alcohol, tobacco,
              cannabis, pork-related products, conventional financial services, gambling and certain entertainment
              activities.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Financial Screening</p>
            <p className="mt-1 text-xs text-muted-foreground">Relevant financial ratios are also evaluated:</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>• Interest-bearing debt</li>
              <li>• Cash and interest-bearing securities</li>
              <li>• Accounts receivable and cash</li>
              <li>• Income from non-compliant activities / interest</li>
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Thresholds come from the selected screening methodology and are never invented by Uptrend. Providers such
              as MSCI publish their own financial-ratio screens and specific thresholds; those values are configured, not
              assumed.
            </p>
          </div>
        </div>
      </GlassCard>

      <ShariahDisclaimer text={SHARIAH_DISCLAIMER} />
    </div>
  );
}
