import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { readAuthSnapshot } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  // Demo auth lives in local storage, so the gate must run client-side only.
  ssr: false,
  beforeLoad: ({ location }) => {
    const session = readAuthSnapshot();
    if (!session) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { session };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
