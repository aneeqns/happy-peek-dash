// Shared (client-safe) types + deterministic mock series generator for UpBot charts.

export type ChartPoint = { label: string; value: number };

export type ChartPayload = {
  title: string;
  symbol: string;
  kind: "line" | "bar";
  timeframe: string;
  unit: string;
  points: ChartPoint[];
  changePct: number;
};

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TIMEFRAMES: Record<string, { steps: number; label: (i: number, n: number) => string }> = {
  "1D": { steps: 26, label: (i) => `${9 + Math.floor(i / 4)}:${((i % 4) * 15).toString().padStart(2, "0")}` },
  "1W": { steps: 7, label: (i) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i % 7] },
  "1M": { steps: 22, label: (i) => `D${i + 1}` },
  "6M": { steps: 26, label: (i) => `W${i + 1}` },
  "1Y": { steps: 12, label: (i) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i % 12] },
  "5Y": { steps: 20, label: (i) => `Q${(i % 4) + 1} Y${Math.floor(i / 4) + 1}` },
};

export function buildSeries(opts: {
  symbol: string;
  timeframe?: string;
  kind?: "line" | "bar";
  title?: string;
  base?: number;
  volatility?: number;
  trend?: "up" | "down" | "flat";
  unit?: string;
}): ChartPayload {
  const timeframe = TIMEFRAMES[opts.timeframe ?? "1Y"] ? (opts.timeframe as string) : "1Y";
  const tf = TIMEFRAMES[timeframe];
  const rand = mulberry32(hash(`${opts.symbol}|${timeframe}`));
  const base = opts.base ?? 40 + (hash(opts.symbol) % 400);
  const vol = opts.volatility ?? 0.025;
  const drift = opts.trend === "down" ? -0.022 : opts.trend === "flat" ? 0 : 0.022;

  let v = base;
  const points: ChartPoint[] = [];
  for (let i = 0; i < tf.steps; i++) {
    v = v * (1 + drift + (rand() - 0.5) * vol * 2);
    points.push({ label: tf.label(i, tf.steps), value: Math.round(v * 100) / 100 });
  }

  const first = points[0].value;
  const last = points[points.length - 1].value;

  return {
    title: opts.title ?? `${opts.symbol} · ${timeframe}`,
    symbol: opts.symbol,
    kind: opts.kind ?? "line",
    timeframe,
    unit: opts.unit ?? "$",
    points,
    changePct: Math.round(((last - first) / first) * 10000) / 100,
  };
}
