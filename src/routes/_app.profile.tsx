import { createFileRoute } from "@tanstack/react-router";
import { PremiumUpgrade } from "@/components/PremiumUpgrade";
import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Uptrend" },
      { name: "description", content: "Your Uptrend profile: account details, plan, role and upgrade options." },
      { property: "og:title", content: "Profile — Uptrend" },
      { property: "og:description", content: "Account details, plan, role and upgrade options." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, effectiveRole } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Account details and plan." accent="from-emerald-400 via-sky-400 to-violet-400" />
      <GlassCard className="bg-gradient-to-br from-emerald-500/15 to-sky-500/5" glow="emerald">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 text-lg font-bold text-emerald-950">
            {user?.avatarInitials}
          </span>
          <div>
            <p className="text-lg font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2 flex gap-1.5">
              <Pill tone={effectiveRole === "creator" ? "info" : "bull"}>{effectiveRole === "creator" ? "Creator" : "Customer"}</Pill>
              <Pill>{user?.plan} plan</Pill>
              <Pill>Joined {user?.joined}</Pill>
            </div>
          </div>
        </div>
      </GlassCard>
      <PremiumUpgrade />
    </div>
  );
}
