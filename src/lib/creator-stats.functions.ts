import { createServerFn } from "@tanstack/react-start";
import { hasCreatorPass } from "./creator-access.functions";

export type CreatorStats = {
  totalUsers: number;
  usersWithBank: number;
  totalHoldings: number;
  investors: number;
  costBasis: number;
  signupsLast30Days: number;
  topSymbols: { symbol: string; holders: number }[];
  at: number;
};

/** Real platform figures, readable only with a valid creator pass. */
export const getCreatorStats = createServerFn({ method: "GET" }).handler(async (): Promise<CreatorStats> => {
  if (!(await hasCreatorPass())) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [profiles, banks, recent, holdings] = await Promise.all([
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("bank_accounts").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabaseAdmin.from("holdings").select("user_id, symbol, quantity, avg_cost"),
  ]);

  const rows = holdings.data ?? [];
  const costBasis = rows.reduce((s, r) => s + Number(r.quantity) * Number(r.avg_cost), 0);
  const holders = new Map<string, Set<string>>();
  for (const r of rows) {
    const set = holders.get(r.symbol) ?? new Set<string>();
    set.add(r.user_id);
    holders.set(r.symbol, set);
  }

  return {
    totalUsers: profiles.count ?? 0,
    usersWithBank: banks.count ?? 0,
    totalHoldings: rows.length,
    investors: new Set(rows.map((r) => r.user_id)).size,
    costBasis,
    signupsLast30Days: recent.count ?? 0,
    topSymbols: [...holders.entries()]
      .map(([symbol, set]) => ({ symbol, holders: set.size }))
      .sort((a, b) => b.holders - a.holders)
      .slice(0, 8),
    at: Date.now(),
  };
});
