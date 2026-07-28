import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShieldCheck, User } from "lucide-react";
import { useEffect } from "react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import { GlassCard } from "@/components/ui-kit";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Uptrend" },
      { name: "description", content: "Sign in to Uptrend to track markets, portfolios and AI insights. Choose a demo Customer or Creator workspace." },
      { property: "og:title", content: "Sign in — Uptrend" },
      { property: "og:description", content: "Choose a demo Customer or Creator workspace and explore the Uptrend platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { ready, role, signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && role) navigate({ to: role === "creator" ? "/creator" : "/dashboard", replace: true });
  }, [ready, role, navigate]);

  const enter = (r: Role) => {
    signIn(r);
    navigate({ to: r === "creator" ? "/creator" : "/dashboard", replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <img src={uptrendLogo.url} alt="Uptrend logo" width={48} height={48} className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Up<span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">trend</span>
            </h1>
            <p className="text-xs text-muted-foreground">Invest Smarter, Grow Faster</p>
          </div>
        </div>

        <GlassCard glow="emerald">
          <h2 className="text-lg font-semibold">Choose a demo workspace</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Demo sign-in — no password required. The architecture is auth-ready, so this screen can be swapped for
            real accounts later without touching the rest of the app.
          </p>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => enter("customer")}
              className="flex w-full items-center gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-lime-500/5 p-4 text-left transition hover:scale-[1.01] hover:border-emerald-400"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
                <User className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Continue as Customer</span>
                <span className="block text-xs text-muted-foreground">
                  Dashboard, markets, portfolio, watchlists, alerts and UpBot
                </span>
              </span>
            </button>

            <button
              onClick={() => enter("creator")}
              className="flex w-full items-center gap-4 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/5 p-4 text-left transition hover:scale-[1.01] hover:border-violet-400"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Continue as Creator (Admin)</span>
                <span className="block text-xs text-muted-foreground">
                  Everything above, plus platform admin tools and a role switcher
                </span>
              </span>
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
