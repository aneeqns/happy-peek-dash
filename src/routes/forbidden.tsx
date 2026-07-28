import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { GlassCard } from "@/components/ui-kit";

export const Route = createFileRoute("/forbidden")({
  head: () => ({
    meta: [
      { title: "Access restricted — Uptrend" },
      { name: "description", content: "This Uptrend area is limited to Creator (admin) accounts." },
      { property: "og:title", content: "Access restricted — Uptrend" },
      { property: "og:description", content: "This Uptrend area is limited to Creator (admin) accounts." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Forbidden,
});

function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="max-w-md text-center" glow="rose">
        <ShieldAlert className="mx-auto h-10 w-10 text-rose-400" />
        <h1 className="mt-4 text-xl font-semibold">Creator access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have permission to open admin tools. Switch back to the customer workspace or sign in
          with a Creator account.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link to="/dashboard" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Go to dashboard
          </Link>
          <Link to="/auth" className="rounded-xl border border-border px-4 py-2 text-sm">
            Switch account
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
