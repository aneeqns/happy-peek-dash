import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Loader2, MailCheck, ShieldCheck, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import { GlassCard } from "@/components/ui-kit";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { accountSetupState, emailSchema, passwordSchema, usernameSchema } from "@/lib/account";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your Uptrend account" },
      {
        name: "description",
        content:
          "Create a real Uptrend account with your Gmail address and username, or jump straight into a demo workspace with no signup.",
      },
      { property: "og:title", content: "Create your Uptrend account" },
      { property: "og:description", content: "Real account or instant demo — start tracking markets with Uptrend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Screen = "choice" | "real" | "demo";

function AuthPage() {
  const { ready, mode, effectiveRole } = useAuth();
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("choice");

  useEffect(() => {
    if (ready && mode === "demo") {
      navigate({ to: effectiveRole === "creator" ? "/creator" : "/dashboard", replace: true });
    }
  }, [ready, mode, effectiveRole, navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <img src={uptrendLogo.url} alt="Uptrend logo" width={48} height={48} className="h-12 w-12 object-contain" />
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

        {screen === "choice" && <ChoiceScreen onPick={setScreen} />}
        {screen === "real" && <RealAccount onBack={() => setScreen("choice")} />}
        {screen === "demo" && <DemoAccount onBack={() => setScreen("choice")} />}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/welcome" className="underline underline-offset-4">
            See what Uptrend does
          </Link>
        </p>
      </div>
    </div>
  );
}

function ChoiceScreen({ onPick }: { onPick: (s: Screen) => void }) {
  return (
    <GlassCard glow="emerald">
      <h2 className="text-lg font-semibold">How do you want to start?</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a real account to save your own data, or try a demo workspace with sample money and no signup.
      </p>

      <div className="mt-5 space-y-3">
        <button
          onClick={() => onPick("real")}
          className="flex w-full items-center gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-lime-500/5 p-4 text-left transition hover:scale-[1.01] hover:border-emerald-400"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <BadgeCheck className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Create a real account</span>
            <span className="block text-xs text-muted-foreground">
              Your Gmail, your username and your bank details — saved securely to your account
            </span>
          </span>
        </button>

        <button
          onClick={() => onPick("demo")}
          className="flex w-full items-center gap-4 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/5 p-4 text-left transition hover:scale-[1.01] hover:border-violet-400"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Create a demo account</span>
            <span className="block text-xs text-muted-foreground">
              Instant access with sample data — no real money and no bank details
            </span>
          </span>
        </button>
      </div>
    </GlassCard>
  );
}

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-emerald-400";

function RealAccount({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();
  const { startRealSession } = useAuth();
  const [tab, setTab] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const googleSignIn = async () => {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      setError("Google sign-in didn't work. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    startRealSession();
    const setup = await accountSetupState();
    navigate({ to: !setup || setup.needsUsername || setup.needsBank ? "/finish-setup" : "/dashboard", replace: true });
  };

  const signUp = async () => {
    setError(null);
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return setError(parsedEmail.error.issues[0].message);
    const parsedUsername = usernameSchema.safeParse(username);
    if (!parsedUsername.success) return setError(parsedUsername.error.issues[0].message);
    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) return setError(parsedPassword.error.issues[0].message);

    setBusy(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: parsedEmail.data,
      password: parsedPassword.data,
      options: {
        emailRedirectTo: window.location.origin,
        data: { username: parsedUsername.data, full_name: fullName.trim() },
      },
    });
    setBusy(false);

    if (signUpError) return setError(signUpError.message);

    if (data.session) {
      startRealSession();
      navigate({ to: "/finish-setup", replace: true });
      return;
    }
    setSent(true);
  };

  const signIn = async () => {
    setError(null);
    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) return setError(parsedEmail.error.issues[0].message);
    if (!password) return setError("Enter your password");

    setBusy(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsedEmail.data,
      password,
    });
    if (signInError) {
      setBusy(false);
      return setError(signInError.message);
    }
    startRealSession();
    const setup = await accountSetupState();
    setBusy(false);
    navigate({ to: !setup || setup.needsUsername || setup.needsBank ? "/finish-setup" : "/dashboard", replace: true });
  };

  if (sent) {
    return (
      <GlassCard glow="emerald">
        <MailCheck className="h-6 w-6 text-emerald-300" />
        <h2 className="mt-3 text-lg font-semibold">Confirm your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Open it, then come
          back and sign in — we'll ask for your bank details right after.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setTab("signin");
          }}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 px-4 py-2.5 text-sm font-semibold text-emerald-950"
        >
          I've confirmed — sign in
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard glow="emerald">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface p-1">
        {(["signup", "signin"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setError(null);
            }}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tab === t ? "bg-emerald-500/20 text-emerald-300" : "text-muted-foreground"
            }`}
          >
            {t === "signup" ? "Create account" : "Sign in"}
          </button>
        ))}
      </div>

      <button
        onClick={googleSignIn}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold transition hover:border-emerald-400 disabled:opacity-60"
      >
        Continue with Google
      </button>

      <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or use your Gmail address <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-medium text-muted-foreground">
          Gmail address
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            className={inputClass}
          />
        </label>

        {tab === "signup" && (
          <>
            <label className="block text-xs font-medium text-muted-foreground">
              Username
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alexinvests"
                maxLength={20}
                className={inputClass}
              />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">
              Full name (optional)
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                maxLength={120}
                className={inputClass}
              />
            </label>
          </>
        )}

        <label className="block text-xs font-medium text-muted-foreground">
          Password
          <input
            type="password"
            autoComplete={tab === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

      <button
        onClick={tab === "signup" ? signUp : signIn}
        disabled={busy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        {tab === "signup" ? "Create my account" : "Sign in"}
      </button>

      {tab === "signup" && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Bank details are collected on the next step, right after you confirm your email.
        </p>
      )}
    </GlassCard>
  );
}

function DemoAccount({ onBack }: { onBack: () => void }) {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const enter = (r: Role) => {
    signIn(r);
    navigate({ to: r === "creator" ? "/creator" : "/dashboard", replace: true });
  };

  return (
    <GlassCard glow="violet">
      <button onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <h2 className="text-lg font-semibold">Demo workspace</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sample data only — no real money, no bank details and nothing saved to an account.
      </p>

      <div className="mt-5 space-y-3">
        <button
          onClick={() => enter("customer")}
          className="flex w-full items-center gap-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/20 to-lime-500/5 p-4 text-left transition hover:scale-[1.01] hover:border-emerald-400"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <User className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Demo as Customer</span>
            <span className="block text-xs text-muted-foreground">
              Dashboard, markets, portfolio, watchlists, alerts and UpBot
            </span>
          </span>
        </button>

        <button
          onClick={() => enter("creator")}
          className="flex w-full items-center gap-4 rounded-2xl border border-violet-500/40 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/5 p-4 text-left transition hover:scale-[1.01] hover:border-violet-400"
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Demo as Creator (Admin)</span>
            <span className="block text-xs text-muted-foreground">
              Everything above, plus platform admin tools and a role switcher
            </span>
          </span>
        </button>
      </div>
    </GlassCard>
  );
}
