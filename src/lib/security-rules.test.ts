import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { REQUEST_LIMITS, sameOriginRequest, validCreatorExpiry } from './security-rules';
import { chatRequestSchema, coachRequestSchema, quoteRequestSchema } from './ai-request-schemas';

const expect = (actual: unknown) => ({
  toBe: (expected: unknown) => assert.equal(actual, expected),
  toEqual: (expected: unknown) => assert.deepEqual(actual, expected),
});

describe('public request protection', () => {
  test('rejects cross-site and missing-origin requests', () => {
    expect(sameOriginRequest(new Request('https://uptrend.test/api/chat', { headers: { origin: 'https://evil.test' } }))).toBe(false);
    expect(sameOriginRequest(new Request('https://uptrend.test/api/chat'))).toBe(false);
    expect(sameOriginRequest(new Request('https://uptrend.test/api/chat', { headers: { origin: 'https://uptrend.test' } }))).toBe(true);
  });
  test('caps AI use and creator guesses', () => {
    expect(REQUEST_LIMITS.ai).toEqual({ limit: 10, seconds: 60 });
    expect(REQUEST_LIMITS.aiGlobal).toEqual({ limit: 100, seconds: 3600 });
    expect(REQUEST_LIMITS.creator).toEqual({ limit: 5, seconds: 900 });
  });
  test('rejects expired or excessively long creator passes', () => {
    const now = 1000000;
    expect(validCreatorExpiry(String(now), now)).toBe(false);
    expect(validCreatorExpiry(String(now + 43200001), now)).toBe(false);
    expect(validCreatorExpiry(String(now + 43200000), now)).toBe(true);
    expect(validCreatorExpiry('Infinity', now)).toBe(false);
  });
  test('rejects system-role injection and oversized chat history', () => {
    const message = { id: 'one', role: 'user', parts: [{ type: 'text', text: 'AAPL' }] };
    expect(chatRequestSchema.safeParse({ messages: [message] }).success).toBe(true);
    expect(chatRequestSchema.safeParse({ messages: [{ ...message, role: 'system' }] }).success).toBe(false);
    expect(chatRequestSchema.safeParse({ messages: Array(41).fill(message) }).success).toBe(false);
  });
  test('limits coach context and supported modes', () => {
    expect(coachRequestSchema.safeParse({ question: 'Explain beta', mode: 'jargon' }).success).toBe(true);
    expect(coachRequestSchema.safeParse({ question: 'x'.repeat(4001) }).success).toBe(false);
    expect(coachRequestSchema.safeParse({ question: 'x', context: 'x'.repeat(12001) }).success).toBe(false);
    expect(coachRequestSchema.safeParse({ question: 'x', mode: 'unknown' }).success).toBe(false);
  });
  test('bounds quote requests and rejects invalid ticker strings', () => {
    expect(quoteRequestSchema.safeParse({ symbols: ['AAPL', '^GSPC', 'BRK.B'] }).success).toBe(true);
    expect(quoteRequestSchema.safeParse({ symbols: Array(81).fill('AAPL') }).success).toBe(false);
    expect(quoteRequestSchema.safeParse({ symbols: ['AAPL&extra=true'] }).success).toBe(false);
  });
});