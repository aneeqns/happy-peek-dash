import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { GlassCard } from "@/components/ui-kit";
import { unlockCreator } from "@/lib/creator-access.functions";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/creator-access")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Creator access — Uptrend" },
      { name: "description", content: "Enter your private Uptrend creator code to open the owner workspace." },
      { property: "og:title", content: "Creator access — Uptrend" },
      { property: "og:description", content: "Private owner workspace, unlocked with your creator code." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorAccess,
});

function CreatorAccess() {
  const navigate = useNavigate();
  const unlock = useServerFn(unlockCreator);
  const { grantCreator } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await unlock({ data: { code } });
      if (!res.granted) {
        setError(res.error ?? "That code is not correct.");
        return;
      }
      grantCreator();
      navigate({ to: "/creator", replace: true });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="w-full max-w-md" glow="violet">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-violet-400" />
          <h1 className="text-lg font-semibold">Creator access</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          The owner workspace is private. Enter your creator code to continue.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Creator code"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          {error && <p className="text-xs text-rose-300">{error}</p>}
          <button
            type="submit"
            disabled={busy || code.trim().length === 0}
            className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Checking…" : "Unlock creator workspace"}
          </button>
        </form>

        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="mt-4 w-full rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground"
        >
          Back to my dashboard
        </button>
      </GlassCard>
    </div>
  );
}
