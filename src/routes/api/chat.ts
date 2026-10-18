import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { buildSeries } from "@/lib/chart-tool";
import { chatRequestSchema } from '@/lib/ai-request-schemas';

const SYSTEM_PROMPT = `You are Uptrend AI, an investing research copilot inside a stock market dashboard.

You help the user think through what to invest in. Be concise, structured, and specific.

Ground rules:
- Frame ideas as research, not personalized financial advice. Include a brief disclaimer only when the user asks for a direct recommendation.
- When suggesting names, group by thesis (e.g. "AI infrastructure", "Defensive dividend", "Rate-cut beneficiaries") and list 2–4 tickers per group with a one-line rationale each.
- Prefer widely-followed US-listed tickers unless the user specifies otherwise.
- Ask 1 sharp clarifying question when goals/horizon/risk are missing — otherwise assume a balanced medium-term horizon and proceed.
- Use markdown: short headings, bullet lists, bold tickers like **NVDA**. Avoid long paragraphs.
- You can DRAW CHARTS. When the user asks to see a chart/graph/trend/comparison, or when a visual makes the answer clearer, call the \`show_chart\` tool (once per series, up to 3 charts) and then briefly explain what the chart shows. The chart renders itself in the chat — do not describe the axes or paste the numbers.
- Chart data is an illustrative simulated series, not live market data — say so once if the user might mistake it for real quotes.
- Never invent live prices or today's news; you can reference known long-run fundamentals and public trends.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { enforcePublicQuota, readLimitedJson } = await import('@/lib/request-security.server');
        try {
          const denied = await enforcePublicQuota('ai', request);
          if (denied) return denied;
        } catch { return new Response('Request protection is temporarily unavailable.', { status: 503 }); }
        let messages: UIMessage[];
        try {
          const parsed = chatRequestSchema.parse(await readLimitedJson(request, 64000));
          messages = parsed.messages as UIMessage[];
        } catch { return new Response('Invalid or oversized chat request.', { status: 400 }); }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("AI is temporarily unavailable.", { status: 503 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
          stopWhen: stepCountIs(4),
          maxOutputTokens: 2000,
          abortSignal: AbortSignal.timeout(60000),
          tools: {
            show_chart: tool({
              description:
                "Render an interactive chart in the chat for a ticker, index or theme. Use for any request to see a chart, graph, trend, performance or comparison.",
              inputSchema: z.object({
                symbol: z.string().max(32).describe("Ticker or short label, e.g. NVDA, SPY, Energy"),
                title: z.string().max(120).optional().describe("Short chart title"),
                timeframe: z
                  .enum(["1D", "1W", "1M", "6M", "1Y", "5Y"])
                  .optional()
                  .describe("Time window, defaults to 1Y"),
                kind: z.enum(["line", "bar"]).optional().describe("line for price trends, bar for discrete comparisons"),
                trend: z.enum(["up", "down", "flat"]).optional().describe("Overall direction of the illustrative series"),
                unit: z.string().max(12).optional().describe("Value prefix, e.g. $ or %"),
              }),
              execute: async (input) => buildSeries(input),
            }),
          },
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          headers: { 'Cache-Control': 'private, no-store' },
          onError: () => 'AI is temporarily unavailable. Please try again.',
        });
        } catch (error) {
          console.error('[chat] request failed', error);
          return new Response('AI is temporarily unavailable. Please try again.', { status: 503 });
        }
      },
    },
  },
});
