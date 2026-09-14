import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { accountSetupState } from "@/lib/account";
import { readAuthSnapshot, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  // Sessions live in the browser, so this gateway must run client-side only.
  ssr: false,
  head: () => ({
    meta: [
      { title: "Uptrend — Sign in or try the demo" },
      {
        name: "description",
        content:
          "Sign in to Uptrend with a real account, or explore the full market dashboard instantly with a demo workspace.",
      },
      { property: "og:title", content: "Uptrend — Sign in or try the demo" },
      { property: "og:description", content: "Real account or instant demo — pick how you want to explore Uptrend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gateway,
});

function Gateway() {
  const navigate = useNavigate();
  const { startRealSession } = useAuth();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        startRealSession();
        const setup = await accountSetupState();
        if (cancelled) return;
        const needsSetup = !setup || setup.needsUsername || setup.needsBank;
        navigate({ to: needsSetup ? "/finish-setup" : "/dashboard", replace: true });
        return;
      }

      const snap = readAuthSnapshot();
      if (snap?.mode === "demo") {
        navigate({ to: snap.effectiveRole === "creator" ? "/creator" : "/dashboard", replace: true });
        return;
      }

      navigate({ to: "/auth", replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, startRealSession]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <img
          src={uptrendLogo.url}
          alt="Uptrend logo"
          width={64}
          height={64}
          className="h-16 w-16 animate-pulse object-contain"
        />
        <p className="text-sm text-muted-foreground">Loading Uptrend…</p>
      </div>
    </div>
  );
}
