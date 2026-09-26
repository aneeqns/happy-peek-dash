import { createServerFn } from "@tanstack/react-start";

export type CreatorDirectory = {
  users: { id: string; email: string; username: string | null; fullName: string | null; createdAt: string; hasBank: boolean; holdings: number; invested: number }[];
  symbols: { symbol: string; holders: number; quantity: number; cost: number }[];
  weekday: { day: string; signups: number; holdingsAdded: number }[];
  events: { at: string; kind: string; detail: string }[];
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Real user directory and activity, readable only with a valid creator pass. */
export const getCreatorDirectory = createServerFn({ method: "GET" }).handler(async (): Promise<CreatorDirectory> => {
  const { hasCreatorPass } = await import("./creator-access.server");
  if (!(await hasCreatorPass())) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const [p, b, h] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, email, username, full_name, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("bank_accounts").select("user_id, created_at"),
    supabaseAdmin.from("holdings").select("user_id, symbol, quantity, avg_cost, created_at"),
  ]);
  const err = p.error ?? b.error ?? h.error;
  if (err) throw new Error(err.message);
  const profiles = p.data ?? [];
  const banks = b.data ?? [];
  const rows = h.data ?? [];
  const emailOf = new Map(profiles.map((u) => [u.id, u.email ?? u.username ?? "user"]));
  const bankIds = new Set(banks.map((x) => x.user_id));

  const perUser = new Map<string, { n: number; cost: number }>();
  const perSym = new Map<string, { holders: Set<string>; quantity: number; cost: number }>();
  for (const r of rows) {
    const c = Number(r.quantity) * Number(r.avg_cost);
    const u = perUser.get(r.user_id) ?? { n: 0, cost: 0 };
    u.n++; u.cost += c; perUser.set(r.user_id, u);
    const s = perSym.get(r.symbol) ?? { holders: new Set<string>(), quantity: 0, cost: 0 };
    s.holders.add(r.user_id); s.quantity += Number(r.quantity); s.cost += c; perSym.set(r.symbol, s);
  }

  const weekday = DAYS.map((day) => ({ day, signups: 0, holdingsAdded: 0 }));
  for (const u of profiles) weekday[new Date(u.created_at).getUTCDay()].signups++;
  for (const r of rows) weekday[new Date(r.created_at).getUTCDay()].holdingsAdded++;

  const events = [
    ...profiles.map((u) => ({ at: u.created_at, kind: "Sign-up", detail: u.email ?? "New account" })),
    ...banks.map((x) => ({ at: x.created_at, kind: "Bank details added", detail: emailOf.get(x.user_id) ?? "user" })),
    ...rows.map((r) => ({ at: r.created_at, kind: "Holding added", detail: `${emailOf.get(r.user_id) ?? "user"} · ${r.symbol}` })),
  ].sort((a, c) => c.at.localeCompare(a.at)).slice(0, 50);

  return {
    users: profiles.map((u) => ({
      id: u.id, email: u.email ?? "—", username: u.username, fullName: u.full_name, createdAt: u.created_at,
      hasBank: bankIds.has(u.id), holdings: perUser.get(u.id)?.n ?? 0, invested: perUser.get(u.id)?.cost ?? 0,
    })),
    symbols: [...perSym.entries()].map(([symbol, s]) => ({ symbol, holders: s.holders.size, quantity: s.quantity, cost: s.cost }))
      .sort((a, c) => c.holders - a.holders || c.cost - a.cost),
    weekday,
    events,
  };
});
