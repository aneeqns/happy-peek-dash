import { createServerFn } from "@tanstack/react-start";
import { quoteRequestSchema } from './ai-request-schemas';

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
  const normalized = symbol.trim().toUpperCase();
  return PROVIDER_SYMBOL[normalized] ?? normalized;
}

function appSymbol(provider: string) {
  const found = Object.entries(PROVIDER_SYMBOL).find(([, v]) => v === provider);
  return found ? found[0] : provider;
}

async function fetchChunk(symbols: string[]): Promise<Quote[]> {
  const quotes: Quote[] = [];
  // The old batch endpoint requires provider authentication. The public chart
  // endpoint supplies quote metadata without cookies or private credentials.
  const queue = [...symbols];
  await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
    while (queue.length) {
      const symbol = queue.shift();
      if (!symbol) return;
      try {
        const res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`, {
          redirect: 'error', signal: AbortSignal.timeout(10000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; UptrendApp/1.0)', Accept: 'application/json' },
        });
        if (!res.ok) continue;
        const json = await res.json() as { chart?: { result?: { meta?: Record<string, unknown> }[] } };
        const meta = json.chart?.result?.[0]?.meta;
        if (!meta) continue;
        const price = Number(meta.regularMarketPrice);
        if (!Number.isFinite(price) || price <= 0) continue;
        const previous = Number(meta.chartPreviousClose ?? meta.previousClose);
        const change = Number.isFinite(previous) && previous > 0 ? price - previous : 0;
        const periods = meta.currentTradingPeriod as { regular?: { start?: number; end?: number } } | undefined;
        const now = Date.now() / 1000;
        const open = periods?.regular?.start !== undefined && periods.regular.end !== undefined && now >= periods.regular.start && now < periods.regular.end;
        quotes.push({ symbol: appSymbol(symbol), price, change, changePct: previous > 0 ? change / previous * 100 : 0,
          currency: String(meta.currency ?? 'USD'), marketState: open ? 'REGULAR' : 'CLOSED',
          name: String(meta.shortName ?? meta.longName ?? appSymbol(symbol)) });
      } catch { /* One missing ticker must not discard the other live quotes. */ }
    }
  }));
  return quotes;
}

/**
 * Live (slightly delayed) market quotes from a free public market-data endpoint.
 * Missing provider prices are explicitly unavailable, never synthetic quotes.
 */
export const getQuotes = createServerFn({ method: "POST" })
  .inputValidator(quoteRequestSchema)
  .handler(async ({ data }) => {
    const { enforcePublicQuota } = await import('./request-security.server');
    const denied = await enforcePublicQuota('quotes');
    if (denied) return { quotes: [] as Quote[], error: 'Quote request limit reached or request blocked.', at: Date.now() };
    if (data.symbols.length === 0) return { quotes: [] as Quote[], error: null as string | null, at: Date.now() };
    const mapped = [...new Set(data.symbols.map(providerSymbol))];
    try {
      const quotes = await fetchChunk(mapped);
      return { quotes, error: quotes.length < mapped.length ? 'Live prices are unavailable for some symbols.' : null as string | null, at: Date.now() };
    } catch (err) {
      console.error("[quotes] provider failed", err);
      return { quotes: [] as Quote[], error: "Live prices are temporarily unavailable.", at: Date.now() };
    }
  });
