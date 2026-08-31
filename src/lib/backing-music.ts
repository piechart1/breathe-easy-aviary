import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AudioSource } from 'expo-audio';

import type { TummoSoundtrack } from './settings';

const ROTATION_INDEX_KEY = 'breathe-easy:backing-music-rotation-index';

// Every non-Tummo pattern draws from this same pool and shares this one
// rotation index (see getNextBackingMusicTrackIndex below) - starting
// Buteyko, then Box Breathing, then Buteyko again still advances one track
// at a time rather than each pattern keeping its own cycle. Order here is
// arbitrary (alphabetical by filename) - reorder freely, this array is the
// only thing that determines rotation order. Exported as individual sources
// (rather than looped over) because breathing-screen.tsx needs one
// useAudioPlayer() call per track - see the comment there on why each track
// gets its own pre-loaded player instead of one shared player whose source
// gets swapped.
//
// Files live flat in assets/sounds/ (bgm- prefix) rather than in a
// backing-music/ subfolder, with hyphenated names instead of the original
// "Artist - Title.mp3" naming - matching every other sound in this
// directory. That wasn't just tidiness: nested folders + spaces in the
// filename were the last remaining difference between these tracks and
// every other (working) sound here after ruling out format (.mp3 vs .m4a)
// and load strategy (plain vs downloadFirst) as the cause of the tracks
// never finishing loading on-device.
export const BACKING_MUSIC_ROTATION_SOURCES: AudioSource[] = [
  require('../../assets/sounds/bgm-guillermo-guareschi-a-sweet-story.m4a'),
  require('../../assets/sounds/bgm-pufino-careful.m4a'),
  require('../../assets/sounds/bgm-pufino-enlivening.m4a'),
  require('../../assets/sounds/bgm-pufino-thoughtful.m4a'),
  require('../../assets/sounds/bgm-spiring-city-life.m4a'),
  require('../../assets/sounds/bgm-walen-dark-heart.m4a'),
  require('../../assets/sounds/bgm-walen-freedom-motivation.m4a'),
];

// The only track free (non-Plus) users get - "Pufino - Enlivening". Free
// users skip getNextBackingMusicTrackIndex() entirely and always play this
// index instead, so they never advance through (or persist a position in)
// the shared rotation counter.
export const FREE_TIER_BACKING_MUSIC_INDEX = 2;

// Advances the persisted rotation index by one (wrapping around) and
// returns its position in BACKING_MUSIC_ROTATION_SOURCES - called once per
// session start for every pattern except Tummo, which uses
// TUMMO_SOUNDTRACK_SOURCES instead.
export async function getNextBackingMusicTrackIndex(): Promise<number> {
  const raw = await AsyncStorage.getItem(ROTATION_INDEX_KEY);
  const current = raw ? Number(raw) : -1;
  const next = (Number.isFinite(current) ? current + 1 : 0) % BACKING_MUSIC_ROTATION_SOURCES.length;
  await AsyncStorage.setItem(ROTATION_INDEX_KEY, String(next));
  return next;
}

// Tummo ignores the general rotation/Backing Music toggle entirely -
// Settings' per-pattern Soundtrack Selection instead picks one of these two
// fixed pairs. "main" plays through the rapid breaths, hold, and recovery;
// "integration" takes over once the Integration phase begins.
export const TUMMO_SOUNDTRACK_SOURCES: Record<
  Exclude<TummoSoundtrack, 'off'>,
  { main: AudioSource; integration: AudioSource }
> = {
  set1: {
    main: require('../../assets/sounds/bgm-spiring-city-life.m4a'),
    integration: require('../../assets/sounds/bgm-guillermo-guareschi-a-sweet-story.m4a'),
  },
  set2: {
    main: require('../../assets/sounds/bgm-pufino-enlivening.m4a'),
    integration: require('../../assets/sounds/bgm-pufino-careful.m4a'),
  },
};
