import { createFileRoute } from "@tanstack/react-router";
import { useCreatorDirectory } from "@/lib/useCreatorDirectory";
import { EmptyState, GlassCard, PageHeader, Pill, SectionTitle, ChartTooltip } from "@/components/ui-kit";
import { fmt } from "@/lib/market-data";

export const Route = createFileRoute("/_app/creator/users")({
  head: () => ({
    meta: [
      { title: "User Management — Uptrend Admin" },
      { name: "description", content: "Manage Uptrend accounts: plans, status, portfolio size and last activity." },
      { property: "og:title", content: "User Management — Uptrend Admin" },
      { property: "og:description", content: "Manage accounts, plans and status." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorUsers,
});

function CreatorUsers() {
  const q = useCreatorDirectory();
  if (q.isLoading) return <EmptyState title="Loading real data…" />;
  if (q.error || !q.data) return <EmptyState title="Could not load data" hint={q.error ? String((q.error as Error).message) : undefined} />;
  const d = q.data;
  return (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Every real account registered on Uptrend." accent="from-violet-400 via-sky-400 to-emerald-400" />
      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-sky-500/5" glow="violet">
        {d.users.length === 0 ? <EmptyState title="No accounts yet" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-border/70 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="py-2">User</th><th className="py-2">Bank</th><th className="py-2 text-right">Holdings</th><th className="py-2 text-right">Invested</th><th className="py-2 text-right">Joined</th></tr></thead>
            <tbody>{d.users.map((u) => (
              <tr key={u.id} className="border-b border-border/40 last:border-0">
                <td className="py-2"><span className="font-medium">{u.username ?? u.fullName ?? "—"}</span><span className="block text-[11px] text-muted-foreground">{u.email}</span></td>
                <td className="py-2"><Pill tone={u.hasBank ? "bull" : "warn"}>{u.hasBank ? "On file" : "Missing"}</Pill></td>
                <td className="py-2 text-right font-mono-nums">{u.holdings}</td>
                <td className="py-2 text-right font-mono-nums">${fmt(u.invested, 2)}</td>
                <td className="py-2 text-right text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>))}</tbody>
          </table>
        </div>)}
      </GlassCard>
    </div>
  );
}
