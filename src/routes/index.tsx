import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Briefcase,
  Globe2,
  LineChart as LineChartIcon,
  Newspaper,
  Search,
  Settings,
  Sparkles,
  
  Wallet,
  Target,
  GraduationCap,
  Home,
  Plane,
  Umbrella,
  Car,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InvestAssistant } from "@/components/InvestAssistant";
import { PortfolioInsights } from "@/components/PortfolioInsights";
import { SmartAlerts } from "@/components/SmartAlerts";
import { PremiumUpgrade } from "@/components/PremiumUpgrade";
import uptrendLogo from "@/assets/uptrend-logo.png.asset.json";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

// ---------- Custom chart tooltip ----------
function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
  unit,
  accentByValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; payload?: Record<string, unknown> }>;
  label?: string | number;
  valueFormatter: (v: number) => string;
  labelFormatter?: (label: string | number | undefined, payload?: Record<string, unknown>) => string;
  unit?: string;
  accentByValue?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const v = p.value;
  const accent = accentByValue
    ? v >= 0
      ? "text-emerald-400"
      : "text-rose-400"
    : "text-emerald-400";
  const heading = labelFormatter
    ? labelFormatter(label, p.payload)
    : String(p.name ?? "");
  return (
    <div className="min-w-[140px] rounded-xl border border-white/15 bg-zinc-950/95 p-3 shadow-2xl ring-1 ring-black/50 backdrop-blur-md">
      {heading && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
          {heading}
        </p>
      )}
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs text-white/70">{unit ?? "Value"}</span>
        <span className={`text-lg font-semibold tabular-nums tracking-tight ${accent}`}>
          {valueFormatter(v)}
        </span>
      </div>
    </div>
  );
}

// ---------- Mock data ----------
const portfolio = {
  value: 184_320.42,
  change: 2_431.18,
  changePct: 1.34,
  cash: 12_480.9,
  buyingPower: 24_961.8,
};

const chartData = Array.from({ length: 60 }, (_, i) => {
  const base = 170_000 + Math.sin(i / 4) * 3000 + i * 220;
  const noise = Math.cos(i / 2.3) * 1500 + (Math.random() - 0.5) * 800;
  return { t: i, v: Math.round(base + noise) };
});

const sectorData = [
  { name: "Tech", pct: 3.2 },
  { name: "Energy", pct: -1.4 },
  { name: "Finance", pct: 0.8 },
  { name: "Health", pct: 1.9 },
  { name: "Consumer", pct: -0.6 },
  { name: "Crypto", pct: 4.6 },
];

type Ticker = {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  spark: number[];
};

const initialWatchlist: Ticker[] = [
  { symbol: "NVDA", name: "NVIDIA Corp", price: 1284.32, change: 22.14, changePct: 1.75, spark: gen() },
  { symbol: "AAPL", name: "Apple Inc", price: 232.11, change: -1.42, changePct: -0.61, spark: gen() },
  { symbol: "TSLA", name: "Tesla Inc", price: 268.94, change: 8.21, changePct: 3.15, spark: gen() },
  { symbol: "MSFT", name: "Microsoft", price: 442.5, change: 3.02, changePct: 0.69, spark: gen() },
  { symbol: "AMZN", name: "Amazon", price: 198.77, change: -2.11, changePct: -1.05, spark: gen() },
  { symbol: "GOOGL", name: "Alphabet", price: 178.24, change: 1.88, changePct: 1.07, spark: gen() },
  { symbol: "META", name: "Meta Platforms", price: 512.9, change: 6.44, changePct: 1.27, spark: gen() },
  { symbol: "BTC", name: "Bitcoin", price: 68_412, change: 1834, changePct: 2.75, spark: gen() },
];

function gen() {
  let v = 100;
  return Array.from({ length: 24 }, () => (v += (Math.random() - 0.45) * 4));
}

const indices = [
  { name: "S&P 500", value: 5_812.44, pct: 0.62 },
  { name: "NASDAQ", value: 18_942.11, pct: 1.14 },
  { name: "DOW", value: 42_180.9, pct: -0.21 },
  { name: "VIX", value: 14.82, pct: -3.4 },
];

// Global market universe — searchable via the header search bar.
type MarketKind = "Stock" | "ETF" | "Index" | "Crypto" | "FX" | "Commodity";
type MarketItem = {
  symbol: string;
  name: string;
  kind: MarketKind;
  region: string;
  price: number;
  pct: number;
};

