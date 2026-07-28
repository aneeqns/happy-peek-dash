import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bell, Bot, LineChart, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import upbot from "@/assets/upbot-character.png.asset.json";
import { GlassCard, Pill } from "@/components/ui-kit";
import { indices } from "@/lib/market-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Uptrend — Invest Smarter, Grow Faster" },
      {
        name: "description",
        content:
          "Uptrend is an AI-powered market platform: live dashboards, portfolio tracking, smart alerts, goal-based investing and UpBot, your AI research companion.",
      },
      { property: "og:title", content: "Uptrend — Invest Smarter, Grow Faster" },
      {
        property: "og:description",
        content: "Live market dashboards, portfolio insights, smart alerts and UpBot — your AI investing companion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: LineChart, title: "Live market dashboard", body: "Indices, sectors and movers in one colorful, readable view.", tone: "from-emerald-500/20 to-lime-500/5" },
  { icon: Wallet, title: "Portfolio tracking", body: "Positions, P/L, allocation and risk scoring at a glance.", tone: "from-sky-500/20 to-indigo-500/5" },
  { icon: Bell, title: "Smart alerts", body: "Price, %-change and news triggers that watch the tape for you.", tone: "from-amber-500/20 to-orange-500/5" },
  { icon: Bot, title: "UpBot AI assistant", body: "Ask about tickers or strategies — it answers and draws charts.", tone: "from-violet-500/20 to-fuchsia-500/5" },
  { icon: Sparkles, title: "Goal-based investing", body: "Risk-tuned allocations mapped to real life goals.", tone: "from-rose-500/20 to-pink-500/5" },
  { icon: ShieldCheck, title: "Creator workspace", body: "Admin tools for users, content, revenue and platform health.", tone: "from-teal-500/20 to-cyan-500/5" },
];

function Landing() {
  const strip = [...indices, ...indices];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2">
          <img src={uptrendLogo.url} alt="Uptrend logo" width={40} height={40} className="h-10 w-10 object-contain" />
          <span className="text-lg font-bold tracking-tight">
            Up<span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">trend</span>
          </span>
        </div>
        <Link
          to="/auth"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-2 text-sm font-semibold text-emerald-950"
        >
          Open the app <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      {/* Scrolling market strip */}
      <div className="overflow-hidden border-y border-border/60 bg-card/40 py-2 backdrop-blur-xl">
        <div className="flex w-max animate-[ticker_80s_linear_infinite] gap-8 hover:[animation-play-state:paused]">
          {strip.map((i, idx) => (
            <span key={`${i.name}-${idx}`} className="flex items-center gap-3 text-xs">
              <span className="font-semibold">{i.name}</span>
              <span className="font-mono-nums text-muted-foreground">{i.value.toLocaleString()}</span>
              <span className={i.pct >= 0 ? "font-mono-nums text-bull" : "font-mono-nums text-bear"}>
                {i.pct >= 0 ? "+" : ""}
                {i.pct.toFixed(2)}%
              </span>
              <span className="h-3 w-px bg-border/60" />
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text font-semibold text-transparent">
                Invest Smarter, Grow Faster
              </span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <Pill tone="bull">AI-powered market platform</Pill>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Invest smarter with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
              clarity, not noise
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
            Track every market, follow your portfolio in real time, set alerts that actually matter, and let UpBot
            research tickers and draw the charts for you.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-[0_0_40px_-12px_oklch(0.78_0.17_155_/_0.8)]"
            >
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/auth" className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium">
              Explore Creator tools
            </Link>
          </div>
        </div>

        <div className="relative mx-auto max-w-sm">
          <div className="absolute inset-0 -z-10 rounded-full bg-emerald-500/20 blur-3xl" />
          <img
            src={upbot.url}
            alt="UpBot, the Uptrend AI mascot"
            width={420}
            height={420}
            className="w-full animate-[float_6s_ease-in-out_infinite] object-contain"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <h2 className="mb-6 text-xl font-semibold tracking-tight">Everything in one workspace</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <GlassCard key={f.title} className={`bg-gradient-to-br ${f.tone}`}>
              <f.icon className="h-5 w-5 text-foreground/80" />
              <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/60 px-4 py-8 text-center text-xs text-muted-foreground">
        Uptrend · Demo data. Educational use only, not financial advice.
      </footer>
    </div>
  );
}
