import * as Notifications from 'expo-notifications';

const DAILY_NUDGE_ID = 'daily-practice-nudge';
const WIND_DOWN_ID = 'wind-down-at-night';

const DAILY_NUDGE_TITLE = 'Time to breathe';
const DAILY_NUDGE_BODY = "It's a new day, make it a great one.";

// Shown on Wednesdays in place of the usual DAILY_NUDGE_BODY, one entry per
// week, cycling back to the start after the fourth. Local notifications
// can't change their own content after they're scheduled, so this only
// advances when scheduleDailyNudge runs again - see the app-launch effect in
// _layout.tsx that reschedules whenever the reminder is enabled, which is
// what keeps the rotation moving week to week.
const WEDNESDAY_ROTATION_BODIES = [
  'Just 2 minutes of breathwork per day can reduce stress and improve resilience',
  'Five slow breaths can lower your heart rate in under a minute',
  'A few minutes of breathwork can ease anxiety before it builds',
  'Regular breathwork can sharpen focus and mental clarity',
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
// expo-notifications weekday numbering: 1-7, 1 = Sunday.
const WEDNESDAY = 4;

function currentWednesdayRotationBody(): string {
  const weekIndex = Math.floor(Date.now() / WEEK_MS);
  return WEDNESDAY_ROTATION_BODIES[weekIndex % WEDNESDAY_ROTATION_BODIES.length];
}

function dailyNudgeWeekdayId(weekday: number): string {
  return `${DAILY_NUDGE_ID}-${weekday}`;
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

// The daily practice reminder repeats DAILY_NUDGE_BODY most days, but on
// Wednesday shows whichever WEDNESDAY_ROTATION_BODIES entry is due this
// week instead. A single repeating notification can't vary its content by
// day, so this is 7 separate weekly triggers (one per weekday) rather than
// one daily trigger.
export async function scheduleDailyNudge(hour: number, minute: number): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) {
    return false;
  }

  // Clean up the single daily-trigger notification this reminder used
  // before the Wednesday rotation existed, if it's still scheduled.
  await Notifications.cancelScheduledNotificationAsync(DAILY_NUDGE_ID);

  for (let weekday = 1; weekday <= 7; weekday++) {
    const body = weekday === WEDNESDAY ? currentWednesdayRotationBody() : DAILY_NUDGE_BODY;
    await scheduleWeekly(dailyNudgeWeekdayId(weekday), weekday, hour, minute, DAILY_NUDGE_TITLE, body);
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
  return scheduleDaily(WIND_DOWN_ID, hour, minute, 'Wind down', 'What are you grateful for today?');
}

export async function cancelWindDown(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(WIND_DOWN_ID);
}
