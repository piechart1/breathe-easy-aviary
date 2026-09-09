import * as Notifications from 'expo-notifications';

const DAILY_NUDGE_ID = 'daily-practice-nudge';
const WIND_DOWN_ID = 'wind-down-at-night';

const DAILY_NUDGE_TITLE = 'Time to breathe';

// One fixed message per weekday - expo-notifications weekday numbering is
// 1-7 with 1 = Sunday, so index 0 here is Sunday's message, index 6 is
// Saturday's. Each weekday's notification is scheduled once with its own
// message and never needs to change, unlike the rotation this replaced.
const DAILY_NUDGE_BODIES = [
  "It's a new day, make it a great one",
  'Just 5 minutes of breathwork per day can reduce stress and improve resilience',
  'Five slow breaths can lower your heart rate in under a minute',
  'A few minutes of breathwork can ease anxiety before it builds',
  'Regular breathwork can sharpen focus and mental clarity',
  'Longer exhales signal to the nervous system to relax',
  'Slow diaphragmatic breathing can lower daily blood pressure levels over time',
];

const WIND_DOWN_TITLE = 'Wind down';

const WIND_DOWN_BODIES = [
  'What are you grateful for today?',
  'The 4-7-8 breathing technique calms your nervous system to help you drift off to sleep faster',
  'Controlled breathing improves heart rate variability, which is a key biological marker of how well your body adapts to pressure',
  'A few minutes of deep breathing can quiet a racing mind and ease you into sleep',
  'Regular nighttime breathwork can help you fall asleep faster and stay asleep longer',
  'Deep breathing drops cortisol which helps protect you against brain fog and poor sleep',
  'Consistent breathwork increases vagal tone which builds lasting resilience to daily stress',
];

function dailyNudgeWeekdayId(weekday: number): string {
  return `${DAILY_NUDGE_ID}-${weekday}`;
}

function windDownWeekdayId(weekday: number): string {
  return `${WIND_DOWN_ID}-${weekday}`;
}

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

async function scheduleWeekly(
  identifier: string,
  weekday: number,
  hour: number,
  minute: number,
  title: string,
  body: string,
) {
  await Notifications.cancelScheduledNotificationAsync(identifier);
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
    },
  });
}

// A single repeating notification can't vary its content by day, so both
// reminders below are 7 separate weekly triggers (one per weekday) rather
// than one daily trigger, each with its own fixed message.
export async function scheduleDailyNudge(hour: number, minute: number): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) {
    return false;
  }

  // Clean up the single daily-trigger notification this reminder used
  // before per-weekday messages existed, if it's still scheduled.
  await Notifications.cancelScheduledNotificationAsync(DAILY_NUDGE_ID);

  for (let weekday = 1; weekday <= 7; weekday++) {
    await scheduleWeekly(dailyNudgeWeekdayId(weekday), weekday, hour, minute, DAILY_NUDGE_TITLE, DAILY_NUDGE_BODIES[weekday - 1]);
  }
  return true;
}

export async function cancelDailyNudge(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NUDGE_ID);
  for (let weekday = 1; weekday <= 7; weekday++) {
    await Notifications.cancelScheduledNotificationAsync(dailyNudgeWeekdayId(weekday));
  }
}

export async function scheduleWindDown(hour: number, minute: number): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) {
    return false;
  }

  // Clean up the single daily-trigger notification this reminder used
  // before per-weekday messages existed, if it's still scheduled.
  await Notifications.cancelScheduledNotificationAsync(WIND_DOWN_ID);

  for (let weekday = 1; weekday <= 7; weekday++) {
    await scheduleWeekly(windDownWeekdayId(weekday), weekday, hour, minute, WIND_DOWN_TITLE, WIND_DOWN_BODIES[weekday - 1]);
  }
  return true;
}

export async function cancelWindDown(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WIND_DOWN_ID);
  for (let weekday = 1; weekday <= 7; weekday++) {
    await Notifications.cancelScheduledNotificationAsync(windDownWeekdayId(weekday));
  }
}
