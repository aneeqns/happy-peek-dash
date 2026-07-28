// Mock platform/admin data used only by Creator (admin) surfaces.

export const platformKpis = {
  totalUsers: 48_213,
  activeUsers: 12_804,
  mrr: 184_900,
  arr: 2_218_800,
  churn: 2.1,
  aum: 412_800_000,
  portfolios: 38_412,
  avgSession: "8m 12s",
};

export const growthSeries = Array.from({ length: 24 }, (_, i) => ({
  month: `M${i + 1}`,
  users: Math.round(9_000 + i * 1_680 + Math.sin(i / 2) * 900),
  revenue: Math.round(38_000 + i * 6_400 + Math.cos(i / 3) * 4_200),
}));

export const engagementSeries = [
  { day: "Mon", sessions: 18_400, trades: 2_140 },
  { day: "Tue", sessions: 21_900, trades: 2_680 },
  { day: "Wed", sessions: 20_100, trades: 2_410 },
  { day: "Thu", sessions: 23_800, trades: 3_120 },
  { day: "Fri", sessions: 26_200, trades: 3_640 },
  { day: "Sat", sessions: 11_300, trades: 720 },
  { day: "Sun", sessions: 9_800, trades: 540 },
];

export type ManagedUser = {
  id: string;
  name: string;
  email: string;
  plan: "Free" | "Pro" | "Edge";
  status: "Active" | "Suspended" | "Invited";
  portfolio: number;
  lastSeen: string;
};

export const managedUsers: ManagedUser[] = [
  { id: "usr_8842", name: "Alex Morgan", email: "alex@uptrend.app", plan: "Pro", status: "Active", portfolio: 184_320, lastSeen: "2m ago" },
  { id: "usr_7731", name: "Priya Nair", email: "priya@example.com", plan: "Edge", status: "Active", portfolio: 642_100, lastSeen: "14m ago" },
  { id: "usr_6620", name: "Daniel Cho", email: "dan@example.com", plan: "Free", status: "Active", portfolio: 8_420, lastSeen: "1h ago" },
  { id: "usr_5518", name: "Maria Silva", email: "maria@example.com", plan: "Pro", status: "Suspended", portfolio: 96_540, lastSeen: "3d ago" },
  { id: "usr_4407", name: "Tom Becker", email: "tom@example.com", plan: "Free", status: "Invited", portfolio: 0, lastSeen: "—" },
  { id: "usr_3399", name: "Aisha Khan", email: "aisha@example.com", plan: "Edge", status: "Active", portfolio: 1_204_880, lastSeen: "22m ago" },
  { id: "usr_2288", name: "Liam O'Neill", email: "liam@example.com", plan: "Pro", status: "Active", portfolio: 54_120, lastSeen: "5h ago" },
];

export type ContentItem = {
  id: string;
  title: string;
  type: "News" | "Banner" | "Featured" | "Insight";
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  updated: string;
};

export const contentItems: ContentItem[] = [
  { id: "cnt_101", title: "Fed signals patient path on rates", type: "News", status: "Published", author: "Creator", updated: "12m ago" },
  { id: "cnt_102", title: "AI infrastructure: the next leg", type: "Insight", status: "Draft", author: "Creator", updated: "1h ago" },
  { id: "cnt_103", title: "Summer Pro upgrade banner", type: "Banner", status: "Scheduled", author: "Creator", updated: "3h ago" },
  { id: "cnt_104", title: "Featured: NVDA, AVGO, LLY", type: "Featured", status: "Published", author: "Creator", updated: "yesterday" },
  { id: "cnt_105", title: "Oil slips below $72", type: "News", status: "Published", author: "Creator", updated: "yesterday" },
];

export type ManagedStock = {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  listed: boolean;
  featured: boolean;
};

export const managedStocks: ManagedStock[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", exchange: "NASDAQ", sector: "Semis", listed: true, featured: true },
  { symbol: "AAPL", name: "Apple Inc", exchange: "NASDAQ", sector: "Hardware", listed: true, featured: false },
  { symbol: "MSFT", name: "Microsoft", exchange: "NASDAQ", sector: "Software", listed: true, featured: true },
  { symbol: "XOM", name: "Exxon Mobil", exchange: "NYSE", sector: "Energy", listed: true, featured: false },
  { symbol: "LLY", name: "Eli Lilly", exchange: "NYSE", sector: "Pharma", listed: true, featured: true },
  { symbol: "RIVN", name: "Rivian Automotive", exchange: "NASDAQ", sector: "Autos", listed: false, featured: false },
];

export const auditLog = [
  { id: "log_9001", actor: "creator@uptrend.app", action: "Published news “Fed signals patient path”", target: "cnt_101", at: "13:42 UTC", severity: "info" },
  { id: "log_9002", actor: "creator@uptrend.app", action: "Suspended user", target: "usr_5518", at: "12:18 UTC", severity: "warn" },
  { id: "log_9003", actor: "system", action: "AI recommendation batch refreshed", target: "reco_batch_88", at: "11:05 UTC", severity: "info" },
  { id: "log_9004", actor: "creator@uptrend.app", action: "Delisted symbol RIVN", target: "RIVN", at: "09:51 UTC", severity: "warn" },
  { id: "log_9005", actor: "creator@uptrend.app", action: "Updated subscription pricing (Pro)", target: "plan_pro", at: "08:30 UTC", severity: "critical" },
];

export const systemHealth = [
  { name: "Market data feed", status: "Operational", latency: "42ms", uptime: "99.99%" },
  { name: "Upbot AI gateway", status: "Operational", latency: "310ms", uptime: "99.94%" },
  { name: "Trading engine (demo)", status: "Degraded", latency: "820ms", uptime: "99.71%" },
  { name: "News ingestion", status: "Operational", latency: "128ms", uptime: "99.97%" },
  { name: "Auth service", status: "Operational", latency: "64ms", uptime: "100%" },
];

export const subscriptions = [
  { plan: "Free", users: 31_420, mrr: 0, share: 65 },
  { plan: "Pro", users: 13_880, mrr: 138_800, share: 29 },
  { plan: "Edge", users: 2_913, mrr: 46_100, share: 6 },
];

export const moderationQueue = [
  { id: "mod_31", user: "Daniel Cho", excerpt: "Guaranteed 40% returns, DM me for the signal group…", flag: "Spam / promotion", at: "8m ago" },
  { id: "mod_32", user: "Liam O'Neill", excerpt: "This ticker is a scam and so is anyone who buys it", flag: "Harassment", at: "42m ago" },
  { id: "mod_33", user: "Maria Silva", excerpt: "Insider tip: earnings leak from a friend at the company", flag: "Regulatory risk", at: "2h ago" },
];

export const announcements = [
  { id: "ann_5", title: "Scheduled maintenance Sunday 02:00 UTC", audience: "All users", status: "Scheduled", sent: "—" },
  { id: "ann_4", title: "Upbot now draws charts in chat", audience: "Pro + Edge", status: "Sent", sent: "2d ago" },
  { id: "ann_3", title: "New goal-based investing module", audience: "All users", status: "Sent", sent: "1w ago" },
];
