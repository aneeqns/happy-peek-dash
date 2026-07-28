import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Role = "customer" | "creator";

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

type Stored = { role: Role; viewAs: Role };

type AuthValue = {
  /** Hydration flag — auth state is read from local storage on the client. */
  ready: boolean;
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
  signIn: (role: Role) => void;
  signOut: () => void;
  setViewAs: (role: Role) => void;
};

const AuthContext = createContext<AuthValue | null>(null);

function readStored(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (parsed.role !== "customer" && parsed.role !== "creator") return null;
    const viewAs = parsed.viewAs === "creator" && parsed.role === "creator" ? "creator" : parsed.role === "creator" ? (parsed.viewAs ?? "creator") : "customer";
    return { role: parsed.role, viewAs: viewAs as Role };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<Stored | null>(null);

  useEffect(() => {
    setState(readStored());
    setReady(true);
  }, []);

  const persist = useCallback((next: Stored | null) => {
    setState(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable — session stays in memory */
    }
  }, []);

  const value = useMemo<AuthValue>(() => {
    const user = state ? DEMO_ACCOUNTS[state.role] : null;
    const role = user?.role ?? null;
    // Hard rule: a customer's effective role is always "customer".
    const effectiveRole: Role | null =
      role === "creator" ? (state?.viewAs === "customer" ? "customer" : "creator") : role;

    return {
      ready,
      user,
      role,
      effectiveRole,
      canSwitchRole: role === "creator",
      signIn: (nextRole: Role) => persist({ role: nextRole, viewAs: nextRole }),
      signOut: () => persist(null),
      setViewAs: (nextRole: Role) => {
        if (role !== "creator") return; // customers can never change their role
        persist({ role: "creator", viewAs: nextRole });
      },
    };
  }, [ready, state, persist]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
