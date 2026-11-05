/** Daily percentage changes use the previous close, not the current price. */
export function positionDayChange(quantity: number, price: number, changePct: number) {
  const ratio = 1 + changePct / 100;
  if (![quantity, price, changePct].every(Number.isFinite) || ratio <= 0) return 0;
  return quantity * (price - price / ratio);
}