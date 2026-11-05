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
  let raw: string | null;
  try { raw = window.localStorage.getItem(KEY); } catch { return cache; }
  if (raw === cacheRaw) return cache;
  cacheRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cache = parsed && isDemoAmount(parsed.startingCash) && Number.isFinite(parsed.cash) && parsed.cash >= 0 &&
      Array.isArray(parsed.holdings) && parsed.holdings.every((h: DemoHolding) =>
        h && typeof h.symbol === 'string' && Number.isFinite(h.quantity) && h.quantity > 0 && Number.isFinite(h.avgCost) && h.avgCost > 0)
      ? parsed : null;
  } catch {
    cache = null;
  }
  return cache;
}

function write(w: DemoWallet | null) {
  cache = w;
  cacheRaw = w ? JSON.stringify(w) : null;
  try {
    if (cacheRaw) window.localStorage.setItem(KEY, cacheRaw);
    else window.localStorage.removeItem(KEY);
  } catch { /* Keep the wallet usable in memory when browser storage is unavailable. */ }
  listeners.forEach((l) => l());
}

export function createDemoWallet(amount: number) {
  if (!isDemoAmount(amount)) throw new Error(`Choose a virtual amount between $${DEMO_MIN.toLocaleString()} and $${DEMO_MAX.toLocaleString()}.`);
  const cash = Math.round(amount * 100) / 100;
  write({ startingCash: cash, cash, holdings: [] });
}

export function isDemoAmount(amount: number) {
  return Number.isFinite(amount) && amount >= DEMO_MIN && amount <= DEMO_MAX;
}

export function resetDemoWallet() {
  write(null);
}

export function buyDemo(symbol: string, quantity: number, price: number): string | null {
  const w = read();
  if (!w) return "No demo wallet found.";
  if (!Number.isFinite(quantity) || !Number.isFinite(price) || !(quantity > 0) || !(price > 0)) return "Enter a valid quantity and price.";
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
  if (!Number.isFinite(quantity) || !Number.isFinite(price) || !(price > 0) || !(quantity > 0) || quantity > h.quantity) return `Enter a valid price and quantity up to ${h.quantity}.`;
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
