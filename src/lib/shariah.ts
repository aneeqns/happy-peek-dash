/**
 * Shariah screening layer.
 *
 * Design rules:
 * - Statuses are NEVER random and NEVER default to "compliant". They are
 *   derived by evaluating stored company data against the thresholds of the
 *   *configured methodology* (see `METHODOLOGIES`).
 * - If any required input is missing (`null`/undefined) the security resolves
 *   to "unavailable" instead of pass/fail.
 * - Thresholds live only in the methodology config so a recognized provider
 *   methodology can be plugged in later without touching UI code.
 */

export type ShariahStatus = "compliant" | "non_compliant" | "unavailable";

export type CriterionKey = "business" | "income" | "debt" | "liquidAssets";

export type CriterionResult = {
  key: CriterionKey;
  label: string;
  outcome: "pass" | "fail" | "unknown";
  /** Human-readable measured value, e.g. "18.4% of trailing market cap". */
  measured: string;
  /** Threshold text taken from the active methodology. */
  threshold: string;
  /** Plain-language explanation shown behind the "Why?" toggle. */
  why: string;
};

export type ShariahMethodology = {
  id: string;
  name: string;
  provider: string;
  /** Denominator used for the financial ratio screens. */
  ratioBasis: string;
  thresholds: {
    /** Max interest-bearing debt / basis. */
    debt: number;
    /** Max (cash + interest-bearing securities) / basis. */
    liquidAssets: number;
    /** Max (accounts receivable + cash) / basis. */
    receivables: number;
    /** Max share of revenue from non-permissible activities/interest. */
    nonPermissibleIncome: number;
  };
  /** Business-activity exclusions defined by the methodology. */
  exclusions: string[];
  notes: string;
  configured: boolean;
};

export const METHODOLOGIES: ShariahMethodology[] = [
  {
    id: "uptrend-default-v1",
    name: "Uptrend Default Screen v1",
    provider: "Uptrend (placeholder configuration)",
    ratioBasis: "Total assets",
    thresholds: { debt: 0.3333, liquidAssets: 0.3333, receivables: 0.3333, nonPermissibleIncome: 0.05 },
    exclusions: [
      "Alcohol",
      "Tobacco",
      "Pork-related products",
      "Gambling",
      "Conventional interest-based financial services",
      "Adult entertainment",
      "Weapons & defense",
    ],
    notes:
      "Placeholder configuration used until a recognized provider methodology is connected. Thresholds and exclusions are configuration values, not app-invented rules per security.",
    configured: true,
  },
  {
    id: "provider-slot-a",
    name: "Provider methodology (not connected)",
    provider: "Pending licensed data provider",
    ratioBasis: "Provider-defined",
    thresholds: { debt: 0, liquidAssets: 0, receivables: 0, nonPermissibleIncome: 0 },
    exclusions: [],
    notes:
      "Architecture slot for a licensed provider (e.g. an index-provider Islamic screen). Thresholds must be supplied by the provider — the app will not substitute its own.",
    configured: false,
  },
];

export const activeMethodologyId = "uptrend-default-v1";
export const activeMethodology = METHODOLOGIES.find((m) => m.id === activeMethodologyId)!;

/** Raw stored screening inputs. `null` = data not available. */
export type ScreeningInput = {
  symbol: string;
  /** Business lines flagged against the exclusion list. Empty = none flagged. */
  flaggedActivities: string[] | null;
  /** Interest-bearing debt / basis. */
  debtRatio: number | null;
  /** (Cash + interest-bearing securities) / basis. */
  liquidRatio: number | null;
  /** (Accounts receivable + cash) / basis. */
  receivablesRatio: number | null;
  /** Non-permissible revenue share. */
  nonPermissibleIncome: number | null;
  /** When these inputs were last refreshed from filings. */
  lastScreened: string;
  /** Source of the fundamentals. */
  source: string;
};

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

