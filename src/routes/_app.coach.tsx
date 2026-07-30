import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, BookOpen, GraduationCap, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { GlassCard, PageHeader, Pill, ProgressBar, SectionTitle } from "@/components/ui-kit";
import { useAuth } from "@/lib/auth";
import { positions } from "@/lib/market-data";

export const Route = createFileRoute("/_app/coach")({
  head: () => ({
    meta: [
      { title: "AI Investment Coach — Uptrend" },
      {
        name: "description",
        content:
          "A personal AI investing mentor: explains stock moves, simplifies jargon, suggests portfolio improvements, flags concentration risk and builds a learning path.",
      },
      { property: "og:title", content: "AI Investment Coach — Uptrend" },
      { property: "og:description", content: "Your personal AI investing mentor inside Uptrend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoachPage,
});

const SECTOR_OF: Record<string, string> = {
  NVDA: "IT",
  AAPL: "IT",
  MSFT: "IT",
  TSLA: "Consumer",
  SCHD: "Diversified ETF",
};

function useExposure() {
  const rows = positions.map((p) => ({ ...p, value: p.qty * p.price, sector: SECTOR_OF[p.symbol] ?? "Other" }));
  const total = rows.reduce((s, r) => s + r.value, 0);
  const bySector = new Map<string, number>();
  for (const r of rows) bySector.set(r.sector, (bySector.get(r.sector) ?? 0) + r.value);
  const sectors = [...bySector.entries()]
    .map(([sector, value]) => ({ sector, pct: (value / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
  return { rows, total, sectors };
}

type Mode = "explain_move" | "jargon" | "improve" | "risk" | "learn";

const MODES: { id: Mode; label: string; icon: typeof Sparkles; placeholder: string; hint: string }[] = [
  { id: "explain_move", label: "Why is it moving?", icon: TrendingUp, placeholder: "Why is NVDA down 4% this week?", hint: "Explains the likely drivers behind a stock's move." },
  { id: "jargon", label: "Explain jargon", icon: BookOpen, placeholder: "What does P/E ratio actually mean?", hint: "Turns financial jargon into plain English." },
  { id: "improve", label: "Improve my portfolio", icon: Lightbulb, placeholder: "How can I improve my portfolio for a 5-year horizon?", hint: "Concrete, sized suggestions based on your holdings." },
  { id: "risk", label: "Concentration risk", icon: AlertTriangle, placeholder: "Am I too concentrated? What should I do?", hint: "Flags over-exposure and suggests diversifying sleeves." },
  { id: "learn", label: "Learning path", icon: GraduationCap, placeholder: "Build me a 4-week plan to understand valuation.", hint: "A personalised, bite-size curriculum." },
];

function CoachPage() {
  const { user } = useAuth();
  const { rows, total, sectors } = useExposure();
  const top = sectors[0];

  const [mode, setMode] = useState<Mode>("improve");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const active = MODES.find((m) => m.id === mode)!;

  const context = [
    `Total portfolio value: $${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
    `Holdings: ${rows.map((r) => `${r.symbol} ${((r.value / total) * 100).toFixed(1)}%`).join(", ")}`,
    `Sector mix: ${sectors.map((s) => `${s.sector} ${s.pct.toFixed(1)}%`).join(", ")}`,
    user ? `Investor: ${user.name} (${user.plan} plan)` : "",
  ]
    .filter(Boolean)
    .join("\n");

  async function ask(q: string) {
    const text = q.trim() || active.placeholder;
    if (loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, question: text, context }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (!res.ok) {
        setError(
          res.status === 429
            ? "The coach is rate-limited right now — try again in a moment."
            : res.status === 402
              ? "AI credits are exhausted for this workspace."
              : data.error || "Something went wrong. Please try again.",
        );
        return;
      }
      setAnswer(data.text ?? "");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Investment Coach"
        subtitle="Your personal investing mentor — moves explained, jargon simplified, portfolio coached."
        accent="from-amber-400 via-rose-400 to-violet-400"
      />

      <GlassCard className="bg-gradient-to-br from-amber-500/15 to-rose-500/5" glow="amber">
        <SectionTitle icon={<AlertTriangle className="h-4 w-4 text-warn" />} right={<Pill tone={top && top.pct > 50 ? "warn" : "bull"}>{top ? `${top.sector} ${top.pct.toFixed(0)}%` : "—"}</Pill>}>
          Concentration snapshot
        </SectionTitle>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {sectors.map((s) => (
            <div key={s.sector}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{s.sector}</span>
                <span className="font-semibold">{s.pct.toFixed(1)}%</span>
              </div>
              <ProgressBar pct={s.pct} tone={s.pct > 50 ? "warn" : "info"} />
            </div>
          ))}
        </div>
        {top && top.pct > 40 && (
          <p className="mt-4 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-xs">
            Your portfolio is <strong>{top.pct.toFixed(0)}% in {top.sector}</strong>. Consider diversifying into banking or FMCG to reduce risk.
          </p>
        )}
      </GlassCard>

      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-sky-500/5" glow="violet">
        <SectionTitle icon={<Sparkles className="h-4 w-4 text-primary" />}>Ask your coach</SectionTitle>

        <div className="mt-3 flex flex-wrap gap-2">
          {MODES.map((m) => {
            const Icon = m.icon;
            const on = m.id === mode;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setQuestion("");
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  on ? "border-primary/70 bg-primary/20 text-foreground" : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{active.hint}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void ask(question);
          }}
          className="mt-3 flex flex-col gap-2 sm:flex-row"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={active.placeholder}
            className="flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Coaching…" : "Ask coach"}
          </button>
        </form>

        {loading && <p className="mt-4 animate-pulse text-sm text-muted-foreground">Your coach is thinking…</p>}
        {error && <p className="mt-4 rounded-md border border-bear/40 bg-bear/10 px-3 py-2 text-xs text-bear">{error}</p>}
        {answer && (
          <div className="prose prose-sm prose-invert mt-4 max-w-none rounded-xl border border-border bg-surface p-4 prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1.5 prose-li:my-0.5 prose-strong:text-bull">
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
