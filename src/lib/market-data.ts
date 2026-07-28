// Shared mock market data for the Uptrend app.
// Deterministic (seeded) so SSR and client renders match.

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(1337);

export const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export const fmtCompact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 1 });

export const portfolio = {
  value: 184_320.42,
  change: 2_431.18,
  changePct: 1.34,
  cash: 12_480.9,
  buyingPower: 24_961.8,
  winRate: 68.4,
};

export const chartData = Array.from({ length: 60 }, (_, i) => {
  const base = 170_000 + Math.sin(i / 4) * 3000 + i * 220;
  const noise = Math.cos(i / 2.3) * 1500 + (rand() - 0.5) * 800;
  return { t: i, v: Math.round(base + noise) };
});

export const sectorData = [
  { name: "Tech", pct: 3.2 },
  { name: "Energy", pct: -1.4 },
  { name: "Finance", pct: 0.8 },
  { name: "Health", pct: 1.9 },
  { name: "Consumer", pct: -0.6 },
  { name: "Crypto", pct: 4.6 },
];

export type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  spark: number[];
};

function spark() {
  let v = 100;
  return Array.from({ length: 24 }, () => (v += (rand() - 0.45) * 4));
}

export const initialWatchlist: Ticker[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", price: 1284.32, change: 22.14, changePct: 1.75, spark: spark() },
  { symbol: "AAPL", name: "Apple Inc", price: 232.11, change: -1.42, changePct: -0.61, spark: spark() },
  { symbol: "TSLA", name: "Tesla Inc", price: 268.94, change: 8.21, changePct: 3.15, spark: spark() },
  { symbol: "MSFT", name: "Microsoft", price: 442.5, change: 3.02, changePct: 0.69, spark: spark() },
  { symbol: "AMZN", name: "Amazon", price: 198.77, change: -2.11, changePct: -1.05, spark: spark() },
  { symbol: "GOOGL", name: "Alphabet", price: 178.24, change: 1.88, changePct: 1.07, spark: spark() },
  { symbol: "META", name: "Meta Platforms", price: 512.9, change: 6.44, changePct: 1.27, spark: spark() },
  { symbol: "BTC", name: "Bitcoin", price: 68_412, change: 1834, changePct: 2.75, spark: spark() },
];

export const indices = [
  { name: "S&P 500", value: 5_812.44, pct: 0.62 },
  { name: "NASDAQ", value: 18_942.11, pct: 1.14 },
  { name: "DOW", value: 42_180.9, pct: -0.21 },
  { name: "VIX", value: 14.82, pct: -3.4 },
];

export type MarketKind = "Stock" | "ETF" | "Index" | "Crypto" | "FX" | "Commodity";
export type MarketItem = {
  symbol: string;
  name: string;
  kind: MarketKind;
  region: string;
  price: number;
  pct: number;
};