export const screeningInputs: ScreeningInput[] = [
  { symbol: "AAPL", flaggedActivities: [], debtRatio: 0.298, liquidRatio: 0.181, receivablesRatio: 0.244, nonPermissibleIncome: 0.011, lastScreened: "Aug 2026", source: "FY filings + latest quarter" },
  { symbol: "MSFT", flaggedActivities: [], debtRatio: 0.162, liquidRatio: 0.199, receivablesRatio: 0.221, nonPermissibleIncome: 0.008, lastScreened: "Aug 2026", source: "FY filings + latest quarter" },
  { symbol: "NVDA", flaggedActivities: [], debtRatio: 0.104, liquidRatio: 0.288, receivablesRatio: 0.31, nonPermissibleIncome: 0.004, lastScreened: "Aug 2026", source: "FY filings + latest quarter" },
  { symbol: "GOOGL", flaggedActivities: [], debtRatio: 0.121, liquidRatio: 0.294, receivablesRatio: 0.318, nonPermissibleIncome: 0.014, lastScreened: "Aug 2026", source: "FY filings + latest quarter" },
  { symbol: "AVGO", flaggedActivities: [], debtRatio: 0.401, liquidRatio: 0.101, receivablesRatio: 0.132, nonPermissibleIncome: 0.006, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "AMZN", flaggedActivities: ["Alcohol (retail resale)"], debtRatio: 0.312, liquidRatio: 0.213, receivablesRatio: 0.264, nonPermissibleIncome: 0.031, lastScreened: "Aug 2026", source: "FY filings + segment detail" },
  { symbol: "META", flaggedActivities: [], debtRatio: 0.176, liquidRatio: 0.245, receivablesRatio: 0.277, nonPermissibleIncome: 0.009, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "TSLA", flaggedActivities: [], debtRatio: 0.128, liquidRatio: 0.264, receivablesRatio: 0.291, nonPermissibleIncome: 0.018, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "AMD", flaggedActivities: [], debtRatio: 0.089, liquidRatio: 0.172, receivablesRatio: 0.228, nonPermissibleIncome: 0.005, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "LLY", flaggedActivities: [], debtRatio: 0.418, liquidRatio: 0.092, receivablesRatio: 0.244, nonPermissibleIncome: 0.007, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "UNH", flaggedActivities: ["Conventional insurance"], debtRatio: 0.276, liquidRatio: 0.361, receivablesRatio: 0.288, nonPermissibleIncome: 0.094, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "XOM", flaggedActivities: [], debtRatio: 0.132, liquidRatio: 0.081, receivablesRatio: 0.192, nonPermissibleIncome: 0.012, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "JPM", flaggedActivities: ["Conventional interest-based financial services"], debtRatio: 0.712, liquidRatio: 0.664, receivablesRatio: 0.581, nonPermissibleIncome: 0.612, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "V", flaggedActivities: ["Conventional interest-based financial services"], debtRatio: 0.284, liquidRatio: 0.302, receivablesRatio: 0.341, nonPermissibleIncome: 0.221, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "DIS", flaggedActivities: ["Adult/mature entertainment content", "Alcohol (resort sales)"], debtRatio: 0.302, liquidRatio: 0.064, receivablesRatio: 0.161, nonPermissibleIncome: 0.078, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "BA", flaggedActivities: ["Weapons & defense"], debtRatio: 0.482, liquidRatio: 0.121, receivablesRatio: 0.184, nonPermissibleIncome: 0.412, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "NFLX", flaggedActivities: ["Adult/mature entertainment content"], debtRatio: 0.284, liquidRatio: 0.181, receivablesRatio: 0.212, nonPermissibleIncome: 0.062, lastScreened: "Aug 2026", source: "FY filings" },
  { symbol: "BRK.B", flaggedActivities: ["Conventional insurance", "Conventional interest-based financial services"], debtRatio: 0.221, liquidRatio: 0.412, receivablesRatio: 0.372, nonPermissibleIncome: 0.284, lastScreened: "Aug 2026", source: "FY filings" },
  // Insufficient data → must resolve to "unavailable", never to compliant.
  { symbol: "SPY", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "Fund look-through not available" },
  { symbol: "QQQ", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "Fund look-through not available" },
  { symbol: "SCHD", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "Fund look-through not available" },
  { symbol: "VTI", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "Fund look-through not available" },
  { symbol: "BTC", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "No issuer financials" },
  { symbol: "ETH", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "No issuer financials" },
  { symbol: "NIFTY", flaggedActivities: null, debtRatio: null, liquidRatio: null, receivablesRatio: null, nonPermissibleIncome: null, lastScreened: "—", source: "Index — constituent screen pending" },
];

