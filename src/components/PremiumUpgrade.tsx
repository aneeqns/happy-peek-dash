import { Check, Crown, Sparkles } from "lucide-react";

const FEATURES = [
  { title: "Premium analytics", desc: "Factor exposures, drawdown, Sharpe & Sortino on your book." },
  { title: "AI investing assistant", desc: "Unlimited Uptrend AI with live research, screening & thesis drafts." },
  { title: "Smart alerts++", desc: "Multi-condition rules, options flow, insider filings, earnings whispers." },
  { title: "Community picks", desc: "Follow top investors, share theses, copy watchlists." },
  { title: "Portfolio insights+", desc: "Backtests, benchmark blending, tax-lot P/L & optimization suggestions." },
  { title: "Real-time streaming", desc: "Sub-second quotes across 60+ exchanges, no delay." },
];

const PLANS = [
  { name: "Starter", price: "$0", tag: "Free forever", features: ["Live dashboard", "1 watchlist", "Basic alerts"], cta: "Current plan", highlight: false },
  { name: "Pro", price: "$14", tag: "/ month", features: ["Everything in Starter", "Smart alerts++", "Portfolio insights", "AI assistant (500 msgs/mo)"], cta: "Upgrade to Pro", highlight: true },
  { name: "Edge", price: "$39", tag: "/ month", features: ["Everything in Pro", "Real-time streaming", "Options & insider flow", "Unlimited AI"], cta: "Go Edge", highlight: false },
];

export function PremiumUpgrade() {
  return (
    <section id="premium" className="mt-6 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-[image:var(--gradient-surface)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent">
              <Crown className="h-3.5 w-3.5" /> Tickr Premium
            </div>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Trade with an edge, not on vibes.
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Unlock institutional-grade analytics, unlimited AI research, and instant alerts across every market.
            </p>
          </div>
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-bull">
            <Sparkles className="mr-1 inline h-3.5 w-3.5" /> 14-day free trial
          </span>
        </div>

        {/* Feature grid */}
        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border/60 bg-background/40 p-4 backdrop-blur transition hover:border-primary/40"
            >
              <div className="flex items-center gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-bull">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <p className="text-sm font-semibold">{f.title}</p>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Plans */}
        <div className="relative mt-6 grid gap-4 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`relative rounded-2xl border p-5 ${
                p.highlight
                  ? "border-primary/60 bg-background/60 shadow-[var(--shadow-glow)]"
                  : "border-border bg-background/30"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-2 right-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  Most popular
                </span>
              )}
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{p.name}</p>
              <p className="mt-2 font-mono-nums">
                <span className="text-3xl font-semibold">{p.price}</span>
                <span className="ml-1 text-xs text-muted-foreground">{p.tag}</span>
              </p>
              <ul className="mt-4 space-y-1.5 text-xs">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-bull" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-5 w-full rounded-lg py-2 text-sm font-semibold transition ${
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border bg-surface text-foreground hover:border-primary/50"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
