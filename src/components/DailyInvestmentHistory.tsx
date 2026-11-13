import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Button } from '@/components/ui/button';
import { ChartTooltip, Kpi, SectionTitle } from '@/components/ui-kit';
import { useAuth } from '@/lib/auth';
import { downloadCsv } from '@/lib/csv-export';
import { getInvestmentHistory } from '@/lib/investment-history.functions';

export function DailyInvestmentHistory() {
  const { user, mode, effectiveRole } = useAuth();
  const [days, setDays] = useState(30);
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const start = new Date(Date.parse(`${end}T00:00:00Z`) - (days - 1) * 86_400_000).toISOString().slice(0, 10);
  const load = useServerFn(getInvestmentHistory);
  const history = useQuery({
    queryKey: ['investment-history', user?.id, start, end],
    enabled: mode === 'real' && effectiveRole === 'creator' && Boolean(user?.id),
    queryFn: () => load({ data: { start, end } }), refetchInterval: 60_000,
  });
  const rows = history.data ?? [];
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  return <section className="space-y-4 border-y border-border py-6">
    <SectionTitle>Daily investments</SectionTitle>
    <div className="flex flex-wrap items-center gap-3">
      <div role="group" aria-label="History period" className="flex gap-1">
        {[7, 30, 90, 365].map(value => <Button key={value} size="sm" variant={days === value ? 'secondary' : 'ghost'} aria-pressed={days === value} onClick={() => setDays(value)}>{value} days</Button>)}
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">Ending
        <input type="date" aria-label="History ending date" value={end} max={new Date().toISOString().slice(0, 10)} onChange={event => { if (event.target.value) setEnd(event.target.value); }} className="rounded-md border border-input bg-background px-2 py-1 text-foreground" />
      </label>
      <Button
        variant="outline"
        size="sm"
        disabled={rows.length === 0}
        onClick={() => downloadCsv(
          `uptrend-investments-${start}-to-${end}.csv`,
          ['Day (UTC)', 'Real holdings saved', 'Demo buys', 'Total'],
          rows.map(row => [row.day, row.real, row.demo, row.total]),
        )}
      >
        Export CSV
      </Button>
    </div>
    <p className="text-xs text-muted-foreground">UTC days · Investment counts, not money · Today’s total is still growing</p>
    {history.isPending ? <p className="text-sm text-muted-foreground">Loading daily investments…</p> : history.error ? <div className="flex flex-wrap items-center gap-3"><p className="text-sm text-bear">Daily investments could not be loaded.</p><Button variant="outline" size="sm" onClick={() => void history.refetch()}>Retry</Button></div> : <>
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Investments in period" value={total.toLocaleString()} tint="emerald" />
        <Kpi label="Real holdings saved" value={rows.reduce((sum, row) => sum + row.real, 0).toLocaleString()} tint="sky" />
        <Kpi label="Demo buys" value={rows.reduce((sum, row) => sum + row.demo, 0).toLocaleString()} tint="amber" />
      </div>
      {total === 0 && <p className="text-sm text-muted-foreground">No investments recorded in this period.</p>}
      <div className="h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={rows}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickFormatter={value => String(value).slice(5)} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} minTickGap={24} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={36} />
          <Tooltip content={<ChartTooltip valueFormatter={value => value.toLocaleString()} />} />
          <Legend />
          <Bar dataKey="real" name="Real holdings saved" stackId="investments" fill="var(--bull)" />
          <Bar dataKey="demo" name="Demo buys" stackId="investments" fill="var(--muted-foreground)" />
        </BarChart></ResponsiveContainer>
      </div>
      <div className="max-h-80 overflow-auto">
        <table className="w-full text-sm"><thead><tr className="border-b border-border text-muted-foreground"><th className="py-2 text-left">Day (UTC)</th><th className="py-2 text-right">Real</th><th className="py-2 text-right">Demo</th><th className="py-2 text-right">Total</th></tr></thead>
          <tbody>{[...rows].reverse().map(row => <tr key={row.day} className="border-b border-border/40"><td className="py-2">{row.day}</td><td className="py-2 text-right">{row.real}</td><td className="py-2 text-right">{row.demo}</td><td className="py-2 text-right font-semibold">{row.total}</td></tr>)}</tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Existing saved holdings are included by their original save date. Demo history starts when this update goes live; earlier demo buys are unavailable. Sales, removals and demo resets do not subtract from daily activity.</p>
    </>}
  </section>;
}