import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { validCreatorExpiry } from './security-rules';

const COOKIE = "uptrend_creator";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function toHex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toHex(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
}

function readCookie(name: string) {
  const raw = getRequestHeader("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) {
      try { return decodeURIComponent(v.join("=")); } catch { return null; }
    }
  }
  return null;
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Server-only guard shared by every creator data function.
 * Returns true when the browser carries a valid, unexpired creator pass.
 */
export async function hasCreatorPass(userId?: string): Promise<boolean> {
  if (!userId) return false;
  const secret = process.env["SESSION_SECRET"];
  if (!secret) return false;
  const cookie = readCookie(COOKIE);
  if (!cookie) return false;
  const [owner, expRaw, mac, extra] = cookie.split(".");
  if (owner !== userId || !expRaw || !mac || extra || !validCreatorExpiry(expRaw)) return false;
  if (!timingSafeEqual(mac, await sign(`${owner}.${expRaw}`, secret))) return false;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data, error } = await supabaseAdmin.from('creator_passes')
    .select('token_hash').eq('token_hash', mac).eq('user_id', userId)
    .gt('expires_at', new Date().toISOString()).maybeSingle();
  return !error && Boolean(data);
}

export async function readCreatorAccessStatus(userId: string) {
  return {
    granted: await hasCreatorPass(userId),
    configured: Boolean(process.env["CREATOR_ACCESS_CODE"]),
  };
}

export async function verifyCreatorCode(code: string, userId: string) {
  const { consumeQuota } = await import('./request-security.server');
  if (!(await consumeQuota(`creator:${userId}`, 5, 900))) {
    return { granted: false, error: 'Too many attempts. Try again in 15 minutes.' };
  }
  const expected = process.env["CREATOR_ACCESS_CODE"];
  const secret = process.env["SESSION_SECRET"];
  if (!expected || !secret) {
    return { granted: false, error: "Creator access is not configured yet." as string | null };
  }
  const given = code.trim();
  if (given.length === 0 || !timingSafeEqual(given, expected)) {
    // Small delay to blunt brute-force attempts.
    await new Promise((r) => setTimeout(r, 400));
    return { granted: false, error: "That code is not correct." as string | null };
  }
  const exp = String(Date.now() + MAX_AGE_SECONDS * 1000);
  const payload = `${userId}.${exp}`;
  const value = `${payload}.${await sign(payload, secret)}`;
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { error } = await supabaseAdmin.from('creator_passes').insert({
    token_hash: value.split('.')[2], user_id: userId, expires_at: new Date(Number(exp)).toISOString(),
  });
  if (error) return { granted: false, error: 'Creator access is temporarily unavailable.' };
  setResponseHeader(
    "Set-Cookie",
    `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`,
  );
  return { granted: true, error: null as string | null };
}

export async function clearCreatorCookie() {
  const cookie = readCookie(COOKIE);
  if (cookie) {
    const [owner, expRaw, mac, extra] = cookie.split('.');
    const secret = process.env['SESSION_SECRET'];
    if (owner && expRaw && mac && !extra && secret && timingSafeEqual(mac, await sign(`${owner}.${expRaw}`, secret))) {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const { error } = await supabaseAdmin.from('creator_passes').delete().eq('token_hash', mac).eq('user_id', owner);
      if (error) throw new Error('Unable to revoke Creator access. Please try again.');
    }
  }
  setResponseHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}
