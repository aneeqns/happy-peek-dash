import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Pill } from "@/components/ui-kit";
import { STATUS_META, type CriterionResult, type ShariahStatus } from "@/lib/shariah";
import { cn } from "@/lib/utils";

export function ShariahBadge({ status }: { status: ShariahStatus }) {
  const meta = STATUS_META[status];
  return (
    <Pill tone={meta.tone}>
      <span aria-hidden>{meta.emoji}</span> {meta.label}
    </Pill>
  );
}

const mark = { pass: "✅", fail: "❌", unknown: "⚠️" } as const;

export function CriterionRow({ c, expandable = true }: { c: CriterionResult; expandable?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border/60 bg-surface/60 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium">
          <span className="mr-1.5" aria-hidden>{mark[c.outcome]}</span>
          {c.label}
        </p>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              c.outcome === "pass" ? "text-bull" : c.outcome === "fail" ? "text-bear" : "text-amber-300",
            )}
          >
            {c.outcome === "pass" ? "Pass" : c.outcome === "fail" ? "Fail" : "No data"}
          </span>
          {expandable && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition hover:text-foreground"
            >
              Why? <ChevronDown className={cn("h-3 w-3 transition", open && "rotate-180")} />
            </button>
          )}
        </div>
      </div>
      {open && (
        <div className="mt-2 space-y-1 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
          <p>{c.why}</p>
          <p className="font-mono-nums">
            Measured: {c.measured} · Threshold: {c.threshold}
          </p>
        </div>
      )}
    </div>
  );
}

export function ShariahDisclaimer({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-border/60 bg-surface/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
      {text}
    </p>
  );
}
