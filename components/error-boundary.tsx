'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

/**
 * [SaaS INFRA] - Global Sentry Error Boundary
 * Captures frontend crashes and provides a clean recovery UI for the user.
 */
export function GlobalErrorBoundary({ error, reset }: { 
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry with context
    Sentry.captureException(error, {
      tags: {
        component: 'global-error-boundary',
        digest: error.digest
      }
    });
  }, [error]);
  
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl">
      <div className="h-16 w-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight mb-2 text-foreground">Something went wrong</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto text-[14px]">
        Our neural safety system captured a frontend crash. The engineering team has been notified via Sentry.
      </p>
      
      <div className="flex items-center gap-4">
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/dashboard'}
          className="h-11 px-6 text-[13px]"
        >
          Back to Dashboard
        </Button>
        <Button 
          onClick={reset}
          className="np-btn-primary h-11 px-6 text-[13px] gap-2"
        >
          <RefreshCcw className="h-4 w-4" /> Try again
        </Button>
      </div>
      
      {error.digest && (
        <p className="mt-8 text-[11px] font-mono text-muted-foreground/50">
          Trace ID: {error.digest}
        </p>
      )}
    </div>
  );
}