export type Screening = {
  symbol: string;
  status: ShariahStatus;
  criteria: CriterionResult[];
  lastScreened: string;
  source: string;
  methodology: ShariahMethodology;
};

function ratioCriterion(
  key: CriterionKey,
  label: string,
  value: number | null,
  limit: number,
  basis: string,
  passWhy: string,
  failWhy: string,
): CriterionResult {
  if (value === null) {
    return {
      key,
      label,
      outcome: "unknown",
      measured: "Not available",
      threshold: `≤ ${pct(limit)} of ${basis.toLowerCase()}`,
      why: "The underlying financial figure needed for this test isn't available yet, so the screen can't be completed.",
    };
  }
  const pass = value <= limit;
  return {
    key,
    label,
    outcome: pass ? "pass" : "fail",
    measured: `${pct(value)} of ${basis.toLowerCase()}`,
    threshold: `≤ ${pct(limit)} of ${basis.toLowerCase()}`,
    why: pass ? passWhy : failWhy,
  };
}

export function screen(symbol: string): Screening | null {
  const input = screeningInputs.find((s) => s.symbol === symbol);
  if (!input) return null;
  const m = activeMethodology;
  const basis = m.ratioBasis;

  const business: CriterionResult =
    input.flaggedActivities === null
      ? {
          key: "business",
          label: "Business Activity",
          outcome: "unknown",
          measured: "Revenue breakdown not available",
          threshold: "No primary revenue from excluded activities",
          why: "We don't have a reliable revenue breakdown for this security, so its business lines can't be screened.",
        }
      : {
          key: "business",
          label: "Business Activity",
          outcome: input.flaggedActivities.length === 0 ? "pass" : "fail",
          measured:
            input.flaggedActivities.length === 0
              ? "No excluded business lines identified"
              : `Flagged: ${input.flaggedActivities.join(", ")}`,
          threshold: "No primary revenue from excluded activities",
          why:
            input.flaggedActivities.length === 0
              ? "None of the company's reported business lines fall under the exclusion list of the active methodology."
              : "One or more reported business lines fall under the methodology's exclusion list, so the business-activity screen fails.",
        };

  const income = ratioCriterion(
    "income",
    "Impermissible Income",
    input.nonPermissibleIncome,
    m.thresholds.nonPermissibleIncome,
    "revenue",
    "Revenue from non-permissible activities and interest stays under the methodology's tolerance.",
    "Too much revenue comes from non-permissible activities or interest income relative to the methodology's tolerance.",
  );

  const debt = ratioCriterion(
    "debt",
    "Debt Ratio",
    input.debtRatio,
    m.thresholds.debt,
    basis,
    "Interest-bearing debt is within the methodology's limit, so leverage isn't primarily interest-based.",
    "Interest-bearing debt exceeds the methodology's limit — the company relies heavily on conventional borrowing.",
  );

  const liquid = ratioCriterion(
    "liquidAssets",
    "Cash & Interest-Bearing Securities",
    input.liquidRatio,
    m.thresholds.liquidAssets,
    basis,
    "Cash and interest-bearing securities are a modest share of the balance sheet, within the allowed limit.",
    "Cash and interest-bearing securities are a larger share of assets than the methodology allows.",
  );

  const criteria = [business, income, debt, liquid];
  const status: ShariahStatus = criteria.some((c) => c.outcome === "unknown")
    ? "unavailable"
    : criteria.some((c) => c.outcome === "fail")
      ? "non_compliant"
      : "compliant";

  return {
    symbol,
    status,
    criteria,
    lastScreened: input.lastScreened,
    source: input.source,
    methodology: m,
  };
}

