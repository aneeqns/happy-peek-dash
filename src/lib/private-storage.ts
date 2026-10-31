export function alertStorageKey(mode: string | null, userId?: string) {
  if (mode === 'real') return userId ? `uptrend.alerts.v1:real:${userId}` : null;
  return mode === 'demo' ? 'uptrend.alerts.v1:demo' : null;
}