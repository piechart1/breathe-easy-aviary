import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_ENABLED_KEY = 'breathe-easy:timer-enabled';
const TIMER_MINUTES_KEY = 'breathe-easy:timer-minutes';
const BUTEYKO_HOLD_SECONDS_KEY = 'breathe-easy:buteyko-hold-seconds';
const ANALYTICS_ENABLED_KEY = 'breathe-easy:analytics-enabled';
const HEALTH_SYNC_ENABLED_KEY = 'breathe-easy:health-sync-enabled';
const SOUND_STYLE_KEY = 'breathe-easy:sound-style';
const TUMMO_SKIP_TO_HOLD_KEY = 'breathe-easy:tummo-skip-to-hold';
const TUMMO_HOLD_SECONDS_KEY = 'breathe-easy:tummo-hold-seconds';
const TUMMO_ROUNDS_KEY = 'breathe-easy:tummo-rounds';
const TUMMO_HOLD_MODE_KEY = 'breathe-easy:tummo-hold-mode';
const TUMMO_INTEGRATION_ENABLED_KEY = 'breathe-easy:tummo-integration-enabled';
const TUMMO_INTEGRATION_MINUTES_KEY = 'breathe-easy:tummo-integration-minutes';
const DAILY_NUDGE_KEY = 'breathe-easy:daily-nudge';
const WIND_DOWN_KEY = 'breathe-easy:wind-down';

export const DEFAULT_TIMER_MINUTES = 10;
export const TIMER_MINUTE_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30] as const;

export const DEFAULT_BUTEYKO_HOLD_SECONDS = 15;
export const MIN_BUTEYKO_HOLD_SECONDS = 1;
export const MAX_BUTEYKO_HOLD_SECONDS = 300;

export type TimerSettings = { enabled: boolean; minutes: number };

export async function getTimerSettings(): Promise<TimerSettings> {
  const [enabledRaw, minutesRaw] = await Promise.all([
    AsyncStorage.getItem(TIMER_ENABLED_KEY),
    AsyncStorage.getItem(TIMER_MINUTES_KEY),
  ]);

  return {
    enabled: enabledRaw === 'true',
    minutes: minutesRaw ? Number(minutesRaw) : DEFAULT_TIMER_MINUTES,
  };
}

export async function setTimerEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(TIMER_ENABLED_KEY, String(enabled));
}

export async function setTimerMinutes(minutes: number): Promise<void> {
  await AsyncStorage.setItem(TIMER_MINUTES_KEY, String(minutes));
}

export async function getButeykoHoldSeconds(): Promise<number> {
  const raw = await AsyncStorage.getItem(BUTEYKO_HOLD_SECONDS_KEY);
  const parsed = raw ? Number(raw) : DEFAULT_BUTEYKO_HOLD_SECONDS;
  if (!Number.isFinite(parsed)) {
    return DEFAULT_BUTEYKO_HOLD_SECONDS;
  }
  return Math.min(MAX_BUTEYKO_HOLD_SECONDS, Math.max(MIN_BUTEYKO_HOLD_SECONDS, Math.round(parsed)));
}

export async function setButeykoHoldSeconds(seconds: number): Promise<void> {
  const clamped = Math.min(MAX_BUTEYKO_HOLD_SECONDS, Math.max(MIN_BUTEYKO_HOLD_SECONDS, Math.round(seconds)));
  await AsyncStorage.setItem(BUTEYKO_HOLD_SECONDS_KEY, String(clamped));
}

// Gates both crash reporting (Sentry) and product usage analytics
// (PostHog) as a single choice - off by default. See src/lib/telemetry.ts.
export async function getAnalyticsEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(ANALYTICS_ENABLED_KEY);
  return raw === 'true';
}

export async function setAnalyticsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(ANALYTICS_ENABLED_KEY, String(enabled));
}

// Logs completed sessions to Apple Health as Mindful Minutes - off by
// default, iOS only. See src/lib/healthkit.ts.
export async function getHealthSyncEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(HEALTH_SYNC_ENABLED_KEY);
  return raw === 'true';
}

export async function setHealthSyncEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(HEALTH_SYNC_ENABLED_KEY, String(enabled));
}

export type SoundStyle = 'metronome' | 'resonant';
export const DEFAULT_SOUND_STYLE: SoundStyle = 'resonant';

export async function getSoundStyle(): Promise<SoundStyle> {
  const raw = await AsyncStorage.getItem(SOUND_STYLE_KEY);
  if (raw === 'metronome' || raw === 'resonant') {
    return raw;
  }
  return DEFAULT_SOUND_STYLE;
}

export async function setSoundStyle(style: SoundStyle): Promise<void> {
  await AsyncStorage.setItem(SOUND_STYLE_KEY, style);
}

export async function getTummoSkipToHold(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(TUMMO_SKIP_TO_HOLD_KEY);
  return raw === 'true';
}

export async function setTummoSkipToHold(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(TUMMO_SKIP_TO_HOLD_KEY, String(enabled));
}

export const DEFAULT_TUMMO_HOLD_SECONDS = 60;
export const MIN_TUMMO_HOLD_SECONDS = 1;
export const MAX_TUMMO_HOLD_SECONDS = 300;

export async function getTummoHoldSeconds(): Promise<number> {
  const raw = await AsyncStorage.getItem(TUMMO_HOLD_SECONDS_KEY);
  const parsed = raw ? Number(raw) : DEFAULT_TUMMO_HOLD_SECONDS;
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TUMMO_HOLD_SECONDS;
  }
  return Math.min(MAX_TUMMO_HOLD_SECONDS, Math.max(MIN_TUMMO_HOLD_SECONDS, Math.round(parsed)));
}

