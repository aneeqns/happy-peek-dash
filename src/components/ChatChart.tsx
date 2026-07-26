import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPayload } from "@/lib/chart-tool";

export function ChatChart({ data }: { data: ChartPayload }) {
  const up = data.changePct >= 0;
  const color = up ? "var(--color-bull, #22c55e)" : "var(--color-bear, #ef4444)";

  return (
    <figure className="mt-2 w-full rounded-xl border border-border bg-zinc-950/70 p-3">
      <figcaption className="mb-2 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-foreground">{data.title}</span>
        <span
          className="text-xs font-semibold tabular-nums"
          style={{ color }}
        >
          {up ? "+" : ""}
          {data.changePct}%
        </span>
      </figcaption>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {data.kind === "bar" ? (
            <BarChart data={data.points} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} tickLine={false} axisLine={false} width={38} />
              <Tooltip content={<ChartTip unit={data.unit} />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
              <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={data.points} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id={`chatChart-${data.symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.5)" }} tickLine={false} axisLine={false} width={38} domain={["auto", "auto"]} />
              <Tooltip content={<ChartTip unit={data.unit} />} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
              <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#chatChart-${data.symbol})`} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">
        Illustrative simulated series for {data.symbol} — not live market data.
      </p>
    </figure>
  );
}

function ChartTip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/15 bg-zinc-950/95 px-2.5 py-1.5 text-xs shadow-xl backdrop-blur-md">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums text-foreground">
        {unit}
        {payload[0].value}
      </p>
    </div>
  );
}
