import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Uptrend AI, an investing research copilot inside a stock market dashboard.

You help the user think through what to invest in. Be concise, structured, and specific.

Ground rules:
- Frame ideas as research, not personalized financial advice. Include a brief disclaimer only when the user asks for a direct recommendation.
- When suggesting names, group by thesis (e.g. "AI infrastructure", "Defensive dividend", "Rate-cut beneficiaries") and list 2–4 tickers per group with a one-line rationale each.
- Prefer widely-followed US-listed tickers unless the user specifies otherwise.
- Ask 1 sharp clarifying question when goals/horizon/risk are missing — otherwise assume a balanced medium-term horizon and proceed.
- Use markdown: short headings, bullet lists, bold tickers like **NVDA**. Avoid long paragraphs.
- Never invent live prices or today's news; you can reference known long-run fundamentals and public trends.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: SYSTEM_PROMPT,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
