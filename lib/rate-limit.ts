import { Redis } from '@upstash/redis';

/**
 * [SaaS INFRA] - Adaptive Rate Limiter
 * Fallback to in-memory store for local development if Redis is not configured.
 */

const isRedisConfigured = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

const redis = isRedisConfigured 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// In-memory store for local development
const memoryStore = new Map<string, { count: number; expires: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();

  // 1. Production Mode: Use Distributed Redis
  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) {
        await redis.pexpire(key, config.windowMs);
      }
      const ttlMs = await redis.pttl(key);
      const resetAt = now + (ttlMs > 0 ? ttlMs : config.windowMs);

      return {
        success: count <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - count),
        resetAt,
      };
    } catch (error) {
      console.warn('Redis rate limit failed, falling back to memory:', error);
      // Fall through to memory store on Redis failure
    }
  }

  // 2. Development Mode: Use In-Memory Map
  const record = memoryStore.get(key);
  
  if (!record || now > record.expires) {
    const newRecord = { count: 1, expires: now + config.windowMs };
    memoryStore.set(key, newRecord);
    return { success: true, remaining: config.maxRequests - 1, resetAt: newRecord.expires };
  }

  record.count++;
  const success = record.count <= config.maxRequests;
  
  return {
    success,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetAt: record.expires,
  };
}
