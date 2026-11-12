/**
 * __tests__/api/rate-limit.test.ts
 * Unit tests for the in-memory path of checkRateLimit.
 * Redis env vars are intentionally unset so the memory store is used.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Ensure Redis is NOT configured — isolate to memory store
vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');

// Re-import after stubbing so the module initializes with the stubs
const { checkRateLimit } = await import('@/lib/rate-limit');

// Use unique key prefixes per test to avoid cross-test state
let keyCounter = 0;
function uniqueKey() {
  return `test-key-${Date.now()}-${++keyCounter}`;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkRateLimit — in-memory store', () => {
  it('allows the first request and reports correct remaining count', async () => {
    const result = await checkRateLimit(uniqueKey(), { maxRequests: 3, windowMs: 60_000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('increments counter on successive calls', async () => {
    const key = uniqueKey();
    const config = { maxRequests: 5, windowMs: 60_000 };

    const r1 = await checkRateLimit(key, config);
    const r2 = await checkRateLimit(key, config);
    const r3 = await checkRateLimit(key, config);

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
    expect(r3.success).toBe(true);
  });

  it('blocks after maxRequests is exceeded', async () => {
    const key = uniqueKey();
    const config = { maxRequests: 2, windowMs: 60_000 };

    await checkRateLimit(key, config); // 1st — ok
    await checkRateLimit(key, config); // 2nd — ok
    const blocked = await checkRateLimit(key, config); // 3rd — should be blocked

    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('reports remaining of 0 when blocked (never negative)', async () => {
    const key = uniqueKey();
    const config = { maxRequests: 1, windowMs: 60_000 };

    await checkRateLimit(key, config);
    const r2 = await checkRateLimit(key, config);
    const r3 = await checkRateLimit(key, config);

    expect(r2.remaining).toBe(0);
    expect(r3.remaining).toBe(0);
  });

  it('resets after the window expires', async () => {
    const key = uniqueKey();
    const config = { maxRequests: 1, windowMs: 1 }; // 1ms window

    await checkRateLimit(key, config); // fills the window

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 10));

    const result = await checkRateLimit(key, config);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0); // 1 request max, just used 1
  });

  it('provides a future resetAt timestamp', async () => {
    const before = Date.now();
    const result = await checkRateLimit(uniqueKey(), { maxRequests: 10, windowMs: 30_000 });
    expect(result.resetAt).toBeGreaterThan(before);
  });
});
