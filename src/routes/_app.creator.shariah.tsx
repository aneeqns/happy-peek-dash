import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Moon } from "lucide-react";
import { GlassCard, Kpi, PageHeader, Pill, SectionTitle } from "@/components/ui-kit";
import { ShariahBadge, ShariahDisclaimer } from "@/components/shariah-ui";
import {
  activeMethodology,
  METHODOLOGIES,
  screen,
  screeningInputs,
  SHARIAH_DISCLAIMER,
  type ShariahStatus,
} from "@/lib/shariah";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/creator/shariah")({
  head: () => ({
    meta: [
      { title: "Shariah Screening Admin — Uptrend" },
      { name: "description", content: "Owner view for Shariah screening: methodology in use, coverage stats and per-symbol screening records." },
      { property: "og:title", content: "Shariah Screening Admin — Uptrend" },
      { property: "og:description", content: "Methodology, coverage and per-symbol Shariah screening records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatorShariahPage,
});

const pctText = (v: number | null) => (v === null ? "—" : `${(v * 100).toFixed(1)}%`);

function CreatorShariahPage() {
  const [methodologyId, setMethodologyId] = useState(activeMethodology.id);

  const rows = useMemo(
    () => screeningInputs.map((input) => ({ input, result: screen(input.symbol) })),
    [],
  );

  const counts = rows.reduce<Record<ShariahStatus, number>>(
    (acc, r) => {
      const s = r.result?.status ?? "unavailable";
      acc[s] += 1;
      return acc;
    },
    { compliant: 0, non_compliant: 0, unavailable: 0 },
  );
  const coverage = Math.round(((counts.compliant + counts.non_compliant) / rows.length) * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shariah screening"
        subtitle="Methodology, coverage and per-symbol screening records used across the customer experience."
        accent="from-emerald-400 via-teal-400 to-sky-400"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Symbols tracked" value={String(rows.length)} tint="sky" />
        <Kpi label="Compliant" value={String(counts.compliant)} tint="emerald" />
        <Kpi label="Not compliant" value={String(counts.non_compliant)} tint="rose" />
        <Kpi label="Screening coverage" value={`${coverage}%`} delta={`${counts.unavailable} unavailable`} tint="amber" />
      </div>

      <GlassCard className="bg-gradient-to-br from-emerald-500/15 to-teal-500/5" glow="emerald">
        <SectionTitle icon={<Moon className="h-4 w-4" />}>Methodology</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {METHODOLOGIES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethodologyId(m.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition",
                methodologyId === m.id
                  ? "border-primary/60 bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {m.name}
            </button>
          ))}
        </div>
        {METHODOLOGIES.filter((m) => m.id === methodologyId).map((m) => (
          <div key={m.id} className="mt-4 space-y-3">
            <dl className="grid gap-3 text-xs sm:grid-cols-3">
              <div>
                <dt className="text-muted-foreground">Debt limit</dt>
                <dd className="mt-0.5 font-medium">{pctText(m.thresholds.debt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Liquid assets limit</dt>
                <dd className="mt-0.5 font-medium">{pctText(m.thresholds.liquidAssets)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Non-permissible income limit</dt>
                <dd className="mt-0.5 font-medium">{pctText(m.thresholds.nonPermissibleIncome)}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-1.5">
              {m.exclusions.map((e) => (
                <Pill key={e}>{e}</Pill>
              ))}
            </div>
            {m.id !== activeMethodology.id && (
              <p className="text-[11px] text-amber-300">
                Preview only — {activeMethodology.name} is the methodology currently applied to customer screening results.
              </p>
            )}
          </div>
        ))}
      </GlassCard>

      <GlassCard className="bg-gradient-to-br from-sky-500/15 to-indigo-500/5" glow="sky">
        <SectionTitle>Screening records</SectionTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2">Symbol</th>
                <th className="py-2">Status</th>
                <th className="py-2 text-right">Debt</th>
                <th className="py-2 text-right">Liquid</th>
                <th className="py-2 text-right">Non-perm. income</th>
                <th className="py-2">Flagged activities</th>
                <th className="py-2">Last screened</th>
                <th className="py-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ input, result }) => (
                <tr key={input.symbol} className="border-b border-border/40 last:border-0 hover:bg-surface-elevated/60">
                  <td className="py-2 font-mono-nums font-semibold">{input.symbol}</td>
                  <td className="py-2">
                    <ShariahBadge status={result?.status ?? "unavailable"} />
                  </td>
                  <td className="py-2 text-right font-mono-nums">{pctText(input.debtRatio)}</td>
                  <td className="py-2 text-right font-mono-nums">{pctText(input.liquidRatio)}</td>
                  <td className="py-2 text-right font-mono-nums">{pctText(input.nonPermissibleIncome)}</td>
                  <td className="py-2 text-xs text-muted-foreground">
                    {input.flaggedActivities === null
                      ? "Not available"
                      : input.flaggedActivities.length === 0
                        ? "None"
                        : input.flaggedActivities.join(", ")}
                  </td>
                  <td className="py-2 text-xs text-muted-foreground">{input.lastScreened}</td>
                  <td className="py-2 text-xs text-muted-foreground">{input.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Symbols with missing inputs always resolve to “Screening Unavailable” — statuses are never inferred or assigned at random.
        </p>
      </GlassCard>

      <ShariahDisclaimer text={SHARIAH_DISCLAIMER} />
    </div>
  );
}
