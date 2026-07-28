import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { moderationQueue } from "@/lib/admin-data";

export const Route = createFileRoute("/_app/creator/ai")({
  head: () => ({
    meta: [
      { title: "AI Management — Uptrend Admin" },
      { name: "description", content: "Moderation queue and UpBot recommendation oversight." },
      { property: "og:title", content: "AI Management — Uptrend Admin" },
      { property: "og:description", content: "Moderation queue and UpBot recommendation oversight." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="space-y-6">
      <PageHeader title="AI Management" subtitle="Moderation queue and UpBot recommendation oversight." accent="from-fuchsia-400 via-violet-400 to-sky-400" />
      <div className="grid gap-3 lg:grid-cols-2">
        {moderationQueue.map((m) => (
          <GlassCard key={m.id} className="bg-gradient-to-br from-rose-500/15 to-fuchsia-500/5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{m.user}</p>
              <Pill tone="bear">{m.flag}</Pill>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">“{m.excerpt}”</p>
            <p className="mt-1 text-[10px] text-muted-foreground">{m.at}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  ),
});
