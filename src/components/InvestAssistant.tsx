import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import upbotCharacter from "@/assets/upbot-character.png.asset.json";

const STARTERS = [
  "Where should I invest $5k for 3 years?",
  "Best AI infrastructure plays right now?",
  "Dividend stocks for a defensive portfolio",
  "How would you position for rate cuts?",
];

export function InvestAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, messages.length]);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    await sendMessage({ text: trimmed });
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-lime-500 py-2 pl-2 pr-4 text-sm font-semibold text-emerald-950 shadow-[0_0_30px_rgba(16,185,129,0.6)] transition hover:scale-[1.03]"
      >
        <img src={upbotCharacter.url} alt="" width={32} height={32} className="h-8 w-8 rounded-full bg-black/20 object-contain" />
        Ask UpBot
      </button>

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-[image:var(--gradient-surface)] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sky-500/30 to-emerald-500/30 p-1 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <img src={upbotCharacter.url} alt="UpBot" width={40} height={40} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">UpBot</p>
            <p className="text-[11px] text-muted-foreground">
              Your AI investing companion · not financial advice
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
          {messages.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                I can help you research tickers, sectors, and portfolio ideas. Try one of these:
              </p>
              <div className="grid gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm text-foreground transition hover:border-primary/60 hover:bg-surface-elevated"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ul className="space-y-4">
            {messages.map((m: UIMessage) => (
              <Bubble key={m.id} message={m} />
            ))}
            {status === "submitted" && <TypingBubble />}
          </ul>

          {error && (
            <p className="mt-3 rounded-md border border-bear/40 bg-bear/10 px-3 py-2 text-xs text-bear">
              {error.message || "Something went wrong. Please try again."}
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit(input);
          }}
          className="border-t border-border/60 p-3"
        >
          <div className="flex items-end gap-2 rounded-xl border border-border bg-surface p-2 focus-within:border-primary/60">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void submit(input);
                }
              }}
              rows={1}
              placeholder="Ask about tickers, sectors, or strategies…"
              className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">
            Educational research only. Not personalized investment advice.
          </p>
        </form>
      </div>

      {/* Backdrop */}
      {open && (
        <button
          aria-label="Close chat"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
        />
      )}
    </>
  );
}

function Bubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");
  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface text-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-bull">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}
      </div>
    </li>
  );
}

function TypingBubble() {
  return (
    <li className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-3.5 py-3">
        <Dot delay="0s" />
        <Dot delay="0.15s" />
        <Dot delay="0.3s" />
      </div>
    </li>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
      style={{ animationDelay: delay }}
    />
  );
}
