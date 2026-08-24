import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'breathe-easy:daily-session-seconds';
const COUNT_STORAGE_KEY = 'breathe-easy:daily-session-counts';

export type DailyTotal = {
  dateKey: string;
  date: Date;
  seconds: number;
};

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function readTotals(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

async function readCounts(): Promise<Record<string, number>> {
  const raw = await AsyncStorage.getItem(COUNT_STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}

export async function recordSessionSeconds(seconds: number): Promise<void> {
  if (seconds <= 0) {
    return;
  }
  const [totals, counts] = await Promise.all([readTotals(), readCounts()]);
  const key = toDateKey(new Date());
  totals[key] = (totals[key] ?? 0) + seconds;
  counts[key] = (counts[key] ?? 0) + 1;
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(totals)),
    AsyncStorage.setItem(COUNT_STORAGE_KEY, JSON.stringify(counts)),
  ]);
}

export async function getDailyTotals(days: number): Promise<DailyTotal[]> {
  const totals = await readTotals();
  const result: DailyTotal[] = [];
  const today = new Date();

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    const dateKey = toDateKey(date);
    result.push({ dateKey, date, seconds: totals[dateKey] ?? 0 });
  }

  return result;
}

export async function getStreakDays(): Promise<number> {
  const totals = await readTotals();
  const today = new Date();

  // If today has no recorded session yet, that shouldn't zero out an
  // otherwise unbroken streak - start counting from yesterday instead.
  const startOffset = (totals[toDateKey(today)] ?? 0) > 0 ? 0 : 1;

  let streak = 0;
  for (let offset = startOffset; ; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    if ((totals[toDateKey(date)] ?? 0) <= 0) {
      break;
    }
    streak += 1;
  }

  return streak;
}

export async function getTotalSessionCount(): Promise<number> {
  const counts = await readCounts();
  return Object.values(counts).reduce((sum, count) => sum + count, 0);
}
