import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { creatorAccessStatus } from "@/lib/creator-access.functions";
import { readAuthSnapshot } from "@/lib/auth";

export const Route = createFileRoute("/_app/creator")({
  // The owner workspace is private: entry requires the creator code, verified
  // server-side through an HttpOnly signed cookie (local storage can't fake it).
  beforeLoad: async () => {
    const session = readAuthSnapshot();
    if (!session) throw redirect({ to: "/auth" });
    const { granted } = await creatorAccessStatus();
    if (!granted) throw redirect({ to: "/creator-access" });
  },
  component: () => <Outlet />,
});
