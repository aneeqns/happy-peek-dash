export const REQUEST_LIMITS = {
  ai: { limit: 10, seconds: 60 },
  aiGlobal: { limit: 100, seconds: 3600 },
  quotes: { limit: 60, seconds: 60 },
  creator: { limit: 5, seconds: 900 },
};

export function validCreatorExpiry(raw: string, now = Date.now()) {
  const expiry = Number(raw);
  return Number.isSafeInteger(expiry) && expiry > now && expiry <= now + 12 * 60 * 60 * 1000;
}

export function sameOriginRequest(request: Request) {
  const origin = request.headers.get('origin');
  return origin === new URL(request.url).origin && request.headers.get('sec-fetch-site') !== 'cross-site';
}