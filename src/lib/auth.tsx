import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "customer" | "creator";
export type AccountMode = "demo" | "real";

export type DemoUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  plan: "Free" | "Pro" | "Edge";
  joined: string;
  avatarInitials: string;
};

const STORAGE_KEY = "uptrend.demo-auth.v1";

export const DEMO_ACCOUNTS: Record<Role, DemoUser> = {
  customer: {
    id: "usr_8842",
    name: "Alex Morgan",
    email: "alex@uptrend.app",
    role: "customer",
    plan: "Pro",
    joined: "Mar 2026",
    avatarInitials: "AM",
  },
  creator: {
    id: "usr_0001",
    name: "Uptrend Creator",
    email: "creator@uptrend.app",
    role: "creator",
    plan: "Edge",
    joined: "Jan 2026",
    avatarInitials: "UC",
  },
};

type Stored = { mode: AccountMode; role: Role; viewAs: Role };

type AuthValue = {
  /** Hydration flag — auth state is read from local storage on the client. */
  ready: boolean;
  /** "demo" = mock workspace, "real" = a genuine signed-in account. */
  mode: AccountMode | null;
  user: DemoUser | null;
  /** The real role of the signed-in account. Only a creator can be "creator". */
  role: Role | null;
  /**
   * The role the interface should render as. For a creator this can be
   * temporarily downgraded to "customer" via the role switcher. It can never
   * be upgraded above the account's real role.
   */
  effectiveRole: Role | null;
  canSwitchRole: boolean;
  /** Demo sign-in — no password, mock data only. */
  signIn: (role: Role) => void;
  /** Marks the browser as holding a genuine account session. */
  startRealSession: () => void;
  /** Called after the private creator code is verified server-side. */
  grantCreator: () => void;
  signOut: () => void;
  setViewAs: (role: Role) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

/**
 * Reads the session outside React — used by route guards in `beforeLoad`.
 * Client-only: protected layouts run with `ssr: false`.
 */
export function readAuthSnapshot(): { mode: AccountMode; role: Role; effectiveRole: Role } | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (parsed.role !== "customer" && parsed.role !== "creator") return null;
    const mode: AccountMode = parsed.mode === "real" ? "real" : "demo";
    const effectiveRole: Role =
      parsed.role === "creator" ? (parsed.viewAs === "customer" ? "customer" : "creator") : "customer";
    return { mode, role: parsed.role, effectiveRole };
  } catch {
    return null;
  }
}

function readStored(): Stored | null {
  const snap = readAuthSnapshot();
  return snap ? { mode: snap.mode, role: snap.role, viewAs: snap.effectiveRole } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<Stored | null>(null);
  const [realUser, setRealUser] = useState<DemoUser | null>(null);

  const persist = useCallback((next: Stored | null) => {
    setState(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — session stays in memory */
    }
  }, []);

  /** Loads the signed-in account's profile for a real session. */
  const loadRealUser = useCallback(async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getUser();
    const authUser = data.user;
    if (!authUser) {
      setRealUser(null);
      return false;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, full_name, email, created_at")
      .eq("id", authUser.id)
      .maybeSingle();

    const name =
      profile?.full_name ||
      profile?.username ||
      (authUser.user_metadata?.["full_name"] as string | undefined) ||
      (authUser.email ?? "").split("@")[0] ||
      "Investor";

    setRealUser({
      id: authUser.id,
      name,
      email: profile?.email ?? authUser.email ?? "",
      role: "customer",
      plan: "Free",
      joined: new Date(profile?.created_at ?? authUser.created_at ?? Date.now()).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      }),
      avatarInitials: initials(name),
    });
    return true;
  }, []);

  useEffect(() => {
    const stored = readStored();
    setState(stored);
    if (stored?.mode === "real") {
      loadRealUser()
        .then((ok) => {
          if (!ok) persist(null);
        })
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [loadRealUser, persist]);

  const value = useMemo<AuthValue>(() => {
    const isReal = state?.mode === "real";
    const user = isReal ? realUser : state ? DEMO_ACCOUNTS[state.role] : null;
    // The stored role only drives what the interface offers. Creator *data* is
    // gated server-side by the signed creator-code cookie, so a tampered
    // local-storage value cannot reveal anything.
    const role = state ? state.role : null;
    // Hard rule: a customer's effective role is always "customer".
    const effectiveRole: Role | null =
      role === "creator" ? (state?.viewAs === "customer" ? "customer" : "creator") : role;

    return {
      ready,
      mode: state?.mode ?? null,
      user,
      role,
      effectiveRole,
      canSwitchRole: role === "creator",
      signIn: (nextRole: Role) => persist({ mode: "demo", role: nextRole, viewAs: nextRole }),
      startRealSession: () => {
        // Keep an already-unlocked creator role across reloads.
        const keepRole: Role = state?.mode === "real" && state.role === "creator" ? "creator" : "customer";
        persist({ mode: "real", role: keepRole, viewAs: keepRole === "creator" ? state?.viewAs ?? "creator" : "customer" });
        void loadRealUser();
      },
      grantCreator: () => {
        persist({ mode: state?.mode ?? "real", role: "creator", viewAs: "creator" });
      },
      signOut: () => {
        if (state?.mode === "real") {
          void import("@/integrations/supabase/client").then(({ supabase }) => supabase.auth.signOut());
        }
        setRealUser(null);
        persist(null);
      },
      setViewAs: (nextRole: Role) => {
        if (role !== "creator") return; // customers can never change their role
        persist({ mode: state?.mode ?? "demo", role: "creator", viewAs: nextRole });
      },
    };
  }, [ready, state, realUser, persist, loadRealUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
