import { useEffect, useState } from "react";
import { Bell, BellRing, Plus, Trash2, TrendingDown, TrendingUp, Newspaper, Zap } from "lucide-react";

type Condition = "above" | "below" | "change" | "news";
type Alert = {
  id: string;
  symbol: string;
  condition: Condition;
  value: number;
  active: boolean;
  createdAt: number;
  lastTriggered?: number;
};

const STORAGE_KEY = "tickr.alerts.v1";

const SEED: Alert[] = [
  { id: "s1", symbol: "NVDA", condition: "above", value: 1350, active: true, createdAt: Date.now() - 86400_000 * 2 },
  { id: "s2", symbol: "TSLA", condition: "below", value: 240, active: true, createdAt: Date.now() - 86400_000 },
  { id: "s3", symbol: "AAPL", condition: "change", value: 3, active: false, createdAt: Date.now() - 3600_000 * 5, lastTriggered: Date.now() - 3600_000 * 2 },
  { id: "s4", symbol: "SPY", condition: "news", value: 0, active: true, createdAt: Date.now() - 3600_000 },
];

function loadAlerts(): Alert[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Alert[];
    return Array.isArray(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

export function SmartAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>(SEED);
  const [hydrated, setHydrated] = useState(false);
  const [symbol, setSymbol] = useState("");
  const [condition, setCondition] = useState<Condition>("above");
  const [value, setValue] = useState("");

  useEffect(() => {
    setAlerts(loadAlerts());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    } catch {
      /* noop */
    }
  }, [alerts, hydrated]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = symbol.trim().toUpperCase();
    if (!sym) return;
    const numeric = condition === "news" ? 0 : parseFloat(value);
    if (condition !== "news" && (!isFinite(numeric) || numeric <= 0)) return;
    setAlerts((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        symbol: sym,
        condition,
        value: numeric,
        active: true,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setSymbol("");
    setValue("");
  };

  const toggle = (id: string) =>
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  const remove = (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const activeCount = alerts.filter((a) => a.active).length;

  return (
    <section id="alerts" className="mt-6 scroll-mt-24">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold">Smart alerts</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Get notified when tickers cross price levels, move sharply, or hit the news.
          </p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-bull">
          {activeCount} active
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Create form */}
        <form
          onSubmit={add}
          className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:col-span-2"
        >
          <p className="text-sm font-semibold">New alert</p>
          <div className="mt-3 space-y-3">
            <label className="block text-xs">
              <span className="text-muted-foreground">Ticker</span>
              <input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. NVDA"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm uppercase outline-none focus:border-primary/60"
              />
            </label>

            <label className="block text-xs">
              <span className="text-muted-foreground">Condition</span>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Condition)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary/60"
              >
                <option value="above">Price above</option>
                <option value="below">Price below</option>
                <option value="change">% change today</option>
                <option value="news">News mention</option>
              </select>
            </label>

            {condition !== "news" && (
              <label className="block text-xs">
                <span className="text-muted-foreground">
                  {condition === "change" ? "Move %" : "Price ($)"}
                </span>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  type="number"
                  step="0.01"
                  placeholder={condition === "change" ? "e.g. 5" : "e.g. 250"}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono-nums outline-none focus:border-primary/60"
                />
              </label>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Create alert
            </button>
          </div>
          <p className="mt-3 text-[10px] text-muted-foreground">
            Alerts run against the live simulated feed. Persisted to this browser.
          </p>
        </form>

        {/* List */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:col-span-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Your alerts</p>
            <span className="text-xs text-muted-foreground">{alerts.length} total</span>
          </div>

          {alerts.length === 0 ? (
            <div className="mt-6 grid place-items-center rounded-xl border border-dashed border-border py-10 text-center">
              <Bell className="h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No alerts yet. Create your first on the left.</p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border/70">
              {alerts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 py-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-[10px] font-bold">
                    {a.symbol.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{a.symbol}</p>
                    <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <ConditionIcon condition={a.condition} />
                      {conditionLabel(a)}
                    </p>
                  </div>
                  {a.lastTriggered && (
                    <span className="hidden rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-medium text-accent sm:inline">
                      Triggered
                    </span>
                  )}
                  <button
                    onClick={() => toggle(a.id)}
                    className={`relative h-5 w-9 rounded-full transition ${
                      a.active ? "bg-primary" : "bg-muted"
                    }`}
                    aria-label="Toggle"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${
                        a.active ? "left-4" : "left-0.5"
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground hover:text-bear"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function ConditionIcon({ condition }: { condition: Condition }) {
  const cls = "h-3 w-3";
  if (condition === "above") return <TrendingUp className={`${cls} text-bull`} />;
  if (condition === "below") return <TrendingDown className={`${cls} text-bear`} />;
  if (condition === "change") return <Zap className={`${cls} text-accent`} />;
  return <Newspaper className={`${cls} text-muted-foreground`} />;
}

function conditionLabel(a: Alert): string {
  switch (a.condition) {
    case "above": return `Price crosses above $${a.value}`;
    case "below": return `Price drops below $${a.value}`;
    case "change": return `Moves more than ${a.value}% intraday`;
    case "news": return `New headline mentions ticker`;
  }
}
