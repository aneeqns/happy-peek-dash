import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Landmark, Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import { GlassCard } from "@/components/ui-kit";
import { supabase } from "@/integrations/supabase/client";
import { accountSetupState, bankSchema, usernameSchema } from "@/lib/account";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/finish-setup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Finish setting up your Uptrend account" },
      {
        name: "description",
        content: "Confirm your Uptrend username and add your bank account details to finish setting up your account.",
      },
      { property: "og:title", content: "Finish setting up your Uptrend account" },
      { property: "og:description", content: "Confirm your username and link your bank account to start investing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FinishSetup,
});

const inputClass =
  "mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-emerald-400";

function FinishSetup() {
  const navigate = useNavigate();
  const { startRealSession } = useAuth();

  const [loading, setLoading] = useState(true);
  const [needsUsername, setNeedsUsername] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [holder, setHolder] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ibanOrRouting, setIbanOrRouting] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const setup = await accountSetupState();
      if (cancelled) return;
      if (!setup) {
        navigate({ to: "/auth", replace: true });
        return;
      }
      startRealSession();
      if (!setup.needsUsername && !setup.needsBank) {
        navigate({ to: "/dashboard", replace: true });
        return;
      }
      setEmail(setup.email);
      setNeedsUsername(setup.needsUsername);
      setUsername(setup.username ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, startRealSession]);

  const save = async () => {
    setError(null);

    if (needsUsername) {
      const parsed = usernameSchema.safeParse(username);
      if (!parsed.success) return setError(parsed.error.issues[0].message);
    }

    const parsedBank = bankSchema.safeParse({
      account_holder: holder,
      bank_name: bankName,
      account_number: accountNumber,
      iban_or_routing: ibanOrRouting,
    });
    if (!parsedBank.success) return setError(parsedBank.error.issues[0].message);

    setBusy(true);
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) {
      setBusy(false);
      navigate({ to: "/auth", replace: true });
      return;
    }

    if (needsUsername) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username: username.trim() })
        .eq("id", user.id);
      if (profileError) {
        setBusy(false);
        return setError(
          profileError.code === "23505"
            ? "That username is already taken — try another one."
            : "We couldn't save your username. Please try again.",
        );
      }
    }

    const { error: bankError } = await supabase.from("bank_accounts").upsert(
      {
        user_id: user.id,
        account_holder: parsedBank.data.account_holder,
        bank_name: parsedBank.data.bank_name,
        account_number: parsedBank.data.account_number,
        iban_or_routing: parsedBank.data.iban_or_routing || null,
      },
      { onConflict: "user_id" },
    );
    setBusy(false);
    if (bankError) return setError("We couldn't save your bank details. Please try again.");

    startRealSession();
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute right-0 bottom-10 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <img src={uptrendLogo.url} alt="Uptrend logo" width={44} height={44} className="h-11 w-11 object-contain" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Finish setting up</h1>
            {email && <p className="text-xs text-muted-foreground">Signed in as {email}</p>}
          </div>
        </div>

        <GlassCard glow="emerald">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading your account…
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-emerald-300" />
                <h2 className="text-lg font-semibold">Your bank account</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                These details are stored privately on your account — only you can see them.
              </p>

              <div className="mt-5 space-y-3">
                {needsUsername && (
                  <label className="block text-xs font-medium text-muted-foreground">
                    Choose a username
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alexinvests"
                      maxLength={20}
                      className={inputClass}
                    />
                  </label>
                )}

                <label className="block text-xs font-medium text-muted-foreground">
                  Account holder name
                  <input
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                    placeholder="Alex Morgan"
                    maxLength={120}
                    className={inputClass}
                  />
                </label>

                <label className="block text-xs font-medium text-muted-foreground">
                  Bank name
                  <input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Emirates NBD"
                    maxLength={120}
                    className={inputClass}
                  />
                </label>

                <label className="block text-xs font-medium text-muted-foreground">
                  Account number
                  <input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="1234567890"
                    maxLength={34}
                    className={inputClass}
                  />
                </label>

                <label className="block text-xs font-medium text-muted-foreground">
                  IBAN or routing number (optional)
                  <input
                    value={ibanOrRouting}
                    onChange={(e) => setIbanOrRouting(e.target.value)}
                    placeholder="AE07 0331 2345 6789 0123 456"
                    maxLength={34}
                    className={inputClass}
                  />
                </label>
              </div>

              {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

              <button
                onClick={save}
                disabled={busy}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save and enter Uptrend
              </button>

              <p className="mt-3 flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <Lock className="mt-0.5 h-3 w-3 shrink-0" />
                Uptrend never moves money. Bank details are only used to identify your payout account.
              </p>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
