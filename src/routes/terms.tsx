import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import { GlassCard } from "@/components/ui-kit";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Uptrend" },
      {
        name: "description",
        content:
          "The terms that govern use of Uptrend: real and demo accounts, market data, your holdings, and the limits of what this platform provides.",
      },
      { property: "og:title", content: "Terms & Conditions — Uptrend" },
      {
        property: "og:description",
        content: "Read the Uptrend Terms & Conditions before you create an account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Terms,
});

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Acceptance of these terms",
    body: [
      "By creating an account, opening a demo workspace, or otherwise using Uptrend, you confirm that you have read these Terms & Conditions and agree to be bound by them. If you do not agree, please do not use the platform.",
      "These terms apply to every visitor, demo user and registered account holder.",
    ],
  },
  {
    heading: "2. Not investment advice",
    body: [
      "Uptrend is an information and tracking tool. Nothing shown anywhere in the app — dashboards, charts, alerts, news summaries, goal allocations, or answers from the UpBot assistant — is investment advice, a recommendation, an offer, or a solicitation to buy or sell any security.",
      "UpBot's answers are generated automatically from the data available to it and can be wrong or out of date. Always do your own research and, where appropriate, consult a licensed financial adviser before acting.",
      "You alone are responsible for your investment decisions and for any losses that result from them.",
    ],
  },
  {
    heading: "3. Demo accounts",
    body: [
      "A demo workspace contains sample figures only. It holds no real money, no real positions and no bank details, and nothing entered there is saved to your personal account or used for anything.",
      "Demo numbers exist to show how the interface behaves. They must never be treated as a record of real holdings or real performance.",
    ],
  },
  {
    heading: "4. Real accounts and your responsibilities",
    body: [
      "You must give accurate information when registering, keep your password confidential, and tell us promptly if you believe your account has been accessed without your permission.",
      "You are responsible for everything done under your account. Uptrend is for personal, lawful use by an adult who is legally able to enter into these terms.",
    ],
  },
  {
    heading: "5. Bank details",
    body: [
      "Bank details are collected only for a real account, are stored against your own user record, and are visible to you alone — access is restricted at the database level so no other user, and no demo session, can read them.",
      "Uptrend is not a bank and does not hold, move, or transfer your money. Providing bank details does not authorise any payment, debit, or transfer.",
      "Only supply details you are entitled to supply, and never the bank details of another person.",
    ],
  },
  {
    heading: "6. Market data",
    body: [
      "Prices come from third-party market-data providers and are not guaranteed to be accurate, complete, or real-time. Quotes may be delayed, and a symbol may be missing or wrong.",
      "Market data is provided for information only. Do not base a trade on a price shown here without checking it against your broker or an official exchange source.",
    ],
  },
  {
    heading: "7. Your content and your holdings",
    body: [
      "The holdings, watchlists, alerts and settings you record belong to you. They are stored so the app can show your own portfolio, and they are not shared with other users.",
      "You agree not to use the platform to upload unlawful, misleading, or infringing material, and not to attempt to disrupt it, scrape it at scale, or access another user's data.",
    ],
  },
  {
    heading: "8. Availability and changes",
    body: [
      "The service is provided \"as is\" and \"as available\", without warranties of any kind. Features may be added, changed, or removed, and the service may be unavailable at times.",
      "We may update these terms. The revised date below shows when they last changed; continuing to use Uptrend after an update means you accept the revised terms.",
    ],
  },
  {
    heading: "9. Limitation of liability",
    body: [
      "To the fullest extent permitted by law, Uptrend is not liable for any loss — including lost profits, lost data, or any trading loss — arising from your use of, or inability to use, the service, or from relying on information shown in it.",
    ],
  },
  {
    heading: "10. Contact",
    body: [
      "Questions about these terms can be sent to the account owner through the app's profile and settings area.",
    ],
  },
];

function Terms() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <img src={uptrendLogo.url} alt="Uptrend logo" width={44} height={44} className="h-11 w-11 object-contain" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Up
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-fuchsia-400 bg-clip-text text-transparent">
                trend
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">Invest Smarter, Grow Faster</p>
          </div>
        </div>

        <GlassCard glow="sky">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-500/20 text-sky-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Terms &amp; Conditions</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The rules that apply when you use Uptrend, whether in a demo workspace or with a real account.
              </p>
              <p className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">Last updated 11 October 2026</p>
            </div>
          </div>
        </GlassCard>

        <div className="mt-5 space-y-4">
          {SECTIONS.map((s) => (
            <GlassCard key={s.heading} glow="none" className="p-4">
              <h3 className="text-sm font-semibold text-foreground">{s.heading}</h3>
              {s.body.map((p, i) => (
                <p key={i} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </GlassCard>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:border-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" /> Back to sign up
          </Link>
          <p className="text-[11px] text-muted-foreground">Uptrend — for information and personal use only.</p>
        </div>
      </div>
    </div>
  );
}