export const marketUniverse: MarketItem[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", kind: "Stock", region: "US", price: 1284.32, pct: 1.75 },
  { symbol: "AAPL", name: "Apple Inc", kind: "Stock", region: "US", price: 232.11, pct: -0.61 },
  { symbol: "MSFT", name: "Microsoft", kind: "Stock", region: "US", price: 442.5, pct: 0.69 },
  { symbol: "GOOGL", name: "Alphabet Class A", kind: "Stock", region: "US", price: 178.24, pct: 1.07 },
  { symbol: "AMZN", name: "Amazon.com", kind: "Stock", region: "US", price: 198.77, pct: -1.05 },
  { symbol: "META", name: "Meta Platforms", kind: "Stock", region: "US", price: 512.9, pct: 1.27 },
  { symbol: "TSLA", name: "Tesla Inc", kind: "Stock", region: "US", price: 268.94, pct: 3.15 },
  { symbol: "AVGO", name: "Broadcom Inc", kind: "Stock", region: "US", price: 1642.1, pct: 2.1 },
  { symbol: "JPM", name: "JPMorgan Chase", kind: "Stock", region: "US", price: 218.44, pct: 0.42 },
  { symbol: "V", name: "Visa Inc", kind: "Stock", region: "US", price: 289.6, pct: 0.31 },
  { symbol: "UNH", name: "UnitedHealth Group", kind: "Stock", region: "US", price: 552.4, pct: -0.85 },
  { symbol: "XOM", name: "Exxon Mobil", kind: "Stock", region: "US", price: 118.9, pct: -1.4 },
  { symbol: "BRK.B", name: "Berkshire Hathaway B", kind: "Stock", region: "US", price: 462.05, pct: 0.22 },
  { symbol: "LLY", name: "Eli Lilly", kind: "Stock", region: "US", price: 892.1, pct: 1.9 },
  { symbol: "AMD", name: "Advanced Micro Devices", kind: "Stock", region: "US", price: 168.72, pct: 2.4 },
  { symbol: "NFLX", name: "Netflix", kind: "Stock", region: "US", price: 712.8, pct: 0.55 },
  { symbol: "DIS", name: "Walt Disney", kind: "Stock", region: "US", price: 98.14, pct: -0.7 },
  { symbol: "BA", name: "Boeing", kind: "Stock", region: "US", price: 168.5, pct: -1.1 },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", kind: "ETF", region: "US", price: 578.42, pct: 0.62 },
  { symbol: "QQQ", name: "Invesco QQQ Trust", kind: "ETF", region: "US", price: 490.11, pct: 1.14 },
  { symbol: "VTI", name: "Vanguard Total Market", kind: "ETF", region: "US", price: 288.32, pct: 0.55 },
  { symbol: "VXUS", name: "Vanguard Total Intl Stock", kind: "ETF", region: "Global", price: 63.4, pct: 0.3 },
  { symbol: "SCHD", name: "Schwab US Dividend Equity", kind: "ETF", region: "US", price: 82.6, pct: 0.18 },
  { symbol: "BND", name: "Vanguard Total Bond", kind: "ETF", region: "US", price: 73.1, pct: -0.1 },
  { symbol: "SGOV", name: "iShares 0-3M Treasury", kind: "ETF", region: "US", price: 100.42, pct: 0.01 },
  { symbol: "VOO", name: "Vanguard S&P 500", kind: "ETF", region: "US", price: 531.02, pct: 0.61 },
  { symbol: "GLD", name: "SPDR Gold Shares", kind: "ETF", region: "Global", price: 242.9, pct: 0.9 },
  { symbol: "EEM", name: "iShares MSCI Emerging Mkts", kind: "ETF", region: "EM", price: 44.2, pct: 0.4 },
  { symbol: "SPX", name: "S&P 500 Index", kind: "Index", region: "US", price: 5_812.44, pct: 0.62 },
  { symbol: "IXIC", name: "NASDAQ Composite", kind: "Index", region: "US", price: 18_942.11, pct: 1.14 },
  { symbol: "DJI", name: "Dow Jones Industrial Avg", kind: "Index", region: "US", price: 42_180.9, pct: -0.21 },
  { symbol: "VIX", name: "CBOE Volatility Index", kind: "Index", region: "US", price: 14.82, pct: -3.4 },
  { symbol: "FTSE", name: "FTSE 100", kind: "Index", region: "UK", price: 8_244.1, pct: 0.35 },
  { symbol: "N225", name: "Nikkei 225", kind: "Index", region: "JP", price: 39_120.5, pct: 0.82 },
  { symbol: "HSI", name: "Hang Seng Index", kind: "Index", region: "HK", price: 20_412.2, pct: -0.4 },
  { symbol: "DAX", name: "DAX Performance Index", kind: "Index", region: "DE", price: 19_320.8, pct: 0.5 },
  { symbol: "NIFTY", name: "NIFTY 50", kind: "Index", region: "IN", price: 24_680.3, pct: 0.28 },
  { symbol: "BTC", name: "Bitcoin", kind: "Crypto", region: "Global", price: 68_412, pct: 2.75 },
  { symbol: "ETH", name: "Ethereum", kind: "Crypto", region: "Global", price: 3_842.1, pct: 3.1 },
  { symbol: "SOL", name: "Solana", kind: "Crypto", region: "Global", price: 172.4, pct: 4.8 },
  { symbol: "BNB", name: "BNB", kind: "Crypto", region: "Global", price: 612.2, pct: 1.2 },
  { symbol: "XRP", name: "Ripple", kind: "Crypto", region: "Global", price: 0.612, pct: -0.9 },
  { symbol: "DOGE", name: "Dogecoin", kind: "Crypto", region: "Global", price: 0.148, pct: 2.3 },
  { symbol: "ADA", name: "Cardano", kind: "Crypto", region: "Global", price: 0.412, pct: -1.4 },
  { symbol: "EURUSD", name: "Euro / US Dollar", kind: "FX", region: "FX", price: 1.0842, pct: 0.12 },
  { symbol: "GBPUSD", name: "British Pound / USD", kind: "FX", region: "FX", price: 1.2712, pct: -0.08 },
  { symbol: "USDJPY", name: "US Dollar / Yen", kind: "FX", region: "FX", price: 151.32, pct: 0.24 },
  { symbol: "USDINR", name: "US Dollar / Rupee", kind: "FX", region: "FX", price: 83.94, pct: 0.05 },
  { symbol: "CL", name: "Crude Oil (WTI)", kind: "Commodity", region: "Global", price: 71.82, pct: -1.2 },
  { symbol: "GC", name: "Gold Futures", kind: "Commodity", region: "Global", price: 2_642.1, pct: 0.9 },
  { symbol: "SI", name: "Silver Futures", kind: "Commodity", region: "Global", price: 31.4, pct: 1.4 },
  { symbol: "NG", name: "Natural Gas", kind: "Commodity", region: "Global", price: 2.94, pct: -2.1 },
];

