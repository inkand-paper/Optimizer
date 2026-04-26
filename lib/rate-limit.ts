import { Redis } from '@upstash/redis';

/**
 * [SaaS INFRA] - Distributed Rate Limiter (Upstash Redis)
 * Uses a global Redis database to enforce rate limits across ALL server instances/regions.
 * This is the enterprise-grade upgrade from the in-memory version.
 * 
 * Database: Tokyo, Japan (AWS ap-northeast-1)
 */

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface RateLimitConfig {
  maxRequests: number;  // Maximum allowed requests within the window
  windowMs: number;     // Time window in milliseconds
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowEnd = now + config.windowMs;

  // Atomically increment the counter for this key
  const count = await redis.incr(key);

  // On the first request in this window, set the expiry
  if (count === 1) {
    await redis.pexpire(key, config.windowMs);
  }

  // Get the remaining TTL to calculate the reset time
  const ttlMs = await redis.pttl(key);
  const resetAt = now + (ttlMs > 0 ? ttlMs : config.windowMs);

  if (count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt,
    };
  }

  return {
    success: true,
    remaining: config.maxRequests - count,
    resetAt,
  };
}
