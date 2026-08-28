import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { GlassCard, Kpi, PageHeader, Pill, SectionTitle } from "@/components/ui-kit";
import { CriterionRow, ShariahBadge, ShariahDisclaimer } from "@/components/shariah-ui";
import { fmt, marketUniverse } from "@/lib/market-data";
import {
  exchangeOf,
  marketCapsB,
  screen,
  sectorOf,
  SHARIAH_DISCLAIMER,
  STATUS_META,
} from "@/lib/shariah";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/shariah/$symbol")({
  head: ({ params }) => {
    const sym = params.symbol?.toUpperCase() ?? "Stock";
    const title = `${sym} Shariah Screening — Uptrend`;
    const description = `See how ${sym} scores on each Shariah screening criterion — business activity, impermissible income, debt ratio and liquid assets — with the reasoning behind every result.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ShariahDetailPage,
});

function ShariahDetailPage() {
  const { symbol } = Route.useParams();
  const sym = symbol.toUpperCase();
  const market = marketUniverse.find((m) => m.symbol === sym);
  const result = screen(sym);
  const meta = STATUS_META[result?.status ?? "unavailable"];
  const cap = marketCapsB[sym];

  return (
    <div className="space-y-6">
      <Link
        to="/shariah"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Shariah Compliant
      </Link>

      <PageHeader
        title={`${sym} — Shariah screening`}
        subtitle={market?.name ?? "Security not found in the current market universe."}
        accent="from-emerald-400 via-teal-400 to-sky-400"
        actions={<ShariahBadge status={result?.status ?? "unavailable"} />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Status" value={meta.label} tint={result?.status === "compliant" ? "emerald" : result?.status === "non_compliant" ? "rose" : "amber"} />
        <Kpi label="Price" value={market ? `$${fmt(market.price)}` : "—"} delta={market ? `${market.pct >= 0 ? "+" : ""}${market.pct.toFixed(2)}%` : undefined} tint="sky" />
        <Kpi label="Market cap" value={cap ? `$${cap}B` : "—"} tint="violet" />
        <Kpi label="Last screened" value={result?.lastScreened ?? "—"} tint="amber" />
      </div>

      <GlassCard className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5" glow="emerald">
        <SectionTitle icon={<BookOpen className="h-4 w-4" />}>Screening criteria</SectionTitle>
        {result ? (
          <div className="space-y-2">
            {result.criteria.map((c) => (
              <CriterionRow key={c.key} c={c} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No screening record exists for this symbol yet, so its status stays “Screening Unavailable”.
          </p>
        )}
        <p className={cn("mt-3 text-[11px] text-muted-foreground")}>{meta.blurb}</p>
      </GlassCard>

      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-indigo-500/5" glow="sky">
        <SectionTitle>Reference data</SectionTitle>
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Market / exchange</dt>
            <dd className="mt-0.5 font-medium">{exchangeOf[sym] ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Industry</dt>
            <dd className="mt-0.5 font-medium">{sectorOf[sym] ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Methodology</dt>
            <dd className="mt-0.5 font-medium">{result?.methodology.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Data source</dt>
            <dd className="mt-0.5 font-medium">{result?.source ?? "—"}</dd>
          </div>
        </dl>
        {result && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {result.methodology.exclusions.map((e) => (
              <Pill key={e}>{e}</Pill>
            ))}
          </div>
        )}
      </GlassCard>

      <ShariahDisclaimer text={SHARIAH_DISCLAIMER} />
    </div>
  );
}
