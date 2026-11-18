"use client";

/**
 * InfrastructureProvider manages core client-side lifecycle initialization.
 * [PRIVACY & COMPLIANCE] Telemetry beacon is disabled by default.
 * Only runs if NEXT_PUBLIC_ENABLE_TELEMETRY is explicitly set to "true".
 */
export function InfrastructureProvider() {
  // Silent, zero telemetry by default
  return null;
}
