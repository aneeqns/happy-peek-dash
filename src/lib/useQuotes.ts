import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getQuotes, type Quote } from "./quotes.functions";

/**
 * Live (slightly delayed) prices for a set of symbols, refreshed every 60s.
 * Returns a lookup keyed by the app's own symbol.
 */
export function useQuotes(symbols: string[]) {
  const fetchQuotes = useServerFn(getQuotes);
  const key = [...symbols].sort().join(",");

  const query = useQuery({
    queryKey: ["quotes", key],
    queryFn: () => fetchQuotes({ data: { symbols } }),
    enabled: symbols.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const map = new Map<string, Quote>();
  for (const q of query.data?.quotes ?? []) map.set(q.symbol, q);

  return {
    quotes: map,
    isLoading: query.isLoading,
    error: query.data?.error ?? (query.error ? "Live prices are temporarily unavailable." : null),
    updatedAt: query.data?.at ?? null,
    refetch: query.refetch,
  };
}
