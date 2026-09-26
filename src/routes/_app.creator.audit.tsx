import { createFileRoute } from "@tanstack/react-router";
import { useCreatorDirectory } from "@/lib/useCreatorDirectory";
import { EmptyState, GlassCard, PageHeader, Pill, SectionTitle, ChartTooltip } from "@/components/ui-kit";
import { fmt } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/audit")({
  head: () => ({
    meta: [
      { title: "Audit Logs — Uptrend Admin" },
      { name: "description", content: "Every administrative action, who performed it and when." },
      { property: "og:title", content: "Audit Logs — Uptrend Admin" },
      { property: "og:description", content: "Every administrative action, who performed it and when." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorAudit,
});

function CreatorAudit() {
  const q = useCreatorDirectory();
  if (q.isLoading) return <EmptyState title="Loading real data…" />;
  if (q.error || !q.data) return <EmptyState title="Could not load data" hint={q.error ? String((q.error as Error).message) : undefined} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" subtitle="Real account events recorded in the database." accent="from-violet-400 via-sky-400 to-emerald-400" />
      <GlassCard>
        {d.events.length === 0 ? <EmptyState title="No events yet" /> : (
        <ul className="divide-y divide-border/40 text-sm">{d.events.map((e, i) => (
          <li key={i} className="flex items-center justify-between gap-3 py-2">
            <span><Pill tone="info">{e.kind}</Pill> <span className="ml-2">{e.detail}</span></span>
            <span className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString()}</span>
          </li>))}</ul>)}
      </GlassCard>
    </div>
  );
}
