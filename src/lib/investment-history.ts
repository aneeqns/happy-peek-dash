export type InvestmentDay = { day: string; real: number; demo: number; total: number };

/** Calendar days are UTC; never invent activity for gaps. */
export function investmentDays(rows: { day: string; real_holdings: number; demo_buys: number }[], start: string, end: string): InvestmentDay[] {
  const byDay = new Map(rows.map(row => [row.day, row]));
  const result: InvestmentDay[] = [];
  for (let time = Date.parse(`${start}T00:00:00Z`); time <= Date.parse(`${end}T00:00:00Z`); time += 86_400_000) {
    const day = new Date(time).toISOString().slice(0, 10);
    const row = byDay.get(day);
    const real = Number(row?.real_holdings ?? 0);
    const demo = Number(row?.demo_buys ?? 0);
    result.push({ day, real, demo, total: real + demo });
  }
  return result;
}