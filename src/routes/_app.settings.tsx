import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { GlassCard, PageHeader } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Uptrend" },
      { name: "description", content: "Uptrend settings: switch between light and dark themes, review your session and sign out." },
      { property: "og:title", content: "Settings — Uptrend" },
      { property: "og:description", content: "Theme, session and account preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const { user, role, signOut } = useAuth();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Preferences for this workspace." accent="from-violet-400 via-sky-400 to-emerald-400" />
      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-sky-500/5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Appearance</p>
            <p className="text-xs text-muted-foreground">Currently using the {theme} theme.</p>
          </div>
          <button onClick={toggle} className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </GlassCard>
      <GlassCard>
        <p className="text-sm font-semibold">Session</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Signed in as {user?.email} · account role: {role}. Demo session stored locally — swap in real auth later without
          changing the app structure.
        </p>
        <button onClick={signOut} className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          Sign out
        </button>
      </GlassCard>
    </div>
  );
}
