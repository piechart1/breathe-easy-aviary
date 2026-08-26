import * as Notifications from 'expo-notifications';

const DAILY_NUDGE_ID = 'daily-practice-nudge';
const WIND_DOWN_ID = 'wind-down-at-night';

// Only prompts for OS permission the first time a reminder is actually
// turned on, never proactively - asking with no context is the surest way
// to get a reflexive "Don't Allow".
async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function scheduleDaily(identifier: string, hour: number, minute: number, title: string, body: string) {
  const granted = await ensurePermission();
  if (!granted) {
    return false;
  }

  await Notifications.cancelScheduledNotificationAsync(identifier);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
  return true;
}

export async function scheduleDailyNudge(hour: number, minute: number): Promise<boolean> {
  return scheduleDaily(
    DAILY_NUDGE_ID,
    hour,
    minute,
    'Time to breathe',
    "It's another day, make it a great one.",
  );
}

export async function cancelDailyNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NUDGE_ID);
}

export async function scheduleWindDown(hour: number, minute: number): Promise<boolean> {
  return scheduleDaily(WIND_DOWN_ID, hour, minute, 'Wind down', 'What are you grateful for today?');
}

export async function cancelWindDown(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WIND_DOWN_ID);
}