const marketUniverse: MarketItem[] = [
  // US Mega-cap stocks
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
  // ETFs
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
  // Indices
  { symbol: "SPX", name: "S&P 500 Index", kind: "Index", region: "US", price: 5_812.44, pct: 0.62 },
  { symbol: "IXIC", name: "NASDAQ Composite", kind: "Index", region: "US", price: 18_942.11, pct: 1.14 },
  { symbol: "DJI", name: "Dow Jones Industrial Avg", kind: "Index", region: "US", price: 42_180.9, pct: -0.21 },
  { symbol: "VIX", name: "CBOE Volatility Index", kind: "Index", region: "US", price: 14.82, pct: -3.4 },
  { symbol: "FTSE", name: "FTSE 100", kind: "Index", region: "UK", price: 8_244.1, pct: 0.35 },
  { symbol: "N225", name: "Nikkei 225", kind: "Index", region: "JP", price: 39_120.5, pct: 0.82 },
  { symbol: "HSI", name: "Hang Seng Index", kind: "Index", region: "HK", price: 20_412.2, pct: -0.4 },
  { symbol: "DAX", name: "DAX Performance Index", kind: "Index", region: "DE", price: 19_320.8, pct: 0.5 },
  { symbol: "NIFTY", name: "NIFTY 50", kind: "Index", region: "IN", price: 24_680.3, pct: 0.28 },
  // Crypto
  { symbol: "BTC", name: "Bitcoin", kind: "Crypto", region: "Global", price: 68_412, pct: 2.75 },
  { symbol: "ETH", name: "Ethereum", kind: "Crypto", region: "Global", price: 3_842.1, pct: 3.1 },
  { symbol: "SOL", name: "Solana", kind: "Crypto", region: "Global", price: 172.4, pct: 4.8 },
  { symbol: "BNB", name: "BNB", kind: "Crypto", region: "Global", price: 612.2, pct: 1.2 },
  { symbol: "XRP", name: "Ripple", kind: "Crypto", region: "Global", price: 0.612, pct: -0.9 },
  { symbol: "DOGE", name: "Dogecoin", kind: "Crypto", region: "Global", price: 0.148, pct: 2.3 },
  { symbol: "ADA", name: "Cardano", kind: "Crypto", region: "Global", price: 0.412, pct: -1.4 },
  // FX
  { symbol: "EURUSD", name: "Euro / US Dollar", kind: "FX", region: "FX", price: 1.0842, pct: 0.12 },
  { symbol: "GBPUSD", name: "British Pound / USD", kind: "FX", region: "FX", price: 1.2712, pct: -0.08 },
  { symbol: "USDJPY", name: "US Dollar / Yen", kind: "FX", region: "FX", price: 151.32, pct: 0.24 },
  { symbol: "USDINR", name: "US Dollar / Rupee", kind: "FX", region: "FX", price: 83.94, pct: 0.05 },
  // Commodities
  { symbol: "CL", name: "Crude Oil (WTI)", kind: "Commodity", region: "Global", price: 71.82, pct: -1.2 },
  { symbol: "GC", name: "Gold Futures", kind: "Commodity", region: "Global", price: 2_642.1, pct: 0.9 },
  { symbol: "SI", name: "Silver Futures", kind: "Commodity", region: "Global", price: 31.4, pct: 1.4 },
  { symbol: "NG", name: "Natural Gas", kind: "Commodity", region: "Global", price: 2.94, pct: -2.1 },
];


const news = [
  {
    tag: "Fed",
    time: "12m",
    title: "Fed signals patient path on rates as inflation cools further",
    source: "Reuters",
    impact: "high",
  },
  {
    tag: "Earnings",
    time: "38m",
    title: "NVIDIA beats on Q3 revenue, data-center growth accelerates 94% YoY",
    source: "Bloomberg",
    impact: "high",
  },
  {
    tag: "Energy",
    time: "1h",
    title: "Oil slips below $72 as OPEC+ weighs extending voluntary cuts",
    source: "WSJ",
    impact: "med",
  },
  {
    tag: "Crypto",
    time: "2h",
    title: "Bitcoin ETFs post record weekly inflows amid rate-cut optimism",
    source: "CoinDesk",
    impact: "med",
  },
  {
    tag: "Geo",
    time: "3h",
    title: "EU antitrust probe into cloud pricing widens to include AI vendors",
    source: "FT",
    impact: "low",
  },
];

