import { getRequest } from '@tanstack/react-start/server';
import { createClient } from '@supabase/supabase-js';
import { REQUEST_LIMITS, sameOriginRequest } from './security-rules';

export async function consumeQuota(bucket: string, limit: number, seconds: number) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.rpc('consume_request_quota', {
    p_bucket: bucket, p_limit: limit, p_window_seconds: seconds,
  });
  if (error) throw new Error('Request protection is temporarily unavailable.');
  return data === true;
}

export async function enforcePublicQuota(kind: 'ai' | 'quotes', request = getRequest()) {
  if (!sameOriginRequest(request)) return new Response('Forbidden', { status: 403 });
  // Hash network identifiers before storing counters; the global budget also
  // bounds AI spend if a client can rotate or spoof a network identifier.
  const network = request.headers.get('cf-connecting-ip') ?? 'shared';
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(network));
  const key = [...new Uint8Array(hash)].map(v => v.toString(16).padStart(2, '0')).join('');
  const rule = REQUEST_LIMITS[kind];
  if (!(await consumeQuota(`${kind}:${key}`, rule.limit, rule.seconds))) {
    return new Response('Too many requests. Please try again later.', { status: 429, headers: { 'Retry-After': String(rule.seconds) } });
  }
  if (kind === 'ai' && !(await consumeQuota('ai:global', REQUEST_LIMITS.aiGlobal.limit, REQUEST_LIMITS.aiGlobal.seconds))) {
    return new Response('AI usage limit reached. Please try again later.', { status: 429 });
  }
  return null;
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new Error('Invalid request');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Invalid request');
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error('Request too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function verifiedRequestUser() {
  const auth = getRequest().headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return null;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(auth.slice(7));
  return error ? null : data.user;
}