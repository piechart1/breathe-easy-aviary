import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_ENABLED_KEY = 'breathe-easy:timer-enabled';
const TIMER_MINUTES_KEY = 'breathe-easy:timer-minutes';
const BUTEYKO_HOLD_SECONDS_KEY = 'breathe-easy:buteyko-hold-seconds';
const ANALYTICS_ENABLED_KEY = 'breathe-easy:analytics-enabled';
const SOUND_STYLE_KEY = 'breathe-easy:sound-style';
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

export type SoundStyle = 'metronome' | 'resonant';
export const DEFAULT_SOUND_STYLE: SoundStyle = 'metronome';

export async function getSoundStyle(): Promise<SoundStyle> {
  const raw = await AsyncStorage.getItem(SOUND_STYLE_KEY);
  return raw === 'resonant' ? 'resonant' : DEFAULT_SOUND_STYLE;
}

export async function setSoundStyle(style: SoundStyle): Promise<void> {
  await AsyncStorage.setItem(SOUND_STYLE_KEY, style);
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