export const news = [
  { tag: "Fed", time: "12m", title: "Fed signals patient path on rates as inflation cools further", source: "Reuters", impact: "high" },
  { tag: "Earnings", time: "38m", title: "NVIDIA beats on Q3 revenue, data-center growth accelerates 94% YoY", source: "Bloomberg", impact: "high" },
  { tag: "Energy", time: "1h", title: "Oil slips below $72 as OPEC+ weighs extending voluntary cuts", source: "WSJ", impact: "med" },
  { tag: "Crypto", time: "2h", title: "Bitcoin ETFs post record weekly inflows amid rate-cut optimism", source: "CoinDesk", impact: "med" },
  { tag: "Geo", time: "3h", title: "EU antitrust probe into cloud pricing widens to include AI vendors", source: "FT", impact: "low" },
  { tag: "Rates", time: "4h", title: "Two-year Treasury yield slides to a five-month low", source: "Reuters", impact: "med" },
  { tag: "Tech", time: "5h", title: "Cloud capex guidance lifted across hyperscalers on AI demand", source: "CNBC", impact: "high" },
  { tag: "Consumer", time: "6h", title: "Retail sales cool but services spending stays resilient", source: "AP", impact: "low" },
];

export const positions = [
  { symbol: "NVDA", qty: 42, avg: 812.4, price: 1284.32 },
  { symbol: "AAPL", qty: 120, avg: 178.2, price: 232.11 },
  { symbol: "MSFT", qty: 55, avg: 388.1, price: 442.5 },
  { symbol: "TSLA", qty: 30, avg: 244.9, price: 268.94 },
  { symbol: "SCHD", qty: 210, avg: 74.8, price: 82.6 },
];

export type GoalIcon = "umbrella" | "home" | "college" | "travel" | "car";

export type Goal = {
  id: string;
  icon: GoalIcon;
  name: string;
  horizon: string;
  target: number;
  saved: number;
  monthly: number;
  risk: "Low" | "Medium" | "High";
  allocation: { label: string; pct: number; color: string }[];
  suggestions: string[];
  thesis: string;
};

