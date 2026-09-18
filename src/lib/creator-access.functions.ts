import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

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
    if (k === name) return decodeURIComponent(v.join("="));
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
export async function hasCreatorPass(): Promise<boolean> {
  const secret = process.env["SESSION_SECRET"];
  if (!secret) return false;
  const cookie = readCookie(COOKIE);
  if (!cookie) return false;
  const [expRaw, mac] = cookie.split(".");
  if (!expRaw || !mac) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  return timingSafeEqual(mac, await sign(expRaw, secret));
}

export const creatorAccessStatus = createServerFn({ method: "GET" }).handler(async () => ({
  granted: await hasCreatorPass(),
  configured: Boolean(process.env["CREATOR_ACCESS_CODE"]),
}));

export const unlockCreator = createServerFn({ method: "POST" })
  .inputValidator((data: { code: string }) => ({ code: String(data?.code ?? "") }))
  .handler(async ({ data }) => {
    const expected = process.env["CREATOR_ACCESS_CODE"];
    const secret = process.env["SESSION_SECRET"];
    if (!expected || !secret) {
      return { granted: false, error: "Creator access is not configured yet." as string | null };
    }
    const given = data.code.trim();
    if (given.length === 0 || !timingSafeEqual(given, expected)) {
      // Small delay to blunt brute-force attempts.
      await new Promise((r) => setTimeout(r, 400));
      return { granted: false, error: "That code is not correct." as string | null };
    }
    const exp = String(Date.now() + MAX_AGE_SECONDS * 1000);
    const value = `${exp}.${await sign(exp, secret)}`;
    setResponseHeader(
      "Set-Cookie",
      `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}`,
    );
    return { granted: true, error: null as string | null };
  });

export const lockCreator = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return { granted: false };
});
