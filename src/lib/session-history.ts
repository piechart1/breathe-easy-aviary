import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'breathe-easy:daily-session-seconds';

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

export async function recordSessionSeconds(seconds: number): Promise<void> {
  if (seconds <= 0) {
    return;
  }
  const totals = await readTotals();
  const key = toDateKey(new Date());
  totals[key] = (totals[key] ?? 0) + seconds;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(totals));
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
