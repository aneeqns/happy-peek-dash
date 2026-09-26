import { createFileRoute } from "@tanstack/react-router";
import { useCreatorDirectory } from "@/lib/useCreatorDirectory";
import { EmptyState, GlassCard, PageHeader, Pill, SectionTitle, ChartTooltip } from "@/components/ui-kit";
import { fmt } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/revenue")({
  head: () => ({
    meta: [
      { title: "Revenue — Uptrend Admin" },
      { name: "description", content: "Subscription mix, MRR by plan and monetization health." },
      { property: "og:title", content: "Revenue — Uptrend Admin" },
      { property: "og:description", content: "Subscription mix, MRR by plan and monetization health." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorRevenue,
});

function CreatorRevenue() {
  const q = useCreatorDirectory();
  if (q.isLoading) return <EmptyState title="Loading real data…" />;
  if (q.error || !q.data) return <EmptyState title="Could not load data" hint={q.error ? String((q.error as Error).message) : undefined} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Revenue" subtitle="Real payments received through Uptrend." accent="from-violet-400 via-sky-400 to-emerald-400" />
      <GlassCard className="bg-gradient-to-br from-emerald-500/15 to-lime-500/5">
        <SectionTitle>Revenue to date</SectionTitle>
        <p className="font-mono-nums text-3xl">$0.00</p>
        <p className="mt-2 text-sm text-muted-foreground">No payment system is connected yet, so Uptrend has not received any payments. {d.users.length} registered account(s), 0 paying subscribers.</p>
      </GlassCard>
    </div>
  );
}
