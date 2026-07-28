import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Glassmorphism card — the primary surface used across the app. */
export function GlassCard({
  className,
  children,
  glow,
}: {
  className?: string;
  children: ReactNode;
  glow?: "emerald" | "sky" | "violet" | "amber" | "rose" | "none";
}) {
  const ring = {
    emerald: "shadow-[0_0_50px_-24px_oklch(0.78_0.17_155_/_0.7)]",
    sky: "shadow-[0_0_50px_-24px_oklch(0.7_0.18_240_/_0.7)]",
    violet: "shadow-[0_0_50px_-24px_oklch(0.62_0.22_300_/_0.7)]",
    amber: "shadow-[0_0_50px_-24px_oklch(0.78_0.16_70_/_0.7)]",
    rose: "shadow-[0_0_50px_-24px_oklch(0.68_0.22_15_/_0.7)]",
    none: "",
  }[glow ?? "none"];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:border-border",
        ring,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
  accent = "from-emerald-400 via-sky-400 to-violet-400",
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  accent?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1
          className={cn(
            "bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl",
            accent,
          )}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({ icon, children, right }: { icon?: ReactNode; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {children}
      </h2>
      {right}
    </div>
  );
}

export function Kpi({
  label,
  value,
  delta,
  icon,
  tint = "emerald",
}: {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  tint?: "emerald" | "sky" | "violet" | "amber" | "rose";
}) {
  const tints = {
    emerald: "from-emerald-500/15 to-lime-500/5 text-emerald-300",
    sky: "from-sky-500/15 to-indigo-500/5 text-sky-300",
    violet: "from-violet-500/15 to-fuchsia-500/5 text-violet-300",
    amber: "from-amber-500/15 to-orange-500/5 text-amber-300",
    rose: "from-rose-500/15 to-pink-500/5 text-rose-300",
  }[tint];

  const negative = delta?.trim().startsWith("-");

  return (
    <div className={cn("rounded-2xl border border-border/70 bg-gradient-to-br p-4 backdrop-blur-xl", tints)}>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-mono-nums text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
      {delta && (
        <p className={cn("mt-1 font-mono-nums text-xs", negative ? "text-bear" : "text-bull")}>{delta}</p>
      )}
    </div>
  );
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "bull" | "bear" | "neutral" | "info" | "warn" }) {
  const tones = {
    bull: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    bear: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    info: "border-sky-500/40 bg-sky-500/10 text-sky-300",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    neutral: "border-border bg-surface text-muted-foreground",
  }[tone];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tones)}>
      {children}
    </span>
  );
}

/** Tiny inline SVG sparkline — green when trending up, red when down. */
export function Sparkline({ data, className }: { data: number[]; className?: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 26}`)
    .join(" ");
  const up = data[data.length - 1] >= data[0];
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className={cn("h-8 w-24", className)}>
      <polyline
        points={points}
        fill="none"
        strokeWidth={2}
        stroke={up ? "var(--bull)" : "var(--bear)"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** High-contrast tooltip so charts stay readable on colorful backgrounds. */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  labelFormatter,
  unit,
  accentByValue,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name?: string; payload?: Record<string, unknown> }>;
  label?: string | number;
  valueFormatter: (v: number) => string;
  labelFormatter?: (label: string | number | undefined, payload?: Record<string, unknown>) => string;
  unit?: string;
  accentByValue?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0];
  const v = p.value;
  const accent = accentByValue ? (v >= 0 ? "text-emerald-400" : "text-rose-400") : "text-emerald-400";
  const heading = labelFormatter ? labelFormatter(label, p.payload) : String(p.name ?? "");
  return (
    <div className="min-w-[140px] rounded-xl border border-white/15 bg-zinc-950/95 p-3 shadow-2xl ring-1 ring-black/50 backdrop-blur-md">
      {heading && (
        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{heading}</p>
      )}
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-xs text-white/70">{unit ?? "Value"}</span>
        <span className={cn("text-lg font-semibold tabular-nums tracking-tight", accent)}>
          {valueFormatter(v)}
        </span>
      </div>
    </div>
  );
}

export function ChartLegend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ background: i.color }} />
          {i.label}
        </span>
      ))}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border/70 p-8 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ProgressBar({ pct, tone = "bull" }: { pct: number; tone?: "bull" | "info" | "warn" }) {
  const bg = { bull: "bg-emerald-400", info: "bg-sky-400", warn: "bg-amber-400" }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all duration-500", bg)} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
