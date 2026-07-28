import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { systemHealth } from "@/lib/admin-data";

export const Route = createFileRoute("/_app/creator/settings")({
  head: () => ({
    meta: [
      { title: "Admin Settings — Uptrend Admin" },
      { name: "description", content: "Platform configuration, feature flags and service status." },
      { property: "og:title", content: "Admin Settings — Uptrend Admin" },
      { property: "og:description", content: "Platform configuration, feature flags and service status." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Admin Settings" subtitle="Platform configuration, feature flags and service status." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {systemHealth.map((s) => (
          <GlassCard key={s.name} className="bg-gradient-to-br from-teal-500/15 to-cyan-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{s.name}</p>
              <Pill tone={s.status === "Operational" ? "bull" : "bear"}>{s.status}</Pill>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Latency {s.latency} · Uptime {s.uptime}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
