import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Adjust this value in production
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive environment variables
    if (event.extra) {
      const extra = { ...event.extra };
      delete extra.OPENAI_API_KEY;
      delete extra.ANTHROPIC_API_KEY;
      delete extra.NEO4J_PASSWORD;
      event.extra = extra;
    }
    
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Server Event (dev mode):', event);
      return null;
    }
    
    return event;
  },
});