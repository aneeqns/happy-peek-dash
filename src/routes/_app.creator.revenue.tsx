import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { subscriptions } from "@/lib/admin-data";
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
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Revenue" subtitle="Subscription mix, MRR by plan and monetization health." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {subscriptions.map((s) => (
          <GlassCard key={s.plan} className="bg-gradient-to-br from-emerald-500/15 to-lime-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{s.plan}</p>
              <Pill tone="bull">{s.share}% of users</Pill>
            </div>
            <p className="mt-2 font-mono-nums text-lg">${fmt(s.mrr, 0)}<span className="ml-1 text-xs text-muted-foreground">MRR</span></p>
            <p className="text-[11px] text-muted-foreground">{fmt(s.users, 0)} subscribers</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