export const goals: Goal[] = [
  {
    id: "retire",
    icon: "umbrella",
    name: "Retirement",
    horizon: "25 yrs",
    target: 1_200_000,
    saved: 184_320,
    monthly: 1_500,
    risk: "High",
    allocation: [
      { label: "Equities", pct: 75, color: "oklch(0.78 0.17 155)" },
      { label: "Bonds", pct: 15, color: "oklch(0.65 0.18 260)" },
      { label: "Alts", pct: 10, color: "oklch(0.72 0.19 45)" },
    ],
    suggestions: ["VTI", "VXUS", "QQQ", "SCHD"],
    thesis: "Long horizon → aggressive equity tilt with broad global diversification.",
  },
  {
    id: "home",
    icon: "home",
    name: "House down payment",
    horizon: "4 yrs",
    target: 80_000,
    saved: 32_400,
    monthly: 900,
    risk: "Low",
    allocation: [
      { label: "T-Bills", pct: 55, color: "oklch(0.72 0.19 45)" },
      { label: "HYSA", pct: 30, color: "oklch(0.78 0.17 155)" },
      { label: "Short bonds", pct: 15, color: "oklch(0.65 0.18 260)" },
    ],
    suggestions: ["SGOV", "BIL", "VMFXX"],
    thesis: "Capital preservation — lock in ~5% yield without duration risk.",
  },
  {
    id: "college",
    icon: "college",
    name: "Kid's college fund",
    horizon: "12 yrs",
    target: 150_000,
    saved: 28_900,
    monthly: 400,
    risk: "Medium",
    allocation: [
      { label: "Equities", pct: 60, color: "oklch(0.78 0.17 155)" },
      { label: "Bonds", pct: 30, color: "oklch(0.65 0.18 260)" },
      { label: "Cash", pct: 10, color: "oklch(0.72 0.19 45)" },
    ],
    suggestions: ["VOO", "AGG", "VXUS"],
    thesis: "Balanced 60/30/10 in a 529 — glidepath more conservative near year 10.",
  },
  {
    id: "travel",
    icon: "travel",
    name: "World trip",
    horizon: "18 mo",
    target: 15_000,
    saved: 4_200,
    monthly: 600,
    risk: "Low",
    allocation: [
      { label: "HYSA", pct: 70, color: "oklch(0.78 0.17 155)" },
      { label: "T-Bills", pct: 30, color: "oklch(0.72 0.19 45)" },
    ],
    suggestions: ["SGOV", "HYSA"],
    thesis: "Under 2 yrs — no equities. Prioritize liquidity and stable yield.",
  },
  {
    id: "car",
    icon: "car",
    name: "New EV",
    horizon: "3 yrs",
    target: 45_000,
    saved: 11_800,
    monthly: 700,
    risk: "Medium",
    allocation: [
      { label: "Bonds", pct: 50, color: "oklch(0.65 0.18 260)" },
      { label: "Equities", pct: 30, color: "oklch(0.78 0.17 155)" },
      { label: "Cash", pct: 20, color: "oklch(0.72 0.19 45)" },
    ],
    suggestions: ["BND", "VTI", "SGOV"],
    thesis: "Moderate risk — bond-heavy blend to smooth volatility over 3 yrs.",
  },
];

export const aiRecommendations = [
  { symbol: "NVDA", stance: "Accumulate", confidence: 82, note: "Data-center revenue momentum still accelerating; valuation supported by FCF." },
  { symbol: "SCHD", stance: "Add", confidence: 74, note: "Defensive dividend sleeve to balance a tech-heavy book." },
  { symbol: "XOM", stance: "Trim", confidence: 61, note: "Crude weakness plus OPEC+ supply uncertainty caps near-term upside." },
  { symbol: "SGOV", stance: "Hold", confidence: 88, note: "Cash parking with ~5% yield while rate path resolves." },
];
