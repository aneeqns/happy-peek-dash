import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Holding = {
  id: string;
  symbol: string;
  quantity: number;
  avg_cost: number;
  note: string | null;
};

export const listHoldings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("holdings")
      .select("id, symbol, quantity, avg_cost, note")
      .order("symbol", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((h) => ({
      id: h.id,
      symbol: h.symbol,
      quantity: Number(h.quantity),
      avg_cost: Number(h.avg_cost),
      note: h.note,
    })) satisfies Holding[];
  });

export const addHolding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { symbol: string; quantity: number; avgCost: number; note?: string }) => {
    const symbol = String(data?.symbol ?? "").trim().toUpperCase();
    const quantity = Number(data?.quantity);
    const avgCost = Number(data?.avgCost);
    if (!symbol || symbol.length > 12) throw new Error("Enter a valid symbol.");
    if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("Quantity must be greater than zero.");
    if (!Number.isFinite(avgCost) || avgCost <= 0) throw new Error("Average cost must be greater than zero.");
    return { symbol, quantity, avgCost, note: String(data?.note ?? "").trim().slice(0, 200) || null };
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("holdings").insert({
      user_id: context.userId,
      symbol: data.symbol,
      quantity: data.quantity,
      avg_cost: data.avgCost,
      note: data.note,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteHolding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => ({ id: String(data?.id ?? "") }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("holdings").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
