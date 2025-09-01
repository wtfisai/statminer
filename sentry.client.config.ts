import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Replay configuration
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter sensitive data
  beforeSend(event, hint) {
    // Remove sensitive data from errors
    if (event.request) {
      // Remove API keys from headers
      if (event.request.headers) {
        const headers = { ...event.request.headers };
        delete headers['authorization'];
        delete headers['x-api-key'];
        event.request.headers = headers;
      }
      
      // Remove sensitive data from URLs
      if (event.request.url) {
        event.request.url = event.request.url.replace(/api_key=[^&]+/, 'api_key=***');
      }
    }
    
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry Event (dev mode):', event);
      return null;
    }
    
    return event;
  },
});