import AsyncStorage from '@react-native-async-storage/async-storage';

const TIMER_ENABLED_KEY = 'breathe-easy:timer-enabled';
const TIMER_MINUTES_KEY = 'breathe-easy:timer-minutes';

export const DEFAULT_TIMER_MINUTES = 10;
export const TIMER_MINUTE_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30] as const;

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
