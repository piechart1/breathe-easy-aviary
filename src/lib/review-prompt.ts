import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { AppState } from 'react-native';

const QUALIFYING_SESSIONS_KEY = 'breathe-easy:review-qualifying-sessions';

// Only sessions of at least a minute count, so stopping early or trying a
// pattern for a few seconds doesn't move someone towards being asked.
const MIN_QUALIFYING_SESSION_SECONDS = 60;
// Ask after the 3rd qualifying session, then again at the 15th and 40th.
// iOS decides whether the prompt is actually shown and limits it to three
// times a year per app, so these are opportunities rather than guarantees.
const PROMPT_AT_SESSION_COUNTS = [3, 15, 40];
// Long enough for "Session complete" to be seen before the system prompt
// appears over it.
const PROMPT_DELAY_MS = 2000;

// Called at the end of every session. Counts the session if it was long
// enough and, when the count reaches one of the points above, asks iOS to
// show its rating prompt. Never throws - a rating prompt failing is not
// something to surface to the person who just finished breathing.
export async function noteSessionForReviewPrompt(secondsPracticed: number): Promise<void> {
  if (secondsPracticed < MIN_QUALIFYING_SESSION_SECONDS) {
    return;
  }
  try {
    const raw = await AsyncStorage.getItem(QUALIFYING_SESSIONS_KEY);
    const count = (Number.parseInt(raw ?? '0', 10) || 0) + 1;
    await AsyncStorage.setItem(QUALIFYING_SESSIONS_KEY, String(count));
    if (!PROMPT_AT_SESSION_COUNTS.includes(count)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, PROMPT_DELAY_MS));
    // A session can end with the phone locked or the app in the background
    // (Auto Stop, an interruption); the prompt is only for someone looking
    // at the app.
    if (AppState.currentState !== 'active') {
      return;
    }
    if (await StoreReview.isAvailableAsync()) {
      await StoreReview.requestReview();
    }
  } catch (error) {
    console.log('[review-prompt] failed', error);
  }
}
