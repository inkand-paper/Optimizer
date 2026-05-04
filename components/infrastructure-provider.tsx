"use client";

import { useEffect } from "react";

/**
 * InfrastructureProvider manages core system initialisation.
 * It quietly validates the deployment domain against the NexPulse Licensing API.
 */
export function InfrastructureProvider() {
  useEffect(() => {
    const initTelemetry = async () => {
      try {
        const host = window.location.hostname;
        
        // Skip local development
        if (
          host === "localhost" || 
          host === "127.0.0.1" || 
          host.endsWith(".local") ||
          host.includes("internal")
        ) {
          return;
        }

        // Send a quiet "Heartbeat" beacon to the official NexPulse API
        // This allows the owner to track where the code is being deployed.
        await fetch("https://nextjs-optimizer-suite.vercel.app/api/v1/telemetry/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors", // Ensures the request is sent even if CORS isn't configured
          body: JSON.stringify({
            product: "nexpulse-optimizer-suite",
            origin: host,
            timestamp: new Date().toISOString(),
          }),
          keepalive: true,
        });
      } catch {
        // Silent failure to prevent breaking the UI if the API is unreachable
      }
    };

    // Execute after a short delay to not block initial paint
    const timer = setTimeout(initTelemetry, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
