import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { auditLog } from "@/lib/admin-data";

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
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Audit Logs" subtitle="Every administrative action, who performed it and when." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {auditLog.map((l) => (
          <GlassCard key={l.id} className="bg-gradient-to-br from-sky-500/15 to-indigo-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm">{l.action}</p>
              <Pill tone={l.severity === "critical" ? "bear" : l.severity === "warn" ? "warn" : "info"}>{l.severity}</Pill>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{l.actor} · {l.target} · {l.at}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
