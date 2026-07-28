import { createFileRoute } from "@tanstack/react-router";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { managedUsers } from "@/lib/admin-data";
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
  component: () => (
    <div className="space-y-6">
      <PageHeader title="User Management" subtitle="Accounts, plans and status across the platform." accent="from-violet-400 via-sky-400 to-emerald-400" />
      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-sky-500/5" glow="violet">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border/70 text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="py-2">User</th><th className="py-2">Plan</th><th className="py-2">Status</th>
                <th className="py-2 text-right">Portfolio</th><th className="py-2 text-right">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {managedUsers.map((u) => (
                <tr key={u.id} className="border-b border-border/40 last:border-0">
                  <td className="py-2"><span className="font-medium">{u.name}</span><span className="block text-[11px] text-muted-foreground">{u.email}</span></td>
                  <td className="py-2"><Pill tone="info">{u.plan}</Pill></td>
                  <td className="py-2"><Pill tone={u.status === "Active" ? "bull" : u.status === "Suspended" ? "bear" : "warn"}>{u.status}</Pill></td>
                  <td className="py-2 text-right font-mono-nums">${fmt(u.portfolio, 0)}</td>
                  <td className="py-2 text-right text-xs text-muted-foreground">{u.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  ),
});
