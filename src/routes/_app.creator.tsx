import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { creatorAccessStatus } from "@/lib/creator-access.functions";
import { readAuthSnapshot } from "@/lib/auth";

export const Route = createFileRoute("/_app/creator")({
  // The owner workspace is private: entry requires the creator code, verified
  // server-side through an HttpOnly signed cookie (local storage can't fake it).
  beforeLoad: async () => {
    const session = readAuthSnapshot();
    if (!session || session.mode !== 'real') throw redirect({ to: "/auth" });
    let granted = false;
    try { granted = (await creatorAccessStatus()).granted; }
    catch { throw redirect({ to: '/forbidden' }); }
    if (!granted) throw redirect({ to: "/creator-access" });
  },
  component: () => <Outlet />,
});
