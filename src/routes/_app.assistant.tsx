import { createFileRoute } from "@tanstack/react-router";
import upbot from "@/assets/upbot-character.png.asset.json";
import { InvestAssistant } from "@/components/InvestAssistant";
import { GlassCard, PageHeader } from "@/components/ui-kit";

export const Route = createFileRoute("/_app/assistant")({
  head: () => ({
    meta: [
      { title: "UpBot AI Assistant — Uptrend" },
      { name: "description", content: "Ask UpBot about tickers, sectors and strategies. It researches ideas and draws charts inline in the chat." },
      { property: "og:title", content: "UpBot AI Assistant — Uptrend" },
      { property: "og:description", content: "Ask UpBot about tickers, sectors and strategies — with charts drawn inline." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

const IDEAS = [
  "Show me a chart of NVDA over 1Y",
  "Compare AAPL and MSFT momentum",
  "Dividend stocks for a defensive sleeve",
  "How would you position for rate cuts?",
];

function AssistantPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="UpBot" subtitle="Your AI investing companion — research, context and charts on demand." accent="from-violet-400 via-fuchsia-400 to-sky-400" />
      <GlassCard className="bg-gradient-to-br from-violet-500/15 to-sky-500/5" glow="violet">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <img src={upbot.url} alt="UpBot mascot" width={180} height={180} className="w-36 animate-[float_6s_ease-in-out_infinite] object-contain" />
          <div>
            <h2 className="text-lg font-semibold">Open the chat with the “Ask UpBot” button</h2>
            <p className="mt-1 text-sm text-muted-foreground">Try one of these prompts:</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {IDEAS.map((i) => (
                <li key={i} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs">{i}</li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">Educational research only. Not personalized investment advice.</p>
          </div>
        </div>
      </GlassCard>
      <InvestAssistant />
    </div>
  );
}