export async function setTummoHoldSeconds(seconds: number): Promise<void> {
  const clamped = Math.min(MAX_TUMMO_HOLD_SECONDS, Math.max(MIN_TUMMO_HOLD_SECONDS, Math.round(seconds)));
  await AsyncStorage.setItem(TUMMO_HOLD_SECONDS_KEY, String(clamped));
}

export const DEFAULT_TUMMO_ROUNDS = 1;
export const MIN_TUMMO_ROUNDS = 1;
export const MAX_TUMMO_ROUNDS = 3;

export async function getTummoRounds(): Promise<number> {
  const raw = await AsyncStorage.getItem(TUMMO_ROUNDS_KEY);
  const parsed = raw ? Number(raw) : DEFAULT_TUMMO_ROUNDS;
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TUMMO_ROUNDS;
  }
  return Math.min(MAX_TUMMO_ROUNDS, Math.max(MIN_TUMMO_ROUNDS, Math.round(parsed)));
}

export async function setTummoRounds(rounds: number): Promise<void> {
  const clamped = Math.min(MAX_TUMMO_ROUNDS, Math.max(MIN_TUMMO_ROUNDS, Math.round(rounds)));
  await AsyncStorage.setItem(TUMMO_ROUNDS_KEY, String(clamped));
}

// 'preset' uses a fixed, configurable hold/retention duration. 'dynamic'
// instead waits for the user to tap the "Tap to move to Inhale and
// Retention" button on the Home screen, rather than timing the hold - see
// handleManualHoldAdvance in breathing-screen.tsx.
export type TummoHoldMode = 'preset' | 'dynamic';
export const DEFAULT_TUMMO_HOLD_MODE: TummoHoldMode = 'dynamic';

export async function getTummoHoldMode(): Promise<TummoHoldMode> {
  const raw = await AsyncStorage.getItem(TUMMO_HOLD_MODE_KEY);
  if (raw === 'preset' || raw === 'dynamic') {
    return raw;
  }
  return DEFAULT_TUMMO_HOLD_MODE;
}

export async function setTummoHoldMode(mode: TummoHoldMode): Promise<void> {
  await AsyncStorage.setItem(TUMMO_HOLD_MODE_KEY, mode);
}

export async function getTummoIntegrationEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(TUMMO_INTEGRATION_ENABLED_KEY);
  // Defaults to on the first time this is read (nothing persisted yet) -
  // unlike this app's other opt-in toggles, Integration should be on out
  // of the box.
  if (raw === null) {
    return true;
  }
  return raw === 'true';
}

export async function setTummoIntegrationEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(TUMMO_INTEGRATION_ENABLED_KEY, String(enabled));
}

export const TUMMO_INTEGRATION_MINUTE_OPTIONS = [3, 6, 9] as const;
export type TummoIntegrationMinutes = (typeof TUMMO_INTEGRATION_MINUTE_OPTIONS)[number];
export const DEFAULT_TUMMO_INTEGRATION_MINUTES: TummoIntegrationMinutes = 3;

export async function getTummoIntegrationMinutes(): Promise<TummoIntegrationMinutes> {
  const raw = await AsyncStorage.getItem(TUMMO_INTEGRATION_MINUTES_KEY);
  const parsed = raw ? Number(raw) : DEFAULT_TUMMO_INTEGRATION_MINUTES;
  return TUMMO_INTEGRATION_MINUTE_OPTIONS.includes(parsed as TummoIntegrationMinutes)
    ? (parsed as TummoIntegrationMinutes)
    : DEFAULT_TUMMO_INTEGRATION_MINUTES;
}

export async function setTummoIntegrationMinutes(minutes: TummoIntegrationMinutes): Promise<void> {
  await AsyncStorage.setItem(TUMMO_INTEGRATION_MINUTES_KEY, String(minutes));
}

export type ReminderSettings = { enabled: boolean; hour: number; minute: number };

async function getReminderSettings(key: string, defaultHour: number, defaultMinute: number): Promise<ReminderSettings> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return { enabled: false, hour: defaultHour, minute: defaultMinute };
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: parsed.enabled === true,
      hour: Number.isFinite(parsed.hour) ? (parsed.hour as number) : defaultHour,
      minute: Number.isFinite(parsed.minute) ? (parsed.minute as number) : defaultMinute,
    };
  } catch {
    return { enabled: false, hour: defaultHour, minute: defaultMinute };
  }
}

async function setReminderSettings(key: string, settings: ReminderSettings): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(settings));
}

export const DEFAULT_DAILY_NUDGE_HOUR = 9;
export const DEFAULT_DAILY_NUDGE_MINUTE = 0;
export const DEFAULT_WIND_DOWN_HOUR = 21;
export const DEFAULT_WIND_DOWN_MINUTE = 0;

export async function getDailyNudgeSettings(): Promise<ReminderSettings> {
  return getReminderSettings(DAILY_NUDGE_KEY, DEFAULT_DAILY_NUDGE_HOUR, DEFAULT_DAILY_NUDGE_MINUTE);
}

export async function setDailyNudgeSettings(settings: ReminderSettings): Promise<void> {
  await setReminderSettings(DAILY_NUDGE_KEY, settings);
}

export async function getWindDownSettings(): Promise<ReminderSettings> {
  return getReminderSettings(WIND_DOWN_KEY, DEFAULT_WIND_DOWN_HOUR, DEFAULT_WIND_DOWN_MINUTE);
}

export async function setWindDownSettings(settings: ReminderSettings): Promise<void> {
  await setReminderSettings(WIND_DOWN_KEY, settings);
}
