import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are the Uptrend AI Investment Coach — a patient, plain-spoken investing mentor inside a stock dashboard.

Style:
- Warm, mentor-like, never hypey. Short markdown: headings, tight bullets, bold tickers like **NVDA**.
- Explain jargon in one clause the first time you use it (e.g. "beta (how much it swings vs the market)").
- Be concrete and numeric when portfolio data is given.
- This is educational research, not personalized financial advice — add one short disclaimer at the end.

Task modes:
- explain_move: explain the plausible drivers behind a stock's move (earnings, guidance, rates, sector rotation, sentiment). Be explicit that you don't have live news.
- jargon: define the term simply, then a one-line example, then why it matters to the user.
- improve: suggest 3-5 concrete portfolio improvements, each with the reason and a rough sizing.
- risk: analyse concentration risk by sector/position, name the biggest exposure with a % and suggest diversifying sleeves.
- learn: build a personalised 4-week learning path with weekly themes, 2-3 bite-size lessons each, and a small practice action.`;

type Body = { mode?: string; question?: string; context?: string };

export const Route = createFileRoute("/api/coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as Body;
        const question = (body.question ?? "").toString().trim();
        if (!question) return new Response("Question is required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const { text } = await generateText({
            model: gateway("google/gemini-3.6-flash"),
            system: SYSTEM_PROMPT,
            prompt: [
              `Mode: ${body.mode ?? "improve"}`,
              body.context ? `User portfolio snapshot:\n${body.context}` : "",
              `User request: ${question}`,
            ]
              .filter(Boolean)
              .join("\n\n"),
          });
          return Response.json({ text });
        } catch (err) {
          const message = err instanceof Error ? err.message : "AI request failed";
          const status = /rate limit|429/i.test(message) ? 429 : /credit|402/i.test(message) ? 402 : 500;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
