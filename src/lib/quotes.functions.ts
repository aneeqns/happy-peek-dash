import { createServerFn } from "@tanstack/react-start";

export type Quote = {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  currency: string;
  marketState: string;
  name: string;
};

/**
 * Maps the app's display symbols to the provider's ticker format.
 * Anything not listed is sent through unchanged (plain US equities/ETFs).
 */
const PROVIDER_SYMBOL: Record<string, string> = {
  BTC: "BTC-USD",
  ETH: "ETH-USD",
  SOL: "SOL-USD",
  BNB: "BNB-USD",
  XRP: "XRP-USD",
  DOGE: "DOGE-USD",
  ADA: "ADA-USD",
  SPX: "^GSPC",
  IXIC: "^IXIC",
  DJI: "^DJI",
  VIX: "^VIX",
  FTSE: "^FTSE",
  N225: "^N225",
  HSI: "^HSI",
  DAX: "^GDAXI",
  NIFTY: "^NSEI",
  EURUSD: "EURUSD=X",
  GBPUSD: "GBPUSD=X",
  USDJPY: "USDJPY=X",
  USDINR: "USDINR=X",
  CL: "CL=F",
  GC: "GC=F",
  SI: "SI=F",
  NG: "NG=F",
  "BRK.B": "BRK-B",
};

export function providerSymbol(symbol: string) {
  return PROVIDER_SYMBOL[symbol] ?? symbol.toUpperCase();
}

function appSymbol(provider: string) {
  const found = Object.entries(PROVIDER_SYMBOL).find(([, v]) => v === provider);
  return found ? found[0] : provider;
}

async function fetchChunk(symbols: string[]): Promise<Quote[]> {
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols.join(","))}`;
  const res = await fetch(url, {
    headers: {
      // The public endpoint rejects requests without a browser-like agent.
      "User-Agent": "Mozilla/5.0 (compatible; UptrendApp/1.0)",
      Accept: "application/json",
    },
  });
  if (!res.ok) throw new Error(`quote provider responded ${res.status}`);
  const json = (await res.json()) as {
    quoteResponse?: { result?: Array<Record<string, unknown>> };
  };
  const rows = json.quoteResponse?.result ?? [];
  return rows
    .map((r) => {
      const price = Number(r["regularMarketPrice"]);
      if (!Number.isFinite(price)) return null;
      return {
        symbol: appSymbol(String(r["symbol"])),
        price,
        change: Number(r["regularMarketChange"]) || 0,
        changePct: Number(r["regularMarketChangePercent"]) || 0,
        currency: String(r["currency"] ?? "USD"),
        marketState: String(r["marketState"] ?? "REGULAR"),
        name: String(r["shortName"] ?? r["longName"] ?? appSymbol(String(r["symbol"]))),
      } satisfies Quote;
    })
    .filter((q): q is Quote => q !== null);
}

/**
 * Live (slightly delayed) market quotes from a free public market-data endpoint.
 * Returns whatever the provider could supply; callers fall back to their own data
 * for anything missing so the UI never breaks when the feed is unavailable.
 */
export const getQuotes = createServerFn({ method: "POST" })
  .inputValidator((data: { symbols: string[] }) => ({
    symbols: Array.from(new Set((data?.symbols ?? []).map((s) => String(s).trim()).filter(Boolean))).slice(0, 80),
  }))
  .handler(async ({ data }) => {
    if (data.symbols.length === 0) return { quotes: [] as Quote[], error: null as string | null, at: Date.now() };
    const mapped = data.symbols.map(providerSymbol);
    try {
      const chunks: string[][] = [];
      for (let i = 0; i < mapped.length; i += 25) chunks.push(mapped.slice(i, i + 25));
      const results = await Promise.all(chunks.map(fetchChunk));
      return { quotes: results.flat(), error: null as string | null, at: Date.now() };
    } catch (err) {
      console.error("[quotes] provider failed", err);
      return { quotes: [] as Quote[], error: "Live prices are temporarily unavailable.", at: Date.now() };
    }
  });
