import { createServerFn } from "@tanstack/react-start";

export type CreatorStats = {
  totalUsers: number;
  usersWithBank: number;
  usersWithUsername: number;
  totalHoldings: number;
  investors: number;
  costBasis: number;
  signupsLast30Days: number;
  signupsLast7Days: number;
  topSymbols: { symbol: string; holders: number; quantity: number; cost: number }[];
  signupSeries: { date: string; signups: number; total: number }[];
  recentUsers: { email: string; username: string | null; createdAt: string; hasBank: boolean; holdings: number }[];
  health: { name: string; status: string; detail: string }[];
  at: number;
};

function dayKey(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

/** Real platform figures, readable only with a valid creator pass. */
export const getCreatorStats = createServerFn({ method: "GET" }).handler(async (): Promise<CreatorStats> => {
  const { hasCreatorPass } = await import("./creator-access.server");
  if (!(await hasCreatorPass())) throw new Error("Forbidden");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const now = Date.now();
  const since30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  const dbStart = Date.now();
  const [profiles, banks, holdings] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, email, username, created_at").order("created_at", { ascending: true }),
    supabaseAdmin.from("bank_accounts").select("user_id"),
    supabaseAdmin.from("holdings").select("user_id, symbol, quantity, avg_cost"),
  ]);
  const dbLatency = Date.now() - dbStart;

  const dbError = profiles.error ?? banks.error ?? holdings.error;
  const users = profiles.data ?? [];
  const bankUserIds = new Set((banks.data ?? []).map((b) => b.user_id));
  const rows = holdings.data ?? [];

  const costBasis = rows.reduce((s, r) => s + Number(r.quantity) * Number(r.avg_cost), 0);

  const bySymbol = new Map<string, { holders: Set<string>; quantity: number; cost: number }>();
  for (const r of rows) {
    const e = bySymbol.get(r.symbol) ?? { holders: new Set<string>(), quantity: 0, cost: 0 };
    e.holders.add(r.user_id);
    e.quantity += Number(r.quantity);
    e.cost += Number(r.quantity) * Number(r.avg_cost);
    bySymbol.set(r.symbol, e);
  }

  const holdingsByUser = new Map<string, number>();
  for (const r of rows) holdingsByUser.set(r.user_id, (holdingsByUser.get(r.user_id) ?? 0) + 1);

  // Daily sign-ups over the last 14 days, plus the running user total.
  const perDay = new Map<string, number>();
  for (const u of users) perDay.set(dayKey(u.created_at), (perDay.get(dayKey(u.created_at)) ?? 0) + 1);
  const signupSeries: { date: string; signups: number; total: number }[] = [];
  let running = users.filter((u) => new Date(u.created_at).getTime() < now - 14 * 24 * 60 * 60 * 1000).length;
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const signups = perDay.get(key) ?? 0;
    running += signups;
    signupSeries.push({ date: key.slice(5), signups, total: running });
  }

  // Live feed check against the real market-data provider.
  let feedStatus = "Operational";
  let feedDetail = "Yahoo Finance quotes";
  const feedStart = Date.now();
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v7/finance/quote?symbols=AAPL", {
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    feedDetail = `HTTP ${res.status} · ${Date.now() - feedStart} ms`;
    if (!res.ok) feedStatus = "Degraded";
  } catch {
    feedStatus = "Down";
    feedDetail = "Provider unreachable";
  }

  return {
    totalUsers: users.length,
    usersWithBank: bankUserIds.size,
    usersWithUsername: users.filter((u) => Boolean(u.username)).length,
    totalHoldings: rows.length,
    investors: holdingsByUser.size,
    costBasis,
    signupsLast30Days: users.filter((u) => u.created_at >= since30).length,
    signupsLast7Days: users.filter((u) => u.created_at >= since7).length,
    topSymbols: [...bySymbol.entries()]
      .map(([symbol, e]) => ({ symbol, holders: e.holders.size, quantity: e.quantity, cost: e.cost }))
      .sort((a, b) => b.holders - a.holders || b.cost - a.cost)
      .slice(0, 8),
    signupSeries,
    recentUsers: [...users]
      .reverse()
      .slice(0, 8)
      .map((u) => ({
        email: u.email ?? "—",
        username: u.username,
        createdAt: u.created_at,
        hasBank: bankUserIds.has(u.id),
        holdings: holdingsByUser.get(u.id) ?? 0,
      })),
    health: [
      {
        name: "Database (Lovable Cloud)",
        status: dbError ? "Degraded" : "Operational",
        detail: dbError ? dbError.message : `${dbLatency} ms round trip`,
      },
      { name: "Market data feed", status: feedStatus, detail: feedDetail },
      {
        name: "AI assistant",
        status: process.env["LOVABLE_API_KEY"] ? "Operational" : "Down",
        detail: process.env["LOVABLE_API_KEY"] ? "Key configured" : "No API key",
      },
      {
        name: "Creator access lock",
        status: process.env["CREATOR_ACCESS_CODE"] ? "Operational" : "Degraded",
        detail: process.env["CREATOR_ACCESS_CODE"] ? "Access code set" : "Access code missing",
      },
    ],
    at: Date.now(),
  };
});
