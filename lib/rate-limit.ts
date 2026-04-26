/**
 * [SaaS INFRA] - In-Memory Rate Limiter
 * Provides robust protection against brute-force attacks and API abuse.
 * Designed to be easily swappable with Upstash Redis in multi-server deployments.
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

// In-memory store (Note: cleared on server restart. Use Redis for true distributed scale)
const store = new Map<string, RateLimitRecord>();

interface RateLimitConfig {
  maxRequests: number;  // Maximum allowed requests within the window
  windowMs: number;     // Time window in milliseconds
}

export function checkRateLimit(
  identifier: string, // IP Address or User ID
  config: RateLimitConfig
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(identifier);

  // If no record exists or the window has expired, create a new window
  if (!record || now > record.resetAt) {
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // If within the window, check the count
  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  // Increment and allow
  record.count += 1;
  store.set(identifier, record);

  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

// Memory cleanup utility to prevent Map from growing indefinitely
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}, 60000); // Cleanup stale records every minute
