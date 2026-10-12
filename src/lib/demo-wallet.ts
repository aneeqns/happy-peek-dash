import { useSyncExternalStore } from "react";

/** Virtual (play) money wallet for demo accounts. Prices are real; the money is not. */
export type DemoHolding = { symbol: string; quantity: number; avgCost: number };
export type DemoWallet = { startingCash: number; cash: number; holdings: DemoHolding[] };

const KEY = "uptrend.demo-wallet.v1";
export const DEMO_AMOUNT_PRESETS = [1_000, 10_000, 50_000, 100_000, 1_000_000];
export const DEMO_MIN = 100;
export const DEMO_MAX = 10_000_000;

const listeners = new Set<() => void>();
let cache: DemoWallet | null = null;
let cacheRaw: string | null = null;

function read(): DemoWallet | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    cache = raw ? (JSON.parse(raw) as DemoWallet) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function write(w: DemoWallet | null) {
  if (w) window.localStorage.setItem(KEY, JSON.stringify(w));
  else window.localStorage.removeItem(KEY);
  listeners.forEach((l) => l());
}

export function createDemoWallet(amount: number) {
  write({ startingCash: amount, cash: amount, holdings: [] });
}

export function resetDemoWallet() {
  write(null);
}

export function buyDemo(symbol: string, quantity: number, price: number): string | null {
  const w = read();
  if (!w) return "No demo wallet found.";
  if (!(quantity > 0) || !(price > 0)) return "Enter a valid quantity.";
  const total = quantity * price;
  if (total > w.cash + 1e-9) return `Not enough virtual cash — you have $${w.cash.toFixed(2)}.`;
  const holdings = [...w.holdings];
  const i = holdings.findIndex((h) => h.symbol === symbol);
  if (i >= 0) {
    const h = holdings[i];
    const q = h.quantity + quantity;
    holdings[i] = { symbol, quantity: q, avgCost: (h.quantity * h.avgCost + total) / q };
  } else holdings.push({ symbol, quantity, avgCost: price });
  write({ ...w, cash: w.cash - total, holdings });
  return null;
}

export function sellDemo(symbol: string, quantity: number, price: number): string | null {
  const w = read();
  if (!w) return "No demo wallet found.";
  const h = w.holdings.find((x) => x.symbol === symbol);
  if (!h) return "You don't hold that symbol.";
  if (!(quantity > 0) || quantity > h.quantity + 1e-9) return `You can sell up to ${h.quantity}.`;
  const left = h.quantity - quantity;
  const holdings = w.holdings
    .map((x) => (x.symbol === symbol ? { ...x, quantity: left } : x))
    .filter((x) => x.quantity > 1e-9);
  write({ ...w, cash: w.cash + quantity * price, holdings });
  return null;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => e.key === KEY && cb();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useDemoWallet(): DemoWallet | null {
  return useSyncExternalStore(subscribe, read, () => null);
}
