import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { announcements } from "@/lib/admin-data";

export const Route = createFileRoute("/_app/creator/announcements")({
  head: () => ({
    meta: [
      { title: "Announcements — Uptrend Admin" },
      { name: "description", content: "Broadcast product news and maintenance windows to segments." },
      { property: "og:title", content: "Announcements — Uptrend Admin" },
      { property: "og:description", content: "Broadcast product news and maintenance windows to segments." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="Announcements" subtitle="Broadcast product news and maintenance windows to segments." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {announcements.map((a) => (
          <GlassCard key={a.id} className="bg-gradient-to-br from-amber-500/15 to-rose-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{a.title}</p>
              <Pill tone={a.status === "Sent" ? "bull" : "warn"}>{a.status}</Pill>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{a.audience} · {a.sent}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
