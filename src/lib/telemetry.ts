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
//
// Sentry and PostHog are initialized independently (each in its own
// try/catch) so a failure constructing one can never silently prevent the
// other from starting - `initialized` used to be set true before either
// constructor ran, so any exception from Sentry.init() would have left
// posthogClient permanently null for the rest of the app's process
// lifetime, with nothing logged to explain why.
//
// posthogClient.optIn() is called explicitly every time, even though a
// freshly-constructed client "should" already be opted in: PostHog persists
// the opted-out flag from optOut() (below) to on-device storage, checked on
// every capture() call, independent of the JS client instance. Toggling
// analytics off and back on used to construct a new client without ever
// clearing that flag, so it silently kept refusing to send anything -
// this was the actual cause of a multi-day gap in PostHog events with no
// console error anywhere (the SDK just quietly drops the event).
export function initTelemetry(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  if (SENTRY_DSN) {
    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        sendDefaultPii: false,
      });
    } catch (error) {
      console.error('[telemetry] Sentry.init ERROR', error);
    }
  }

  if (POSTHOG_API_KEY) {
    try {
      posthogClient = new PostHog(POSTHOG_API_KEY, {
        host: POSTHOG_HOST,
        captureAppLifecycleEvents: false,
        enableSessionReplay: false,
      });
      posthogClient.optIn();
    } catch (error) {
      console.error('[telemetry] PostHog init ERROR', error);
    }
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
