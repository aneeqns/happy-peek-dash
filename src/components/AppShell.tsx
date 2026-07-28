import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  User as UserIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import uptrendLogo from "@/assets/uptrend-logo-new.png.asset.json";
import { useAuth } from "@/lib/auth";
import { alertsNav, creatorNav, customerNav, type NavItem } from "@/lib/nav";
import { marketUniverse } from "@/lib/market-data";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Pill } from "@/components/ui-kit";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, effectiveRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isCreatorView = effectiveRole === "creator";

  return (
    <div className="min-h-screen bg-background">
      {/* ambient gradient wash */}
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70">
        <div className="absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <Sidebar isCreatorView={isCreatorView} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="lg:pl-64">
        <TopBar onMenu={() => setMobileOpen(true)} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-10 text-xs text-muted-foreground sm:px-6 lg:px-8">
          Uptrend · Invest Smarter, Grow Faster · Demo data. Educational use only, not financial advice.
          {user && <span className="ml-1">Signed in as {user.email}.</span>}
        </footer>
      </div>
    </div>
  );
}

function Sidebar({
  isCreatorView,
  mobileOpen,
  onClose,
}: {
  isCreatorView: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/70 bg-card/70 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 px-4 py-4">
          <img src={uptrendLogo.url} alt="Uptrend logo" width={36} height={36} className="h-9 w-9 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold tracking-tight">
              Up<span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">trend</span>
            </p>
            <p className="truncate text-[10px] text-muted-foreground">Invest Smarter, Grow Faster</p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
          <NavGroup label="Investing" items={[...customerNav.slice(0, 6), alertsNav, ...customerNav.slice(6)]} />
          {isCreatorView && <NavGroup label="Creator" items={creatorNav} accent />}
        </nav>
      </aside>
    </>
  );
}

function NavGroup({ label, items, accent }: { label: string; items: NavItem[]; accent?: boolean }) {
  return (
    <div>
      <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeOptions={{ exact: item.to === "/creator" }}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-all duration-200 hover:bg-surface-elevated hover:text-foreground",
                "data-[status=active]:text-foreground",
                accent
                  ? "data-[status=active]:bg-gradient-to-r data-[status=active]:from-violet-500/25 data-[status=active]:to-fuchsia-500/10"
                  : "data-[status=active]:bg-gradient-to-r data-[status=active]:from-emerald-500/25 data-[status=active]:to-sky-500/10",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { theme, toggle } = useTheme();
  const { user, canSwitchRole, effectiveRole, setViewAs, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          onClick={onMenu}
          aria-label="Open navigation"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted-foreground lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>

        <GlobalSearch />

        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:text-foreground"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface px-2 py-1.5 text-sm transition hover:border-primary/50"
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 text-[10px] font-bold text-emerald-950">
              {user?.avatarInitials ?? "?"}
            </span>
            <span className="hidden max-w-28 truncate sm:inline">{user?.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-popover/95 shadow-2xl backdrop-blur-xl">
              <div className="border-b border-border/70 px-4 py-3">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <Pill tone={effectiveRole === "creator" ? "info" : "bull"}>
                    {effectiveRole === "creator" ? "Creator view" : "Customer view"}
                  </Pill>
                  <Pill>{user?.plan}</Pill>
                </div>
              </div>

              {/* Role switcher — rendered only for the Creator account. */}
              {canSwitchRole && (
                <div className="border-b border-border/70 px-2 py-2">
                  <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Switch view
                  </p>
                  {(["customer", "creator"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setViewAs(r);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition hover:bg-surface-elevated",
                        effectiveRole === r ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {r === "creator" ? <ShieldCheck className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                      {r === "creator" ? "Creator View" : "Customer View"}
                      {effectiveRole === r && <span className="ml-auto text-[10px] text-emerald-400">active</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-2">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground">
                  <UserIcon className="h-4 w-4" /> Profile
                </Link>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-rose-300 hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return marketUniverse
      .filter((m) => m.symbol.toLowerCase().includes(q) || m.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query]);

  return (
    <div ref={boxRef} className="relative min-w-0 flex-1">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 focus-within:border-primary/60">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search stocks, ETFs, indices, crypto…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-40 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-border bg-popover/95 p-1 shadow-2xl backdrop-blur-xl">
          {results.map((r) => (
            <li key={`${r.kind}-${r.symbol}`}>
              <Link
                to="/markets"
                search={{ q: r.symbol }}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-surface-elevated"
              >
                <span className="w-16 shrink-0 font-mono-nums text-xs font-semibold">{r.symbol}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{r.name}</span>
                <span className={cn("font-mono-nums text-xs", r.pct >= 0 ? "text-bull" : "text-bear")}>
                  {r.pct >= 0 ? "+" : ""}
                  {r.pct.toFixed(2)}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
