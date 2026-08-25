import * as Sentry from '@sentry/react-native';
import PostHog from 'posthog-react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let posthogClient: PostHog | null = null;
let initialized = false;

// Gated behind the "Share anonymous usage & crash data" Settings toggle
// (default off) - nothing here runs, and no network calls happen, unless
// the user has opted in and initTelemetry() has been called.
export function initTelemetry(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      sendDefaultPii: false,
    });
  }

  if (POSTHOG_API_KEY) {
    posthogClient = new PostHog(POSTHOG_API_KEY, {
      host: POSTHOG_HOST,
      captureAppLifecycleEvents: false,
      enableSessionReplay: false,
    });
  }
}

// Stops both immediately (rather than just skipping the next cold start),
// so turning the Settings toggle off takes effect right away.
export async function disableTelemetry(): Promise<void> {
  await Promise.all([posthogClient?.optOut(), initialized ? Sentry.close() : Promise.resolve()]);
  posthogClient = null;
  initialized = false;
}

export function trackPatternStarted(patternId: string): void {
  posthogClient?.capture('pattern_started', { patternId });
}

export function trackSessionCompleted(patternId: string, seconds: number): void {
  posthogClient?.capture('session_completed', { patternId, seconds });
}
