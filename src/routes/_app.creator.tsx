import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readAuthSnapshot } from "@/lib/auth";

export const Route = createFileRoute("/_app/creator")({
  // RBAC gate: only a creator account, actively in creator view, may enter.
  beforeLoad: () => {
    const session = readAuthSnapshot();
    if (!session) throw redirect({ to: "/auth" });
    if (session.role !== "creator" || session.effectiveRole !== "creator") {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: () => <Outlet />,
});