const positions = [
  { symbol: "NVDA", qty: 42, avg: 812.4, price: 1284.32 },
  { symbol: "AAPL", qty: 120, avg: 178.2, price: 232.11 },
  { symbol: "MSFT", qty: 55, avg: 388.1, price: 442.5 },
  { symbol: "TSLA", qty: 30, avg: 244.9, price: 268.94 },
];

type Goal = {
  id: string;
  icon: React.ReactNode;
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

const goals: Goal[] = [
  {
    id: "retire",
    icon: <Umbrella className="h-4 w-4" />,
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
    icon: <Home className="h-4 w-4" />,
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
    icon: <GraduationCap className="h-4 w-4" />,
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
    icon: <Plane className="h-4 w-4" />,
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
    icon: <Car className="h-4 w-4" />,
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


// ---------- Helpers ----------
const fmt = (n: number, d = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

function Dashboard() {
  const [range, setRange] = useState<"1D" | "1W" | "1M" | "1Y" | "ALL">("1M");
  const [watchlist, setWatchlist] = useState(initialWatchlist);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return marketUniverse.slice(0, 8);
    return marketUniverse
      .filter(
        (m) =>
          m.symbol.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.kind.toLowerCase().includes(q) ||
          m.region.toLowerCase().includes(q),
      )
      .slice(0, 12);
  }, [query]);

  const addToWatchlist = (m: MarketItem) => {
    setWatchlist((w) => {
      if (w.some((t) => t.symbol === m.symbol)) return w;
      return [
        {
          symbol: m.symbol,
          name: m.name,
          price: m.price,
          change: (m.price * m.pct) / 100,
          changePct: m.pct,
          spark: gen(),
        },
        ...w,
      ];
    });
    setSearchOpen(false);
    setQuery("");
  };


  // Live-ish price ticks
  useEffect(() => {
    const id = setInterval(() => {
      setWatchlist((w) =>
        w.map((t) => {
          const drift = (Math.random() - 0.5) * (t.price * 0.0015);
          const price = Math.max(0.01, t.price + drift);
          const change = t.change + drift;
          const changePct = (change / (price - change)) * 100;
          return {
            ...t,
            price,
            change,
            changePct,
            spark: [...t.spark.slice(1), t.spark[t.spark.length - 1] + drift],
          };
        }),
      );
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const gain = portfolio.change >= 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-lg bg-black shadow-[var(--shadow-glow)]">
              <img src={uptrendLogo.url} alt="Uptrend logo" className="h-10 w-10 object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight">Uptrend</span>
          </div>

          <nav className="ml-6 hidden items-center gap-1 md:flex">
            {[
              { label: "Dashboard", href: "#dashboard" },
              { label: "Portfolio", href: "#portfolio" },
              { label: "Insights", href: "#insights" },
              { label: "Alerts", href: "#alerts" },
              { label: "Goals", href: "#goals" },
              { label: "Premium", href: "#premium" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div ref={searchRef} className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                  if (e.key === "Enter" && searchResults[0]) addToWatchlist(searchResults[0]);
                }}
                placeholder="Search all markets — stocks, ETFs, crypto, FX…"
                className="h-9 w-72 rounded-md border border-border bg-surface pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
              />
              {searchOpen && (
                <div className="absolute right-0 top-11 z-40 w-[380px] overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-[var(--shadow-card)]">
                  <div className="flex items-center justify-between border-b border-border/60 px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span>{query ? `Results for "${query}"` : "Explore all markets"}</span>
                    <span className="font-mono-nums">{searchResults.length}</span>
                  </div>
                  {searchResults.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                      No markets match "{query}"
                    </div>
                  ) : (
                    <ul className="max-h-[360px] overflow-y-auto">
                      {searchResults.map((m) => {
                        const up = m.pct >= 0;
                        return (
                          <li key={`${m.kind}-${m.symbol}`}>
                            <button
                              onClick={() => addToWatchlist(m)}
                              className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-secondary/60"
                            >
                              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-[10px] font-bold text-foreground">
                                {m.symbol.slice(0, 2)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="truncate text-sm font-semibold">{m.symbol}</span>
                                  <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-accent">
                                    {m.kind}
                                  </span>
                                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                                    {m.region}
                                  </span>
                                </div>
                                <p className="truncate text-[11px] text-muted-foreground">{m.name}</p>
                              </div>
                              <div className="shrink-0 text-right font-mono-nums">
                                <p className="text-sm font-semibold">
                                  {m.price < 10 ? m.price.toFixed(4) : fmt(m.price)}
                                </p>
                                <p className={`text-[11px] ${up ? "text-bull" : "text-bear"}`}>
                                  {up ? "+" : ""}
                                  {m.pct.toFixed(2)}%
                                </p>
                              </div>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  <div className="border-t border-border/60 px-3 py-2 text-[10px] text-muted-foreground">
                    Enter to add top result · Esc to close
                  </div>
                </div>
              )}
            </div>

            <button className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-semibold text-primary-foreground">
              JR
            </div>
          </div>
        </div>

        {/* Index ticker strip — auto-scrolling marquee */}
        <div className="border-t border-border/60 bg-surface/50">
          <div className="group relative overflow-hidden py-2">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent" />
            <div className="flex w-max animate-[ticker_40s_linear_infinite] gap-8 pl-8 group-hover:[animation-play-state:paused]">
              {[...indices, ...indices, ...indices, ...indices].map((idx, i) => (
                <div key={i} className="flex shrink-0 items-center gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground">
                    {idx.name}
                  </span>
                  <span className="font-mono-nums">{fmt(idx.value)}</span>
                  <span
                    className={`font-mono-nums ${idx.pct >= 0 ? "text-bull" : "text-bear"}`}
                  >
                    {idx.pct >= 0 ? "+" : ""}
                    {idx.pct.toFixed(2)}%
                  </span>
                  <span className="text-muted-foreground/40">•</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <h1 className="sr-only">Stock market dashboard</h1>

        {/* KPI row */}
        <section id="dashboard" className="scroll-mt-24 grid grid-cols-2 gap-3 rounded-3xl border border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 via-emerald-400/10 to-lime-500/15 p-4 shadow-[0_0_40px_-10px_rgba(16,185,129,0.35)] sm:grid-cols-4">
          <Kpi
            icon={<Wallet className="h-4 w-4" />}
            label="Portfolio value"
            value={`$${fmt(portfolio.value)}`}
            delta={`${gain ? "+" : ""}$${fmt(portfolio.change)} (${portfolio.changePct.toFixed(2)}%)`}
            up={gain}
          />
          <Kpi
            icon={<Briefcase className="h-4 w-4" />}
            label="Buying power"
            value={`$${fmt(portfolio.buyingPower)}`}
            delta={`Cash $${fmt(portfolio.cash)}`}
          />
          <Kpi
            icon={<LineChartIcon className="h-4 w-4" />}
            label="Today's P/L"
            value={`+$${fmt(1284.9)}`}
            delta="+0.71%"
            up
          />
          <Kpi
            icon={<Sparkles className="h-4 w-4" />}
            label="Win rate (30d)"
            value="62.4%"
            delta="+3.1 pts"
            up
          />
        </section>

        {/* Chart + Watchlist */}
        <section className="mt-6 grid gap-4 rounded-3xl border border-indigo-400/40 bg-gradient-to-br from-indigo-500/25 via-blue-500/15 to-purple-500/20 p-4 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-5 shadow-[var(--shadow-card)] lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Portfolio performance
                </p>
                <p className="mt-1 font-mono-nums text-3xl font-semibold">
                  ${fmt(portfolio.value)}
                </p>
                <p
                  className={`mt-1 flex items-center gap-1 text-sm font-mono-nums ${
                    gain ? "text-bull" : "text-bear"
                  }`}
                >
                  {gain ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {gain ? "+" : ""}${fmt(portfolio.change)} ({portfolio.changePct.toFixed(2)}%)
                  <span className="ml-1 text-muted-foreground">this month</span>
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Bull</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Bear</span>
                </span>
                <span className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                  <span className="h-0.5 w-3 bg-white/40" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">Benchmark</span>
                </span>
              </div>
              <div className="flex rounded-lg border border-border bg-surface p-1">
                {(["1D", "1W", "1M", "1Y", "ALL"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`rounded-md px-3 py-1 text-xs font-medium ${
                      range === r
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 h-[280px] w-full">
              <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pfill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.17 155)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.78 0.17 155)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.3 0.03 265)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" hide />
                  <YAxis
                    domain={["dataMin - 500", "dataMax + 500"]}
                    tick={{ fill: "oklch(0.68 0.03 260)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={60}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0.02 265)",
                      border: "1px solid oklch(0.3 0.03 265)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    labelFormatter={() => ""}
                    formatter={(v: number) => [`$${fmt(v, 0)}`, "Value"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="oklch(0.78 0.17 155)"
                    strokeWidth={2}
                    fill="url(#pfill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Watchlist */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Watchlist</h2>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-bull">
                Live
              </span>
            </div>
            <ul className="mt-3 divide-y divide-border/70">
              {watchlist.map((t) => (
                <WatchRow key={t.symbol} t={t} />
              ))}
            </ul>
          </div>
        </section>

        {/* Sector + News + Positions */}
        <section className="mt-6 grid gap-4 rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/25 via-orange-500/15 to-yellow-500/20 p-4 shadow-[0_0_40px_-10px_rgba(245,158,11,0.4)] lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Sector performance</h2>
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <div className="mt-3 h-[240px]">
              <ResponsiveContainer>
                <BarChart data={sectorData}>
                  <CartesianGrid stroke="oklch(0.3 0.03 265)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: "oklch(0.68 0.03 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "oklch(0.68 0.03 260)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.2 0.02 265)",
                      border: "1px solid oklch(0.3 0.03 265)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "oklch(0.28 0.03 265 / 0.4)" }}
                  />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {sectorData.map((s, i) => (
                      <rect key={i} fill={s.pct >= 0 ? "oklch(0.78 0.17 155)" : "oklch(0.68 0.22 25)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current affairs / news */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Market-moving current affairs</h2>
              </div>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground">
                View all →
              </a>
            </div>
            <ul className="mt-3 space-y-2">
              {news.map((n, i) => (
                <li
                  key={i}
                  className="group flex items-start gap-3 rounded-xl border border-transparent p-3 hover:border-border hover:bg-surface-elevated"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                    <Globe2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 font-semibold text-accent">
                        {n.tag}
                      </span>
                      <span>{n.source}</span>
                      <span>· {n.time}</span>
                      <span
                        className={`ml-auto rounded px-1.5 py-0.5 font-semibold ${
                          n.impact === "high"
                            ? "bg-bear/15 text-bear"
                            : n.impact === "med"
                              ? "bg-primary/15 text-bull"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {n.impact} impact
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                      {n.title}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Positions */}
        <section id="portfolio" className="mt-6 scroll-mt-24 rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 via-sky-500/15 to-blue-500/20 p-5 shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Open positions</h2>
            <span className="text-xs text-muted-foreground">{positions.length} holdings</span>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="py-2 font-medium">Symbol</th>
                  <th className="py-2 font-medium">Qty</th>
                  <th className="py-2 font-medium">Avg cost</th>
                  <th className="py-2 font-medium">Price</th>
                  <th className="py-2 font-medium">Market value</th>
                  <th className="py-2 text-right font-medium">P/L</th>
                </tr>
              </thead>
              <tbody className="font-mono-nums">
                {positions.map((p) => {
                  const mv = p.qty * p.price;
                  const pl = (p.price - p.avg) * p.qty;
                  const plPct = ((p.price - p.avg) / p.avg) * 100;
                  const up = pl >= 0;
                  return (
                    <tr key={p.symbol} className="border-t border-border/60">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="grid h-7 w-7 place-items-center rounded-md bg-secondary text-[10px] font-bold text-foreground">
                            {p.symbol.slice(0, 2)}
                          </div>
                          <span className="font-semibold">{p.symbol}</span>
                        </div>
                      </td>
                      <td>{p.qty}</td>
                      <td>${fmt(p.avg)}</td>
                      <td>${fmt(p.price)}</td>
                      <td>${fmt(mv)}</td>
                      <td className={`text-right ${up ? "text-bull" : "text-bear"}`}>
                        {up ? "+" : ""}${fmt(pl)} ({up ? "+" : ""}
                        {plPct.toFixed(2)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div id="insights" className="mt-6 scroll-mt-24 rounded-3xl border border-violet-400/40 bg-gradient-to-br from-violet-500/25 via-fuchsia-500/15 to-purple-500/20 p-4 shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]">
          <PortfolioInsights positions={positions} />
        </div>

        <div id="alerts" className="mt-6 scroll-mt-24 rounded-3xl border border-teal-400/40 bg-gradient-to-br from-teal-500/25 via-emerald-500/15 to-cyan-500/20 p-4 shadow-[0_0_40px_-10px_rgba(20,184,166,0.4)]">
          <SmartAlerts />
        </div>

        {/* Goal-based investing */}
        <section id="goals" className="mt-6 scroll-mt-24 rounded-3xl border border-rose-400/40 bg-gradient-to-br from-rose-500/25 via-pink-500/15 to-fuchsia-500/20 p-4 shadow-[0_0_40px_-10px_rgba(244,63,94,0.4)]">
          <div className="mb-3 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                <h2 className="text-sm font-semibold">Goal-based investment ideas</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Suggested allocations tuned to each goal's horizon and risk tolerance.
              </p>
            </div>
            <button className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              + New goal
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((g) => {
              const progress = Math.min(100, (g.saved / g.target) * 100);
              return (
                <div
                  key={g.id}
                  className="group flex flex-col rounded-2xl border border-border bg-[image:var(--gradient-surface)] p-5 shadow-[var(--shadow-card)] transition hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground">
                        {g.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{g.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {g.horizon} · ${fmt(g.monthly, 0)}/mo
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        g.risk === "High"
                          ? "bg-bear/15 text-bear"
                          : g.risk === "Medium"
                            ? "bg-primary/15 text-bull"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {g.risk} risk
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between font-mono-nums">
                      <span className="text-base font-semibold">${fmt(g.saved, 0)}</span>
                      <span className="text-xs text-muted-foreground">
                        of ${fmt(g.target, 0)}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground font-mono-nums">
                      {progress.toFixed(1)}% funded
                    </p>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Suggested allocation
                    </p>
                    <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full">
                      {g.allocation.map((a) => (
                        <div
                          key={a.label}
                          style={{ width: `${a.pct}%`, background: a.color }}
                          title={`${a.label} ${a.pct}%`}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                      {g.allocation.map((a) => (
                        <span key={a.label} className="flex items-center gap-1 text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-sm"
                            style={{ background: a.color }}
                          />
                          {a.label} <span className="font-mono-nums text-foreground">{a.pct}%</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-muted-foreground">{g.thesis}</p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {g.suggestions.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-border bg-surface px-2 py-0.5 font-mono-nums text-[11px] font-semibold text-foreground"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <button className="mt-4 w-full rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-90">
                    Invest toward this goal
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <PremiumUpgrade />

        <footer className="mt-8 pb-4 text-center text-xs text-muted-foreground">
          Mock data for demonstration. Prices update every ~1.6s to simulate a live feed.
        </footer>
      </main>
      <InvestAssistant />
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  up,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta: string;
  up?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-secondary text-foreground">
          {icon}
        </span>
        <span className="uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 font-mono-nums text-xl font-semibold sm:text-2xl">{value}</p>
      <p
        className={`mt-1 text-xs font-mono-nums ${
          up === undefined ? "text-muted-foreground" : up ? "text-bull" : "text-bear"
        }`}
      >
        {delta}
      </p>
    </div>
  );
}

function WatchRow({ t }: { t: Ticker }) {
  const up = t.change >= 0;
  const points = useMemo(() => {
    const min = Math.min(...t.spark);
    const max = Math.max(...t.spark);
    const span = max - min || 1;
    return t.spark
      .map((v, i) => {
        const x = (i / (t.spark.length - 1)) * 60;
        const y = 22 - ((v - min) / span) * 20;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [t.spark]);

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-secondary text-[10px] font-bold">
        {t.symbol.slice(0, 2)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{t.symbol}</p>
        <p className="truncate text-[11px] text-muted-foreground">{t.name}</p>
      </div>
      <svg viewBox="0 0 60 24" className="h-6 w-16 shrink-0">
        <polyline
          fill="none"
          stroke={up ? "oklch(0.78 0.17 155)" : "oklch(0.68 0.22 25)"}
          strokeWidth="1.5"
          points={points}
        />
      </svg>
      <div className="w-24 shrink-0 text-right font-mono-nums">
        <p className="text-sm font-semibold">
          ${t.price < 10 ? t.price.toFixed(4) : fmt(t.price)}
        </p>
        <p className={`text-[11px] ${up ? "text-bull" : "text-bear"}`}>
          {up ? "+" : ""}
          {t.changePct.toFixed(2)}%
        </p>
      </div>
    </li>
  );
}
