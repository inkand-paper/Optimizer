'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

/**
 * [SaaS INFRA] - Sentry Global Error Catch
 * This is the ultimate fallback for errors that occur outside of 
 * the regular page layout (e.g., in the root layout).
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[#0a0a0b] text-white">
          <h2 className="text-2xl font-bold mb-4">Critical System Error</h2>
          <p className="text-gray-400 mb-8 max-w-md">
            NexPulse encountered a critical failure. The engineering team has been notified.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-np-gold text-black rounded font-medium hover:bg-np-gold/90 transition-all"
          >
            Restart Application
          </button>
        </div>
      </body>
    </html>
  );
}
