import { Platform } from 'react-native';
import {
  CategoryValueNotApplicable,
  isHealthDataAvailableAsync,
  requestAuthorization,
  saveCategorySample,
} from '@kingstinct/react-native-healthkit';

const MINDFUL_SESSION_TYPE = 'HKCategoryTypeIdentifierMindfulSession';

// Only prompts for OS permission the first time it's actually needed - same
// reasoning as ensurePermission in notifications.ts. HealthKit deliberately
// never reports back whether "share" (write) access was granted or denied,
// so there's no granted flag to cache: a write with denied access just
// silently does nothing rather than throwing, and re-requesting on every
// call is a no-op once the user has already answered the system prompt.
async function ensureAuthorization(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }
  const available = await isHealthDataAvailableAsync();
  if (!available) {
    return false;
  }
  return requestAuthorization({ toShare: [MINDFUL_SESSION_TYPE] });
}

export async function logMindfulSession(startDate: Date, endDate: Date): Promise<void> {
  try {
    const authorized = await ensureAuthorization();
    if (!authorized) {
      return;
    }
    await saveCategorySample(MINDFUL_SESSION_TYPE, CategoryValueNotApplicable.notApplicable, startDate, endDate);
  } catch (error) {
    console.log('[healthkit] logMindfulSession ERROR', error);
  }
}

export async function requestHealthKitPermission(): Promise<boolean> {
  return ensureAuthorization();
}
