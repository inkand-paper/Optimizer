import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  // [PERFORMANCE] Lower sample rate for production to avoid overhead
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  environment: process.env.NODE_ENV,

  // BeforeSend allows us to filter or modify events before they reach Sentry
  beforeSend(event) {
    // Detect AI provider failures and tag them as critical
    if (event.exception?.values?.some(e => 
      e.value?.includes('GROQ_API_ERROR') || 
      e.value?.includes('GEMINI_TIMEOUT') ||
      e.value?.includes('AI_FALLBACK')
    )) {
      event.tags = { 
        ...event.tags,
        severity: 'critical',
        component: 'ai-analyzer',
        requires_immediate_action: 'true'
      };
    }
    
    // Detect RLS policy violations from Postgres
    if (event.exception?.values?.some(e => 
      e.value?.includes('row level security') ||
      e.value?.includes('permission denied')
    )) {
      event.tags = {
        ...event.tags,
        severity: 'high',
        component: 'database',
        type: 'rls_violation'
      };
    }
    
    return event;
  }
});