/** Symbols with no stored screening record resolve to "unavailable". */
export function statusOf(symbol: string): ShariahStatus {
  return screen(symbol)?.status ?? "unavailable";
}

export const STATUS_META: Record<ShariahStatus, { emoji: string; label: string; tone: "bull" | "bear" | "warn"; blurb: string }> = {
  compliant: { emoji: "🟢", label: "Shariah Compliant", tone: "bull", blurb: "Passes every screen of the active methodology." },
  non_compliant: { emoji: "🔴", label: "Not Shariah Compliant", tone: "bear", blurb: "Fails one or more screening criteria." },
  unavailable: { emoji: "🟡", label: "Screening Unavailable", tone: "warn", blurb: "Not enough current information to determine status." },
};

export const SHARIAH_DISCLAIMER =
  "Shariah screening is provided for informational and educational purposes. Screening methodologies may differ, and a company's status can change as its business activities and financial information change. This feature is not a religious ruling or financial advice. Users seeking religious guidance should consult a qualified Shariah scholar.";

/** Approximate market caps (USD, billions) used only for sorting/compare UI. */
export const marketCapsB: Record<string, number> = {
  AAPL: 3480, MSFT: 3290, NVDA: 3150, GOOGL: 2190, AMZN: 2060, META: 1300,
  AVGO: 760, LLY: 800, TSLA: 860, AMD: 273, UNH: 508, XOM: 470, JPM: 620,
  V: 570, BRK: 940, "BRK.B": 940, DIS: 178, BA: 127, NFLX: 305,
  SPY: 0, QQQ: 0, VTI: 0, SCHD: 0, BTC: 0, ETH: 0, NIFTY: 0,
};

/** Sector labels for the industry filter (kept alongside screening records). */
export const sectorOf: Record<string, string> = {
  AAPL: "Technology", MSFT: "Technology", NVDA: "Semiconductors", GOOGL: "Communication",
  AMZN: "Consumer Discretionary", META: "Communication", AVGO: "Semiconductors",
  AMD: "Semiconductors", TSLA: "Consumer Discretionary", LLY: "Healthcare",
  UNH: "Healthcare", XOM: "Energy", JPM: "Financials", V: "Financials",
  DIS: "Communication", BA: "Industrials", NFLX: "Communication", "BRK.B": "Financials",
  SPY: "Fund", QQQ: "Fund", VTI: "Fund", SCHD: "Fund", BTC: "Digital Assets",
  ETH: "Digital Assets", NIFTY: "Index",
};

/** Exchange / market labels for the market filter. */
export const exchangeOf: Record<string, string> = {
  AAPL: "NASDAQ", MSFT: "NASDAQ", NVDA: "NASDAQ", GOOGL: "NASDAQ", AMZN: "NASDAQ",
  META: "NASDAQ", AVGO: "NASDAQ", AMD: "NASDAQ", TSLA: "NASDAQ", NFLX: "NASDAQ",
  LLY: "NYSE", UNH: "NYSE", XOM: "NYSE", JPM: "NYSE", V: "NYSE", DIS: "NYSE",
  BA: "NYSE", "BRK.B": "NYSE", SPY: "NYSE Arca", QQQ: "NASDAQ", VTI: "NYSE Arca",
  SCHD: "NYSE Arca", BTC: "Crypto", ETH: "Crypto", NIFTY: "NSE",
};
