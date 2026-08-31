import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setAudioModeAsync, useAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import {
  BREATHING_PATTERNS,
  BreathingColors,
  MIN_BREATH_SCALE,
  MAX_BREATH_SCALE,
  PATTERN_ACCENT_COLORS,
  TUMMO_RAPID_PHASE_COUNT,
  type BreathingPattern,
  type BreathingPhase,
  type PhaseName,
} from '@/constants/breathing-patterns';
import { SystemFont, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  BACKING_MUSIC_ROTATION_SOURCES,
  FREE_TIER_BACKING_MUSIC_INDEX,
  getNextBackingMusicTrackIndex,
  TUMMO_SOUNDTRACK_SOURCES,
} from '@/lib/backing-music';
import { logMindfulSession } from '@/lib/healthkit';
import { presentPlusPaywall, useIsPlus } from '@/lib/purchases';
import { recordSessionSeconds } from '@/lib/session-history';
import {
  DEFAULT_BACKING_MUSIC_ENABLED,
  DEFAULT_BUTEYKO_HOLD_SECONDS,
  DEFAULT_SOUND_STYLE,
  DEFAULT_TIMER_MINUTES,
  DEFAULT_TUMMO_HOLD_MODE,
  DEFAULT_TUMMO_HOLD_SECONDS,
  DEFAULT_TUMMO_INTEGRATION_MINUTES,
  DEFAULT_TUMMO_ROUNDS,
  DEFAULT_TUMMO_SOUNDTRACK,
  MAX_TUMMO_HOLD_SECONDS,
  type SoundStyle,
  type TummoHoldMode,
  type TummoIntegrationMinutes,
  type TummoSoundtrack,
  getBackingMusicEnabled,
  getButeykoHoldSeconds,
  getHealthSyncEnabled,
  getSoundStyle,
  getTimerSettings,
  getTummoHoldMode,
  getTummoHoldSeconds,
  getTummoIntegrationEnabled,
  getTummoIntegrationMinutes,
  getTummoRounds,
  getTummoSkipToHold,
  getTummoSoundtrack,
} from '@/lib/settings';
import { trackPatternStarted, trackSessionCompleted } from '@/lib/telemetry';

const CIRCLE_SIZE = 120;
const GLOW_OUTER_SIZE = CIRCLE_SIZE * 2.0;
const GLOW_INNER_SIZE = CIRCLE_SIZE * 1.5;

const BG_MAGPIE_SOURCE = require('../../assets/images/bg-magpie.png');
const BG_MAGPIE_SIZE = 380;
const BG_MAGPIE_OPACITY = 0.2;
const BG_MAGPIE_LIFT = 20;
const BG_MAGPIE_SHIFT_LEFT = 10;
const TICK_SOURCE = require('../../assets/sounds/tick.wav');
const TICK_ACCENT_VOLUME = 1;
const TICK_VOLUME = 0.15;
// Kept low relative to the ticks/voice cues (TICK_VOLUME just above,
// RESONANT_CUE_VOLUME below) since it's meant to sit underneath them, not
// compete with them.
const BACKING_MUSIC_VOLUME = 0.35;

// Resonant sound style: one spoken cue per phase instead of the metronome's
// repeated ticks. Most of Tummo's phases don't have a resonant cue set up
// yet - its rapid-breath phases would re-trigger the same cue dozens of
// times per round, so they use their own dedicated, shorter tummo-inhale/
// tummo-exhale cues instead of the regular inhale/exhale ones (see the
// pattern.id === 'tummo' check in runPhase below). Keyed by id rather than
// just phase name so a pattern with more than one phase of the same name
// can use a different cue for each - e.g. Cyclic Sighing's short second
// "top-off" inhale (see resonantSoundId in breathing-patterns.ts).
const RESONANT_SOUND_SOURCES = {
  inhale: require('../../assets/sounds/breathe-in-relaxed.m4a'),
  'inhale-top-off': require('../../assets/sounds/in-relaxed.m4a'),
  hold: require('../../assets/sounds/hold.m4a'),
  'hold-down-intonation': require('../../assets/sounds/Hold-downintonation.m4a'),
  exhale: require('../../assets/sounds/breathe-out-relaxed.m4a'),
  'tummo-inhale': require('../../assets/sounds/audible-in-new.m4a'),
  'tummo-exhale': require('../../assets/sounds/audio-out-4.m4a'),
  'out-relaxed': require('../../assets/sounds/out-relaxed.m4a'),
  'last-one': require('../../assets/sounds/Last-One.m4a'),
  'five-more': require('../../assets/sounds/5-more.m4a'),
  'keep-it-going': require('../../assets/sounds/Keep-it-going.m4a'),
  'delicate-bells': require('../../assets/sounds/delicate-bells.m4a'),
  'breath-hold-from-now-on': require('../../assets/sounds/breath-hold-from-now-on.m4a'),
  'relax-your-body-slow-your-heartbeat': require('../../assets/sounds/relax-your-body-slow-your-heartbeat.m4a'),
  'relax-your-shoulders': require('../../assets/sounds/relax-your-shoulders-00.m4a'),
  'relax-your-body': require('../../assets/sounds/relax-your-body-00.m4a'),
  'feel-the-weight-of-your-body-resting': require('../../assets/sounds/feel-the-weight-of-your-body-resting.m4a'),
  'youre-doing-great': require('../../assets/sounds/youre-doing-great.m4a'),
  'minute-1': require('../../assets/sounds/1-minute.m4a'),
  'minute-2': require('../../assets/sounds/2-minutes.m4a'),
  'minute-3': require('../../assets/sounds/3-minutes.m4a'),
  'minute-4': require('../../assets/sounds/4-minutes.m4a'),
  'take-a-deep-breath-in-and-hold': require('../../assets/sounds/Take-a-deep-breath-in-and-hold-00.m4a'),
  '5-4-3-2-1-let-go': require('../../assets/sounds/5-4-3-2-1-let-go.m4a'),
  'nothing-more-to-do': require('../../assets/sounds/there-is-nothing-more-to-do.m4a'),
  'blink-your-eyes': require('../../assets/sounds/whenever-you-feel-ready-blink-your-eyes.m4a'),
} as const;
// Integration's own two spoken cues (see the Integration branch in runPhase
// below) - hardcoded to the source files' actual lengths rather than read
// from the player at schedule time, matching this file's existing style of
// precomputed cue-timing constants (e.g. TUMMO_HOLD_CUE_* above).
const INTEGRATION_BLINK_CUE_DURATION_MS = 7190;
const INTEGRATION_FADE_DURATION_MS = 10000;
const INTEGRATION_FADE_STEP_MS = 100;
const RESONANT_CUE_VOLUME = 1;
// Tummo's rapid-breath cues repeat every ~1.5s for up to 30 breaths, so they
// run quieter than the rest of the resonant cues, which only play once per
// (much longer) phase.
const RESONANT_CUE_VOLUME_OVERRIDES: Partial<Record<keyof typeof RESONANT_SOUND_SOURCES, number>> = {
  'tummo-inhale': 0.05,
  'tummo-exhale': 0.05,
};

// null return means the phase explicitly opted out of a start-of-phase cue
// (resonantSoundId: null) - distinct from it being omitted, which falls
// back to the phase's name.
function resonantSoundIdForPhase(phase: BreathingPhase): keyof typeof RESONANT_SOUND_SOURCES | null {
  if (phase.resonantSoundId === null) {
    return null;
  }
  if (phase.resonantSoundId && phase.resonantSoundId in RESONANT_SOUND_SOURCES) {
    return phase.resonantSoundId as keyof typeof RESONANT_SOUND_SOURCES;
  }
  return phase.name.toLowerCase() as keyof typeof RESONANT_SOUND_SOURCES;
}

// The primary cue (if any) plus any resonantOverlaySoundIds, all played
// concurrently on their own player instances - see playResonantCue below.
function resonantSoundIdsForPhase(phase: BreathingPhase): (keyof typeof RESONANT_SOUND_SOURCES)[] {
  const primaryId = resonantSoundIdForPhase(phase);
  const overlayIds = (phase.resonantOverlaySoundIds ?? []).filter(
    (id): id is keyof typeof RESONANT_SOUND_SOURCES => id in RESONANT_SOUND_SOURCES,
  );
  return primaryId ? [primaryId, ...overlayIds] : overlayIds;
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Buteyko's timing string has a literal "hold" placeholder since its hold
// duration is user-configurable (Settings) rather than fixed like every
// other pattern - swap in the actual duration wherever timing is shown.
function getPatternTiming(
  pattern: BreathingPattern,
  buteykoHoldSeconds: number,
  tummoHoldSeconds: number,
  tummoHoldMode: TummoHoldMode,
): string | undefined {
  if (pattern.id === 'buteyko' && pattern.timing) {
    return pattern.timing.replace('hold', `${buteykoHoldSeconds}`);
  }
  if (pattern.id === 'tummo' && pattern.timing) {
    // Dynamic retention has no fixed length to show - the live elapsed
    // count while actually in that phase is rendered separately, over top
    // of this label, in the "Tap to begin" timing segments below.
    const holdLabel = tummoHoldMode === 'dynamic' ? 'dynamic' : `${tummoHoldSeconds}`;
    return pattern.timing.replace('hold', holdLabel);
  }
  return pattern.timing;
}

// Tummo's card name reflects the number of rounds and (when Settings'
// Integration toggle is on) the integration period that follows the final
// round, since together those determine how the whole session plays out.
function getPatternDisplayName(
  pattern: BreathingPattern,
  tummoRounds: number,
  tummoIntegrationEnabled: boolean,
  tummoIntegrationMinutes: number,
): string {
  if (pattern.id === 'tummo') {
    const roundsLabel = `${tummoRounds} round${tummoRounds === 1 ? '' : 's'}`;
    return tummoIntegrationEnabled
      ? `${pattern.name} - ${roundsLabel} then ${tummoIntegrationMinutes} minutes integration`
      : `${pattern.name} - ${roundsLabel}`;
  }
  return pattern.name;
}

// Reassurance cues for Tummo's retention hold, for as long as the hold
// actually runs (its duration is user-configurable up to
// MAX_TUMMO_HOLD_SECONDS). Within one pass through the cycle, cues are 14s
// apart; once the cycle finishes, the next pass starts 18s after the last
// cue rather than 14s - e.g. 2s, 16s, 30s, 44s, then 62s, 76s, 90s, 104s...
const TUMMO_HOLD_CUE_CYCLE = [
  'relax-your-body-slow-your-heartbeat',
  'relax-your-shoulders',
  'relax-your-body',
  'feel-the-weight-of-your-body-resting',
] as const;
const TUMMO_HOLD_CUE_START_MS = 2000;
const TUMMO_HOLD_CUE_WITHIN_CYCLE_INTERVAL_MS = 14000;
const TUMMO_HOLD_CUE_CYCLE_RESTART_GAP_MS = 18000;

// Sentinel phaseIndex for Tummo's Integration phase - it's appended once
// after the final round rather than living in the pattern's own repeating
// phases array, so it can't be reached by the normal (phaseIndex + 1) %
// phases.length advance. runPhase resolves it to a synthetic BreathingPhase
// built from Settings' integration-minutes value instead of indexing into
// pattern.phases. No audio cues yet - resonant/tick scheduling is skipped
// for it entirely, since real cues are still to come as audio files.
const INTEGRATION_PHASE_INDEX = -1;

// Fixed minute-mark callouts, layered on top of the reassurance cycle above:
// a bell chime exactly on each round minute, then the spoken minute count a
// second later. No 5-minute spoken callout - it would sit at
// MAX_TUMMO_HOLD_SECONDS exactly, past which the practitioner can't hold
// anyway. The 300s bell chime has the same edge case (only reachable if the
// max were ever raised) but is kept for consistency with the other four.
const TUMMO_HOLD_FIXED_CUES: { atMs: number; soundId: string }[] = [
  { atMs: 60000, soundId: 'delicate-bells' },
  { atMs: 61000, soundId: 'minute-1' },
  { atMs: 120000, soundId: 'delicate-bells' },
  { atMs: 121000, soundId: 'minute-2' },
  { atMs: 180000, soundId: 'delicate-bells' },
  { atMs: 181000, soundId: 'minute-3' },
  { atMs: 240000, soundId: 'delicate-bells' },
  { atMs: 241000, soundId: 'minute-4' },
  { atMs: 300000, soundId: 'delicate-bells' },
];

function tummoHoldDelayedCues(durationMs: number): { atMs: number; soundId: string }[] {
  const cues: { atMs: number; soundId: string }[] = [];
  const cycleLength = TUMMO_HOLD_CUE_CYCLE.length;
  const cyclePeriodMs =
    (cycleLength - 1) * TUMMO_HOLD_CUE_WITHIN_CYCLE_INTERVAL_MS + TUMMO_HOLD_CUE_CYCLE_RESTART_GAP_MS;

  for (let cycleStartMs = TUMMO_HOLD_CUE_START_MS; cycleStartMs < durationMs; cycleStartMs += cyclePeriodMs) {
    for (let i = 0; i < cycleLength; i += 1) {
      const atMs = cycleStartMs + i * TUMMO_HOLD_CUE_WITHIN_CYCLE_INTERVAL_MS;
      if (atMs >= durationMs) {
        break;
      }
      cues.push({ atMs, soundId: TUMMO_HOLD_CUE_CYCLE[i] });
    }
  }

  for (const fixedCue of TUMMO_HOLD_FIXED_CUES) {
    if (fixedCue.atMs < durationMs) {
      cues.push(fixedCue);
    }
  }

  return cues;
}

// Guards against a slow-resolving seekTo() from an older play request
// finishing after a newer request for the same player has already started -
// without this, the stale call's play() can fire after (and stomp on) the
// newer one, which is audible as a cut-off or dropped cue.
const playRequestGeneration = new WeakMap<AudioPlayer, number>();

// Keeps `player` playing for as long as it's the currently-active backing
// track, reacting to *any* playbackStatusUpdate that reports it's stopped -
// not just a one-off delayed check - since on-device this can fail two
// different ways: never starting at all (stuck in AVPlayer's
// "evaluatingBufferingRate" wait state right after play()), or starting
// fine and then stalling a moment later (the initial primed buffer running
// out before more has downloaded). A single delayed check only ever caught
// the first case; the second one showed no logs at all because by the time
// it stalled, that one-shot check had already seen "playing" once and
// stopped looking.
//
// Resets (pause + seek to 0 + play) rather than just calling play() again,
// since that's a no-op on a player already stuck "waiting". Ignores
// updates in the first GRACE_PERIOD_MS after being attached (normal
// startup briefly reports not-playing) and rate-limits recovery attempts
// so a genuinely broken source can't spin in a tight loop.
//
// Caller owns the returned subscription's lifetime: remove() it as soon as
// this player stops being the one that's supposed to be playing (swapping
// to a different track, or the session stopping) - otherwise it will "helpfully"
// resume a deliberate pause.
function watchAndKeepBackingMusicPlaying(
  player: AudioPlayer,
  label: string,
  isRunningRef: { current: boolean },
): { remove: () => void } {
  const GRACE_PERIOD_MS = 500;
  const MIN_RECOVERY_INTERVAL_MS = 800;
  const attachedAt = Date.now();
  let lastRecoveryAt = 0;
  let recovering = false;

  const subscription = player.addListener('playbackStatusUpdate', (status) => {
    if (!isRunningRef.current) {
      subscription.remove();
      return;
    }
    if (status.playing || recovering) {
      return;
    }
    const now = Date.now();
    if (now - attachedAt < GRACE_PERIOD_MS || now - lastRecoveryAt < MIN_RECOVERY_INTERVAL_MS) {
      return;
    }
    recovering = true;
    lastRecoveryAt = now;
    console.log(`[backing-music] ${label}: stopped unexpectedly, resetting and retrying`);
    player.pause();
    player
      .seekTo(0)
      .catch((error) => console.log('[backing-music] seekTo failed during recovery', error))
      .finally(() => {
        if (isRunningRef.current) {
          player.play();
        }
        recovering = false;
      });
  });

  return subscription;
}

async function playSound(player: AudioPlayer, volume: number) {
  if (!player.isLoaded) {
    return;
  }
  const generation = (playRequestGeneration.get(player) ?? 0) + 1;
  playRequestGeneration.set(player, generation);
  try {
    player.volume = volume;
    await player.seekTo(0);
    if (playRequestGeneration.get(player) !== generation) {
      return;
    }
    player.play();
  } catch (error) {
    console.log('[audio] ERROR', error);
  }
}

type Styles = ReturnType<typeof createStyles>;

function PatternCard({
  pattern,
  displayName,
  timing,
  isSelected,
  isRunning,
  isLocked,
  accentColor,
  theme,
  styles,
  onSelect,
  onShowInfo,
}: {
  pattern: BreathingPattern;
  displayName?: string;
  timing?: string;
  isSelected: boolean;
  isRunning: boolean;
  isLocked: boolean;
  accentColor: string;
  theme: ReturnType<typeof useTheme>;
  styles: Styles;
  onSelect: () => void;
  onShowInfo: () => void;
}) {
  const name = displayName ?? pattern.name;
  return (
    <Pressable
      disabled={isRunning}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${timing ? `${timing}, ` : ''}${pattern.description}${isLocked ? ', Plus' : ''}`}
      accessibilityState={{ selected: isSelected, disabled: isRunning }}
      style={({ pressed }) => [
        styles.patternCard,
        isSelected && styles.patternCardSelected,
        {
          opacity: isRunning ? 0.55 : pressed ? 0.9 : 1,
          borderColor: isSelected ? accentColor : theme.border,
        },
      ]}>
      <View style={styles.patternCardHeader}>
        <ThemedText type="smallBold" style={styles.patternName}>{name}</ThemedText>
        <View style={styles.patternCardHeaderIcons}>
          {isLocked && (
            <SymbolView
              name={{ ios: 'lock.fill', android: 'lock', web: 'lock' }}
              size={16}
              tintColor={theme.textSecondary}
            />
          )}
          <Pressable
            onPress={onShowInfo}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`About ${pattern.name}`}>
            <SymbolView
              name={{ ios: 'info.circle', android: 'info', web: 'info' }}
              size={18}
              tintColor={theme.textSecondary}
            />
          </Pressable>
        </View>
      </View>
      <ThemedText type="small" style={styles.patternDescription}>
        {timing ? `${timing} | ${pattern.description}` : pattern.description}
      </ThemedText>
    </Pressable>
  );
}

export function BreathingScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scaleAnim = useRef(new Animated.Value(MIN_BREATH_SCALE)).current;
  const isRunningRef = useRef(false);
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const resonantCueTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // How many full cycles through the current pattern's phases have
  // completed this session - only used to auto-stop Tummo after its
  // configured number of rounds instead of looping forever.
  const completedRoundsRef = useRef(0);
  const phaseElapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  // Whichever backing-music player is currently supposed to be playing -
  // see watchAndKeepBackingMusicPlaying above. Reassigned (with the
  // previous one removed first) at every point where "the active track"
  // changes: session start and the Tummo Integration swap.
  const backingMusicWatcherRef = useRef<{ remove: () => void } | null>(null);
  const tickPlayer = useAudioPlayer(TICK_SOURCE);
  // One player per possible backing track, pre-loaded from mount - matches
  // every other sound in this file (each resonant cue below is its own
  // useAudioPlayer(SOURCE) too) rather than one shared player whose source
  // gets swapped with .replace() at session-start time. These are .m4a
  // (like every other sound here) rather than the .mp3 originals - mp3
  // hit a documented expo-audio/iOS AVPlayer bug where content-type
  // inference fails and the asset never finishes loading; converting to
  // .m4a sidesteps that class of bug entirely rather than working around it.
  const rotationPlayer0 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[0]);
  const rotationPlayer1 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[1]);
  const rotationPlayer2 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[2]);
  const rotationPlayer3 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[3]);
  const rotationPlayer4 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[4]);
  const rotationPlayer5 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[5]);
  const rotationPlayer6 = useAudioPlayer(BACKING_MUSIC_ROTATION_SOURCES[6]);
  const rotationPlayers = useMemo(
    () => [
      rotationPlayer0,
      rotationPlayer1,
      rotationPlayer2,
      rotationPlayer3,
      rotationPlayer4,
      rotationPlayer5,
      rotationPlayer6,
    ],
    [rotationPlayer0, rotationPlayer1, rotationPlayer2, rotationPlayer3, rotationPlayer4, rotationPlayer5, rotationPlayer6],
  );
  const tummoSet1MainPlayer = useAudioPlayer(TUMMO_SOUNDTRACK_SOURCES.set1.main);
  const tummoSet1IntegrationPlayer = useAudioPlayer(TUMMO_SOUNDTRACK_SOURCES.set1.integration);
  const tummoSet2MainPlayer = useAudioPlayer(TUMMO_SOUNDTRACK_SOURCES.set2.main);
  const tummoSet2IntegrationPlayer = useAudioPlayer(TUMMO_SOUNDTRACK_SOURCES.set2.integration);
  const allBackingMusicPlayers = useMemo(
    () => [...rotationPlayers, tummoSet1MainPlayer, tummoSet1IntegrationPlayer, tummoSet2MainPlayer, tummoSet2IntegrationPlayer],
    [rotationPlayers, tummoSet1MainPlayer, tummoSet1IntegrationPlayer, tummoSet2MainPlayer, tummoSet2IntegrationPlayer],
  );
  const resonantInhalePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES.inhale);
  const resonantInhaleTopOffPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['inhale-top-off']);
  const resonantHoldPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES.hold);
  const resonantHoldDownIntonationPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['hold-down-intonation']);
  const resonantExhalePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES.exhale);
  const resonantTummoInhalePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['tummo-inhale']);
  const resonantTummoExhalePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['tummo-exhale']);
  const resonantOutRelaxedPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['out-relaxed']);
  const resonantLastOnePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['last-one']);
  const resonantFiveMorePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['five-more']);
  const resonantKeepItGoingPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['keep-it-going']);
  const resonantDelicateBellsPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['delicate-bells']);
  const resonantBreathHoldFromNowOnPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['breath-hold-from-now-on']);
  const resonantRelaxYourBodyPlayer = useAudioPlayer(
    RESONANT_SOUND_SOURCES['relax-your-body-slow-your-heartbeat'],
  );
  const resonantRelaxYourShouldersCuePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['relax-your-shoulders']);
  const resonantRelaxYourBodyCuePlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['relax-your-body']);
  const resonantFeelTheWeightPlayer = useAudioPlayer(
    RESONANT_SOUND_SOURCES['feel-the-weight-of-your-body-resting'],
  );
  const resonantDoingGreatPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['youre-doing-great']);
  const resonantMinute1Player = useAudioPlayer(RESONANT_SOUND_SOURCES['minute-1']);
  const resonantMinute2Player = useAudioPlayer(RESONANT_SOUND_SOURCES['minute-2']);
  const resonantMinute3Player = useAudioPlayer(RESONANT_SOUND_SOURCES['minute-3']);
  const resonantMinute4Player = useAudioPlayer(RESONANT_SOUND_SOURCES['minute-4']);
  const resonantTakeADeepBreathPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['take-a-deep-breath-in-and-hold']);
  const resonantLetGoCountdownPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['5-4-3-2-1-let-go']);
  const resonantNothingMoreToDoPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['nothing-more-to-do']);
  const resonantBlinkYourEyesPlayer = useAudioPlayer(RESONANT_SOUND_SOURCES['blink-your-eyes']);
  const resonantPlayers = useMemo(
    () => ({
      inhale: resonantInhalePlayer,
      'inhale-top-off': resonantInhaleTopOffPlayer,
      hold: resonantHoldPlayer,
      'hold-down-intonation': resonantHoldDownIntonationPlayer,
      exhale: resonantExhalePlayer,
      'tummo-inhale': resonantTummoInhalePlayer,
      'tummo-exhale': resonantTummoExhalePlayer,
      'out-relaxed': resonantOutRelaxedPlayer,
      'last-one': resonantLastOnePlayer,
      'five-more': resonantFiveMorePlayer,
      'keep-it-going': resonantKeepItGoingPlayer,
      'delicate-bells': resonantDelicateBellsPlayer,
      'breath-hold-from-now-on': resonantBreathHoldFromNowOnPlayer,
      'relax-your-body-slow-your-heartbeat': resonantRelaxYourBodyPlayer,
      'relax-your-shoulders': resonantRelaxYourShouldersCuePlayer,
      'relax-your-body': resonantRelaxYourBodyCuePlayer,
      'feel-the-weight-of-your-body-resting': resonantFeelTheWeightPlayer,
      'youre-doing-great': resonantDoingGreatPlayer,
      'minute-1': resonantMinute1Player,
      'minute-2': resonantMinute2Player,
      'minute-3': resonantMinute3Player,
      'minute-4': resonantMinute4Player,
      'take-a-deep-breath-in-and-hold': resonantTakeADeepBreathPlayer,
      '5-4-3-2-1-let-go': resonantLetGoCountdownPlayer,
      'nothing-more-to-do': resonantNothingMoreToDoPlayer,
      'blink-your-eyes': resonantBlinkYourEyesPlayer,
    }),
    [
      resonantInhalePlayer,
      resonantInhaleTopOffPlayer,
      resonantHoldPlayer,
      resonantHoldDownIntonationPlayer,
      resonantExhalePlayer,
      resonantTummoInhalePlayer,
      resonantTummoExhalePlayer,
      resonantOutRelaxedPlayer,
      resonantLastOnePlayer,
      resonantFiveMorePlayer,
      resonantKeepItGoingPlayer,
      resonantDelicateBellsPlayer,
      resonantBreathHoldFromNowOnPlayer,
      resonantRelaxYourBodyPlayer,
      resonantRelaxYourShouldersCuePlayer,
      resonantRelaxYourBodyCuePlayer,
      resonantFeelTheWeightPlayer,
      resonantDoingGreatPlayer,
      resonantMinute1Player,
      resonantMinute2Player,
      resonantMinute3Player,
      resonantMinute4Player,
      resonantTakeADeepBreathPlayer,
      resonantLetGoCountdownPlayer,
      resonantNothingMoreToDoPlayer,
      resonantBlinkYourEyesPlayer,
    ],
  );

  const [selectedPatternId, setSelectedPatternId] = useState(BREATHING_PATTERNS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseName, setPhaseName] = useState<PhaseName | ''>('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  // Seconds elapsed in the current phase - only actually ticked for
  // Tummo's Dynamic-mode retention hold, to show a live count in place of
  // the "dynamic" timing label while that phase runs.
  const [phaseElapsedSeconds, setPhaseElapsedSeconds] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [infoPatternId, setInfoPatternId] = useState<string | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES);
  const [buteykoHoldSeconds, setButeykoHoldSeconds] = useState(DEFAULT_BUTEYKO_HOLD_SECONDS);
  const [tummoSkipToHold, setTummoSkipToHold] = useState(false);
  const [tummoHoldSeconds, setTummoHoldSeconds] = useState(DEFAULT_TUMMO_HOLD_SECONDS);
  const [tummoHoldMode, setTummoHoldMode] = useState<TummoHoldMode>(DEFAULT_TUMMO_HOLD_MODE);
  const [tummoRounds, setTummoRounds] = useState(DEFAULT_TUMMO_ROUNDS);
  const [tummoIntegrationEnabled, setTummoIntegrationEnabled] = useState(true);
  const [tummoIntegrationMinutes, setTummoIntegrationMinutes] = useState<TummoIntegrationMinutes>(
    DEFAULT_TUMMO_INTEGRATION_MINUTES,
  );
  const [tummoSoundtrack, setTummoSoundtrack] = useState<TummoSoundtrack>(DEFAULT_TUMMO_SOUNDTRACK);
  const [soundStyle, setSoundStyle] = useState<SoundStyle>(DEFAULT_SOUND_STYLE);
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(false);
  const [backingMusicEnabled, setBackingMusicEnabled] = useState(DEFAULT_BACKING_MUSIC_ENABLED);
  // Treat the brief `null` ("still loading") window the same as `false` -
  // otherwise a free user could see a locked pattern flash unlocked for a
  // moment before flipping locked again once entitlement status resolves.
  const isPlus = useIsPlus() === true;

  const selectedPattern =
    BREATHING_PATTERNS.find((pattern) => pattern.id === selectedPatternId) ?? BREATHING_PATTERNS[0];
  const guidedPatterns = BREATHING_PATTERNS.filter((pattern) => pattern.category === 'guided');
  const advancedPatterns = BREATHING_PATTERNS.filter((pattern) => pattern.category === 'advanced');

  // Buteyko's Hold duration and Tummo's retention-hold duration/"skip to
  // hold" are all user-configurable (Settings), unlike every other
  // pattern's fixed phase list - swap them in here rather than in the
  // shared BREATHING_PATTERNS constant so runPhase/the timing-segment
  // tracker below both see the current value without extra plumbing. The
  // retention hold is identified by timingSegmentIndex 1 rather than by
  // name, since Tummo has a second, unrelated Hold phase at the end.
  const activePattern =
    selectedPattern.id === 'buteyko'
      ? {
          ...selectedPattern,
          phases: selectedPattern.phases.map((phase) =>
            phase.name === 'Hold' ? { ...phase, durationMs: buteykoHoldSeconds * 1000 } : phase,
          ),
        }
      : selectedPattern.id === 'tummo'
        ? {
            ...selectedPattern,
            phases: (tummoSkipToHold
              ? selectedPattern.phases.slice(TUMMO_RAPID_PHASE_COUNT)
              : selectedPattern.phases
            ).map((phase) => {
              if (phase.timingSegmentIndex !== 1) {
                return phase;
              }
              // Dynamic mode has no fixed hold length - runPhase skips its
              // auto-advance timeout for this phase entirely (see
              // isManualHold there) and waits for the "Tap to move to
              // Inhale and Retention" button instead. durationMs here just
              // sizes the tick/cue schedule generously so ticks and the
              // reassurance cues still play for a long hold.
              const durationMs =
                tummoHoldMode === 'dynamic' ? MAX_TUMMO_HOLD_SECONDS * 1000 : tummoHoldSeconds * 1000;
              return { ...phase, durationMs, resonantDelayedCues: tummoHoldDelayedCues(durationMs) };
            }),
          }
        : selectedPattern;

  const selectedPatternTiming = getPatternTiming(selectedPattern, buteykoHoldSeconds, tummoHoldSeconds, tummoHoldMode);
  const timingSegments = selectedPatternTiming ? selectedPatternTiming.split('-') : [];
  const activePhase = activePattern.phases[currentPhaseIndex];
  const activeTimingSegmentIndex = isRunning ? activePhase?.timingSegmentIndex ?? currentPhaseIndex : -1;
  const isSelectedPatternLocked = selectedPattern.category === 'advanced' && !isPlus;
  const showDynamicHoldButton = selectedPattern.id === 'tummo' && tummoHoldMode === 'dynamic';
  const isDynamicHoldReady = isRunning && activePhase?.timingSegmentIndex === 1;
  // Once the dynamic hold actually commences, its timing-segment shows a
  // live elapsed-seconds count in place of the static "dynamic" label.
  const showLiveDynamicHoldSeconds = showDynamicHoldButton && isDynamicHoldReady;

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  // Refetch whenever this tab gains focus, so a change made on the Settings
  // screen takes effect the next time a session is started, without needing
  // an app restart.
  useFocusEffect(
    useCallback(() => {
      getTimerSettings().then(({ enabled, minutes }) => {
        setTimerEnabled(enabled);
        setTimerMinutes(minutes);
      });
      getButeykoHoldSeconds().then(setButeykoHoldSeconds);
      getTummoSkipToHold().then(setTummoSkipToHold);
      getTummoHoldSeconds().then(setTummoHoldSeconds);
      getTummoHoldMode().then(setTummoHoldMode);
      getTummoRounds().then(setTummoRounds);
      getTummoIntegrationEnabled().then(setTummoIntegrationEnabled);
      getTummoIntegrationMinutes().then(setTummoIntegrationMinutes);
      getTummoSoundtrack().then(setTummoSoundtrack);
      getSoundStyle().then(setSoundStyle);
      getHealthSyncEnabled().then(setHealthSyncEnabled);
      getBackingMusicEnabled().then(setBackingMusicEnabled);
    }, []),
  );

  const clearScheduledTicks = useCallback(() => {
    tickTimeoutsRef.current.forEach(clearTimeout);
    tickTimeoutsRef.current = [];
  }, []);

  const clearScheduledResonantCues = useCallback(() => {
    resonantCueTimeoutsRef.current.forEach(clearTimeout);
    resonantCueTimeoutsRef.current = [];
  }, []);

  // Schedules one tick per second across the phase (rounded so a 1.5s phase
  // gets 2 evenly-spaced ticks rather than 1 long silent gap), with the
  // first tick of the phase - the first beat of that Inhale/Hold/Exhale -
  // accented louder like the downbeat of a metronome.
  const scheduleTicksForPhase = useCallback(
    (durationMs: number) => {
      clearScheduledTicks();
      const numTicks = Math.max(1, Math.round(durationMs / 1000));
      const tickIntervalMs = durationMs / numTicks;

      for (let i = 0; i < numTicks; i += 1) {
        const timeoutId = setTimeout(() => {
          if (!isRunningRef.current) {
            return;
          }
          playSound(tickPlayer, i === 0 ? TICK_ACCENT_VOLUME : TICK_VOLUME);
        }, i * tickIntervalMs);
        tickTimeoutsRef.current.push(timeoutId);
      }
    },
    [clearScheduledTicks, tickPlayer],
  );

  // Resonant style: a single spoken cue at the start of the phase instead of
  // the metronome's repeated ticks. Only this phase's own cue player is
  // touched - a still-playing cue from the previous phase (e.g. Tummo's
  // inhale running slightly long) is left alone and allowed to overlap with
  // the next one, rather than being cut off by it. seekTo(0)+play() in
  // playSound is enough to restart this cue cleanly on its own, so there's
  // no separate pause() call here to race against it. resonantDelayedCues
  // (e.g. a reassurance cue partway through a long hold) are scheduled here
  // too and cleared whenever a new phase's cue starts or the session stops -
  // any cue whose atMs falls at or beyond the phase's actual duration (e.g.
  // Tummo's hold shortened in Settings) is skipped rather than firing late
  // into whatever phase comes next.
  const playResonantCue = useCallback(
    (phase: BreathingPhase) => {
      clearScheduledResonantCues();
      for (const soundId of resonantSoundIdsForPhase(phase)) {
        playSound(resonantPlayers[soundId], RESONANT_CUE_VOLUME_OVERRIDES[soundId] ?? RESONANT_CUE_VOLUME);
      }
      for (const { atMs, soundId } of phase.resonantDelayedCues ?? []) {
        if (atMs >= phase.durationMs || !(soundId in resonantPlayers)) {
          continue;
        }
        const id = soundId as keyof typeof resonantPlayers;
        const timeoutId = setTimeout(() => {
          if (!isRunningRef.current) {
            return;
          }
          playSound(resonantPlayers[id], RESONANT_CUE_VOLUME_OVERRIDES[id] ?? RESONANT_CUE_VOLUME);
        }, atMs);
        resonantCueTimeoutsRef.current.push(timeoutId);
      }
    },
    [resonantPlayers, clearScheduledResonantCues],
  );

  const stopBreathing = useCallback(() => {
    isRunningRef.current = false;
    activeAnimationRef.current?.stop();
    activeAnimationRef.current = null;
    scaleAnim.stopAnimation(() => {
      scaleAnim.setValue(MIN_BREATH_SCALE);
    });
    clearScheduledTicks();
    clearScheduledResonantCues();
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    tickPlayer.pause();
    backingMusicWatcherRef.current?.remove();
    backingMusicWatcherRef.current = null;
    allBackingMusicPlayers.forEach((player) => player.pause());
    Object.values(resonantPlayers).forEach((player) => player.pause());
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    if (phaseElapsedIntervalRef.current) {
      clearInterval(phaseElapsedIntervalRef.current);
      phaseElapsedIntervalRef.current = null;
    }
    setPhaseElapsedSeconds(0);
    setIsRunning(false);
    setPhaseName('');
    const sessionStart = sessionStartRef.current;
    sessionStartRef.current = null;
    setElapsedSeconds((secondsPracticed) => {
      recordSessionSeconds(secondsPracticed);
      if (secondsPracticed > 0) {
        trackSessionCompleted(selectedPatternId, secondsPracticed);
        if (healthSyncEnabled && sessionStart) {
          logMindfulSession(sessionStart, new Date());
        }
      }
      return 0;
    });
  }, [
    scaleAnim,
    clearScheduledTicks,
    clearScheduledResonantCues,
    tickPlayer,
    allBackingMusicPlayers,
    resonantPlayers,
    selectedPatternId,
    healthSyncEnabled,
  ]);

  const runPhase = useCallback(
    (pattern: BreathingPattern, phaseIndex: number) => {
      if (!isRunningRef.current) {
        return;
      }

      const phase: BreathingPhase =
        phaseIndex === INTEGRATION_PHASE_INDEX
          ? { name: 'Integration', durationMs: tummoIntegrationMinutes * 60 * 1000, targetScale: MIN_BREATH_SCALE }
          : pattern.phases[phaseIndex];
      setPhaseName(phase.name);
      setCurrentPhaseIndex(phaseIndex);

      if (phaseElapsedIntervalRef.current) {
        clearInterval(phaseElapsedIntervalRef.current);
        phaseElapsedIntervalRef.current = null;
      }
      setPhaseElapsedSeconds(0);
      if (pattern.id === 'tummo' && phase.timingSegmentIndex === 1 && tummoHoldMode === 'dynamic') {
        let secondsInPhase = 0;
        phaseElapsedIntervalRef.current = setInterval(() => {
          secondsInPhase += 1;
          setPhaseElapsedSeconds(secondsInPhase);
        }, 1000);
      }

      if (phase.name === 'Inhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (phase.name === 'Exhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.selectionAsync();
      }

      // Tummo's two backing-track sets each have a dedicated Integration
      // track, distinct from the one that plays through the rest of the
      // session - switch to it the moment Integration begins.
      if (phase.name === 'Integration' && pattern.id === 'tummo' && tummoSoundtrack !== 'off') {
        const mainPlayer = tummoSoundtrack === 'set1' ? tummoSet1MainPlayer : tummoSet2MainPlayer;
        const integrationPlayer = tummoSoundtrack === 'set1' ? tummoSet1IntegrationPlayer : tummoSet2IntegrationPlayer;
        // Start the integration track before pausing the main one, rather
        // than the reverse - pausing the only currently-active player and
        // starting a different one in the same instant left a brief window
        // on-device where iOS's shared audio session was momentarily
        // inactive, and the new player's .play() lost that race (silently -
        // isLoaded/isBuffering both looked fine, playing just never flipped
        // true). Never letting both players be inactive at once avoids it.
        integrationPlayer.loop = true;
        integrationPlayer.volume = BACKING_MUSIC_VOLUME;
        // Not awaited - snaps the position back to the start shortly after
        // playback begins rather than before, so a previous session's
        // paused-mid-track position doesn't carry over without delaying
        // play() (see the ordering comment above this block).
        integrationPlayer.seekTo(0).catch((error) => console.log('[backing-music] Integration seekTo failed', error));
        integrationPlayer.play();
        mainPlayer.pause();
        backingMusicWatcherRef.current?.remove();
        backingMusicWatcherRef.current = watchAndKeepBackingMusicPlaying(integrationPlayer, 'Integration', isRunningRef);

        // Gradually fade the integration track to silence over its last
        // INTEGRATION_FADE_DURATION_MS rather than letting it cut off
        // abruptly when the phase (and the session) ends.
        const fadeDelayMs = Math.max(0, phase.durationMs - INTEGRATION_FADE_DURATION_MS);
        const fadeStartTimeoutId = setTimeout(() => {
          if (!isRunningRef.current) {
            return;
          }
          const fadeStartedAt = Date.now();
          const fadeIntervalId = setInterval(() => {
            const progress = Math.min(1, (Date.now() - fadeStartedAt) / INTEGRATION_FADE_DURATION_MS);
            integrationPlayer.volume = BACKING_MUSIC_VOLUME * (1 - progress);
            if (progress >= 1) {
              clearInterval(fadeIntervalId);
            }
          }, INTEGRATION_FADE_STEP_MS);
          resonantCueTimeoutsRef.current.push(fadeIntervalId);
        }, fadeDelayMs);
        resonantCueTimeoutsRef.current.push(fadeStartTimeoutId);
      }

      // Integration's own two spoken cues - "nothing more to do" at the
      // start, "blink your eyes" timed to finish 3s before the phase (and
      // therefore the session) ends - independent of Voice/Tick style and
      // of whether a soundtrack is selected, unlike every other cue below.
      // No metronome on Tick style either - this phase is deliberately
      // free of any pacing cue, since it's meant for the user to rest and
      // breathe at their own cadence rather than follow along with one.
      if (phase.name === 'Integration') {
        playSound(resonantPlayers['nothing-more-to-do'], RESONANT_CUE_VOLUME_OVERRIDES['nothing-more-to-do'] ?? RESONANT_CUE_VOLUME);
        const blinkCueDelayMs = Math.max(0, phase.durationMs - 3000 - INTEGRATION_BLINK_CUE_DURATION_MS);
        const blinkCueTimeoutId = setTimeout(() => {
          if (!isRunningRef.current) {
            return;
          }
          playSound(resonantPlayers['blink-your-eyes'], RESONANT_CUE_VOLUME_OVERRIDES['blink-your-eyes'] ?? RESONANT_CUE_VOLUME);
        }, blinkCueDelayMs);
        resonantCueTimeoutsRef.current.push(blinkCueTimeoutId);
      } else {
        // Only Tummo phases explicitly configured with a resonant cue - a
        // resonantSoundId, or (for the final hold's countdown) just a
        // resonantDelayedCues entry - opt into Voice; everything else on
        // Tummo stays on the metronome regardless of style.
        const supportsResonant =
          pattern.id !== 'tummo' || phase.resonantSoundId != null || (phase.resonantDelayedCues?.length ?? 0) > 0;
        if (soundStyle === 'resonant' && supportsResonant) {
          clearScheduledTicks();
          playResonantCue(phase);
        } else {
          scheduleTicksForPhase(phase.durationMs);
        }
      }

      // The visual animation is fire-and-forget here - phase advancement is
      // timed by the setTimeout below instead of this animation's own
      // completion callback. Inhale/Exhale run on the native UI thread
      // (useNativeDriver) and report "finished" back to JS over a bridge
      // round-trip, while Hold's Animated.delay is JS-thread only with no
      // such hop; chaining off that callback made Inhale/Exhale -> Hold
      // transitions land a few ms later than Hold -> Inhale/Exhale ones,
      // which was audible as a gap against the metronome ticks (which run
      // on their own setTimeout clock). A single JS timer keeps every
      // transition - and therefore every tick schedule - equally precise.
      if (phase.name === 'Hold' || phase.name === 'Integration') {
        activeAnimationRef.current = null;
      } else {
        const animation = Animated.timing(scaleAnim, {
          toValue: phase.targetScale,
          duration: phase.durationMs,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        });
        activeAnimationRef.current = animation;
        animation.start();
      }

      // Tummo's main retention hold, when Settings has Dynamic retention
      // style selected, has no fixed length - there's no auto-advance timer
      // for this phase at all. It only moves on when the practitioner taps
      // the "Tap to move to Inhale and Retention" button (handleManualHoldAdvance
      // below), which does the exact same round-counting and phase advance
      // this timeout does for every other phase.
      const isManualHold = pattern.id === 'tummo' && phase.timingSegmentIndex === 1 && tummoHoldMode === 'dynamic';
      if (!isManualHold) {
        phaseTimeoutRef.current = setTimeout(() => {
          if (!isRunningRef.current) {
            return;
          }
          // Integration only ever runs once, after the final round - once
          // its own timer is up, the session is over regardless.
          if (phaseIndex === INTEGRATION_PHASE_INDEX) {
            stopBreathing();
            return;
          }
          const nextIndex = (phaseIndex + 1) % pattern.phases.length;
          // Tummo is the only pattern with a configured number of rounds -
          // every other pattern still loops indefinitely until stopped
          // manually. A "round" is one full pass through the (possibly
          // skip-to-hold-shortened) phases array, detected by the
          // wraparound back to index 0.
          if (nextIndex === 0 && pattern.id === 'tummo') {
            completedRoundsRef.current += 1;
            if (completedRoundsRef.current >= tummoRounds) {
              if (tummoIntegrationEnabled) {
                runPhase(pattern, INTEGRATION_PHASE_INDEX);
                return;
              }
              stopBreathing();
              return;
            }
          }
          runPhase(pattern, nextIndex);
        }, phase.durationMs);
      }
    },
    [
      scaleAnim,
      scheduleTicksForPhase,
      clearScheduledTicks,
      playResonantCue,
      resonantPlayers,
      soundStyle,
      tummoRounds,
      tummoHoldMode,
      tummoIntegrationEnabled,
      tummoIntegrationMinutes,
      tummoSoundtrack,
      tummoSet1MainPlayer,
      tummoSet1IntegrationPlayer,
      tummoSet2MainPlayer,
      tummoSet2IntegrationPlayer,
      stopBreathing,
    ],
  );

  // Manual advance for Tummo's Dynamic retention style - mirrors the
  // round-counting/advance logic in runPhase's own auto-advance timeout
  // above, since that timeout is deliberately not scheduled for this phase.
  const handleManualHoldAdvance = useCallback(() => {
    if (!isRunningRef.current) {
      return;
    }
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    const nextIndex = (currentPhaseIndex + 1) % activePattern.phases.length;
    if (nextIndex === 0 && activePattern.id === 'tummo') {
      completedRoundsRef.current += 1;
      if (completedRoundsRef.current >= tummoRounds) {
        if (tummoIntegrationEnabled) {
          runPhase(activePattern, INTEGRATION_PHASE_INDEX);
          return;
        }
        stopBreathing();
        return;
      }
    }
    runPhase(activePattern, nextIndex);
  }, [activePattern, currentPhaseIndex, tummoRounds, tummoIntegrationEnabled, stopBreathing, runPhase]);

  // Tummo ignores the Backing Music toggle entirely and instead plays
  // whichever track set is chosen under Settings' Soundtrack Selection (see
  // TUMMO_SOUNDTRACK_SOURCES); every other pattern advances one track
  // through the shared 7-song rotation, but only when Backing Music is on.
  const startBackingMusic = useCallback(async () => {
    let player: AudioPlayer | null = null;
    try {
      if (selectedPatternId === 'tummo') {
        if (tummoSoundtrack !== 'off') {
          player = tummoSoundtrack === 'set1' ? tummoSet1MainPlayer : tummoSet2MainPlayer;
        }
      } else if (backingMusicEnabled) {
        // Free users always get the one free track rather than advancing
        // through (or persisting a position in) the full rotation.
        player = isPlus
          ? rotationPlayers[await getNextBackingMusicTrackIndex()]
          : rotationPlayers[FREE_TIER_BACKING_MUSIC_INDEX];
      }
      if (!player) {
        return;
      }
      player.loop = true;
      player.volume = BACKING_MUSIC_VOLUME;
      // A player that was paused mid-track (stopping a session) resumes
      // from that same position on the next play() rather than restarting -
      // most noticeable on the two advanced patterns, whose dedicated
      // tracks are otherwise reused as-is across repeated sessions. Seek
      // back to the start before every play() so a new session always
      // starts the track fresh.
      await player.seekTo(0);
      // play() can intermittently throw "Server was dead when activation
      // request was made" - iOS's mediaserverd daemon not yet ready to
      // activate an audio session, seen on any player, not just at cold
      // launch. Apple's own guidance for this error is simply to retry, so
      // back off and try a few times rather than dropping the music.
      const retryDelaysMs = [300, 800, 1500];
      for (let attempt = 0; ; attempt++) {
        try {
          player.play();
          break;
        } catch (playError) {
          if (attempt >= retryDelaysMs.length) {
            throw playError;
          }
          console.warn(`[backing-music] play() failed, retrying in ${retryDelaysMs[attempt]}ms`, playError);
          await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
        }
      }
      backingMusicWatcherRef.current?.remove();
      backingMusicWatcherRef.current = watchAndKeepBackingMusicPlaying(player, 'startBackingMusic', isRunningRef);
    } catch (error) {
      console.error('[backing-music] startBackingMusic failed', error);
      // mediaserverd can occasionally stay down longer than the retries
      // above wait for - fall back to one more attempt a few seconds later,
      // off the critical path, rather than leaving the session silent for
      // the rest of a session over a daemon hiccup that usually clears up.
      if (player && isRunningRef.current) {
        const delayedPlayer = player;
        setTimeout(() => {
          if (!isRunningRef.current) {
            return;
          }
          try {
            delayedPlayer.loop = true;
            delayedPlayer.volume = BACKING_MUSIC_VOLUME;
            delayedPlayer.play();
            backingMusicWatcherRef.current?.remove();
            backingMusicWatcherRef.current = watchAndKeepBackingMusicPlaying(
              delayedPlayer,
              'startBackingMusic delayed retry',
              isRunningRef,
            );
          } catch (retryError) {
            console.error('[backing-music] delayed retry failed', retryError);
          }
        }, 5000);
      }
    }
  }, [
    selectedPatternId,
    tummoSoundtrack,
    backingMusicEnabled,
    isPlus,
    tummoSet1MainPlayer,
    tummoSet2MainPlayer,
    rotationPlayers,
  ]);

  const startBreathing = useCallback(() => {
    if (activePattern.category === 'advanced' && !isPlus) {
      presentPlusPaywall();
      return;
    }
    isRunningRef.current = true;
    setIsRunning(true);
    scaleAnim.setValue(MIN_BREATH_SCALE);
    completedRoundsRef.current = 0;
    sessionStartRef.current = new Date();
    trackPatternStarted(selectedPatternId);
    // Staggered rather than called inline: firing this in the same tick as
    // runPhase's own first-phase resonant cue(s) below stacks multiple
    // simultaneous native play() calls right at session start - Tummo's
    // first breath alone fires two cues at once - which is the likeliest
    // cause of the intermittent "server was dead"/"session lookup failed"
    // errors seen there. A short delay spreads the activations out instead.
    setTimeout(() => {
      if (isRunningRef.current) {
        startBackingMusic();
      }
    }, 200);

    let secondsElapsed = 1;
    setElapsedSeconds(secondsElapsed);
    // Tummo has a fixed, deliberately-authored sequence (30 breaths, a long
    // hold, recovery) - the session-length auto-stop is meant for
    // open-ended guided practice, not a structured exercise with its own
    // built-in duration, so it never applies here regardless of the
    // configured minutes.
    const timerLimitSeconds = timerEnabled && selectedPatternId !== 'tummo' ? timerMinutes * 60 : null;

    elapsedIntervalRef.current = setInterval(() => {
      secondsElapsed += 1;
      setElapsedSeconds(secondsElapsed);
      if (timerLimitSeconds !== null && secondsElapsed >= timerLimitSeconds) {
        stopBreathing();
      }
    }, 1000);
    runPhase(activePattern, 0);
  }, [
    runPhase,
    scaleAnim,
    activePattern,
    isPlus,
    timerEnabled,
    timerMinutes,
    stopBreathing,
    selectedPatternId,
    startBackingMusic,
  ]);

  useEffect(() => {
    if (isRunningRef.current) {
      stopBreathing();
    }
  }, [selectedPatternId, stopBreathing]);

  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      activeAnimationRef.current?.stop();
      scaleAnim.stopAnimation();
      tickTimeoutsRef.current.forEach(clearTimeout);
      resonantCueTimeoutsRef.current.forEach(clearTimeout);
      if (phaseTimeoutRef.current) {
        clearTimeout(phaseTimeoutRef.current);
      }
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
      if (phaseElapsedIntervalRef.current) {
        clearInterval(phaseElapsedIntervalRef.current);
      }
    };
  }, [scaleAnim]);

  const activeAccentColor = PATTERN_ACCENT_COLORS[selectedPatternId] ?? BreathingColors.saltwaterSlide;
  const infoPattern = BREATHING_PATTERNS.find((pattern) => pattern.id === infoPatternId) ?? null;

  return (
    <View style={styles.container}>
      <Image source={BG_MAGPIE_SOURCE} style={styles.bgImage} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
              Breathe Easy
            </ThemedText>
          </View>

          <Pressable
            onPress={isRunning ? stopBreathing : startBreathing}
            accessibilityRole="button"
            accessibilityLabel={
              isRunning
                ? 'Stop breathing exercise'
                : isSelectedPatternLocked
                  ? 'Upgrade to Plus to Unlock'
                  : 'Begin breathing exercise'
            }
            style={({ pressed }) => [styles.circleSection, { opacity: pressed ? 0.85 : 1 }]}>
            <View style={styles.circleWrapper}>
              <View style={[styles.glowOuter, { backgroundColor: activeAccentColor }]} />
              <View style={[styles.glowInner, { backgroundColor: activeAccentColor }]} />
              <Animated.View
                style={[
                  styles.circle,
                  {
                    backgroundColor: activeAccentColor,
                    shadowColor: activeAccentColor,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              />
            </View>
            <View style={styles.phaseRow}>
              <ThemedText
                type="default"
                style={styles.phaseText}
                accessibilityLiveRegion="polite"
                accessibilityLabel={`Breathing status: ${phaseName || (isSelectedPatternLocked ? 'Upgrade to Plus to Unlock' : 'Tap the circle to begin')}`}>
                {phaseName || (isSelectedPatternLocked ? 'Upgrade to Plus to Unlock' : 'Tap to begin')}
              </ThemedText>
              {isRunning && (
                <ThemedText
                  type="default"
                  style={styles.elapsedText}
                  accessibilityLabel={`Elapsed time: ${formatElapsed(elapsedSeconds)}`}>
                  {formatElapsed(elapsedSeconds)}
                </ThemedText>
              )}
            </View>
            {timingSegments.length > 0 && (
              <ThemedText
                type="small"
                style={styles.patternTimingText}
                accessibilityLabel={`Pattern: ${selectedPatternTiming}`}>
                {timingSegments.map((segment, index) => {
                  const displaySegment =
                    showLiveDynamicHoldSeconds && index === activeTimingSegmentIndex
                      ? `${phaseElapsedSeconds}`
                      : segment;
                  return (
                    <Text key={index}>
                      <Text
                        style={index === activeTimingSegmentIndex ? styles.patternTimingSegmentActive : undefined}>
                        {displaySegment}
                      </Text>
                      {index < timingSegments.length - 1 ? '-' : ''}
                    </Text>
                  );
                })}
              </ThemedText>
            )}
          </Pressable>

          {showDynamicHoldButton && (
            <Pressable
              onPress={handleManualHoldAdvance}
              disabled={!isDynamicHoldReady}
              accessibilityRole="button"
              accessibilityLabel="Tap to move to Inhale and Retention"
              accessibilityState={{ disabled: !isDynamicHoldReady }}
              style={({ pressed }) => [
                styles.dynamicHoldButton,
                { opacity: !isDynamicHoldReady ? 0.4 : pressed ? 0.85 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.dynamicHoldButtonText}>
                Tap to move to Inhale and Retention
              </ThemedText>
            </Pressable>
          )}

          <View style={styles.patternList}>
            <ThemedText type="smallBold" style={styles.patternSectionHeader}>
              Guided Patterns
            </ThemedText>
            {guidedPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                displayName={getPatternDisplayName(
                  pattern,
                  tummoRounds,
                  tummoIntegrationEnabled,
                  tummoIntegrationMinutes,
                )}
                timing={getPatternTiming(pattern, buteykoHoldSeconds, tummoHoldSeconds, tummoHoldMode)}
                isSelected={pattern.id === selectedPatternId}
                isRunning={isRunning}
                isLocked={false}
                accentColor={PATTERN_ACCENT_COLORS[pattern.id] ?? BreathingColors.saltwaterSlide}
                theme={theme}
                styles={styles}
                onSelect={() => setSelectedPatternId(pattern.id)}
                onShowInfo={() => setInfoPatternId(pattern.id)}
              />
            ))}

            <ThemedText type="smallBold" style={[styles.patternSectionHeader, styles.patternSectionHeaderSpaced]}>
              Advanced / Self-Paced
            </ThemedText>
            {advancedPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                displayName={getPatternDisplayName(
                  pattern,
                  tummoRounds,
                  tummoIntegrationEnabled,
                  tummoIntegrationMinutes,
                )}
                timing={getPatternTiming(pattern, buteykoHoldSeconds, tummoHoldSeconds, tummoHoldMode)}
                isSelected={pattern.id === selectedPatternId}
                isRunning={isRunning}
                isLocked={!isPlus}
                accentColor={PATTERN_ACCENT_COLORS[pattern.id] ?? BreathingColors.saltwaterSlide}
                theme={theme}
                styles={styles}
                onSelect={() => setSelectedPatternId(pattern.id)}
                onShowInfo={() => setInfoPatternId(pattern.id)}
              />
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>

      {infoPattern && (
        <Pressable style={styles.modalBackdrop} onPress={() => setInfoPatternId(null)}>
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <ThemedText type="smallBold" style={styles.modalTitle}>{infoPattern.name}</ThemedText>
            <ThemedText type="small" style={styles.modalInfoText}>{infoPattern.info}</ThemedText>
            <Pressable
              onPress={() => setInfoPatternId(null)}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.modalCloseButton}>
              <ThemedText type="smallBold" style={styles.modalCloseText}>Close</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      )}
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  bgImage: {
    position: 'absolute',
    width: BG_MAGPIE_SIZE,
    height: BG_MAGPIE_SIZE,
    right: -BG_MAGPIE_SIZE * 0.22 + BG_MAGPIE_SHIFT_LEFT,
    bottom: -BG_MAGPIE_SIZE * 0.06 + BG_MAGPIE_LIFT,
    opacity: BG_MAGPIE_OPACITY,
    transform: [{ scaleX: -1 }],
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.four,
  },
  header: {
    marginTop: Spacing.two,
  },
  title: {
    ...SystemFont.medium,
    textAlign: 'center',
    color: theme.text,
  },
  circleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  circleWrapper: {
    width: GLOW_OUTER_SIZE,
    height: GLOW_OUTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: GLOW_OUTER_SIZE,
    height: GLOW_OUTER_SIZE,
    borderRadius: GLOW_OUTER_SIZE / 2,
    opacity: 0.12,
  },
  glowInner: {
    position: 'absolute',
    width: GLOW_INNER_SIZE,
    height: GLOW_INNER_SIZE,
    borderRadius: GLOW_INNER_SIZE / 2,
    opacity: 0.22,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    opacity: 0.92,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 20,
  },
  phaseRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  phaseText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    color: theme.textSecondary,
  },
  elapsedText: {
    fontSize: 18,
    lineHeight: 24,
    color: theme.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  patternTimingText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    color: theme.textSecondary,
    marginTop: Spacing.one,
  },
  patternTimingSegmentActive: {
    ...SystemFont.bold,
    color: theme.text,
  },
  dynamicHoldButton: {
    alignSelf: 'center',
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 10,
    backgroundColor: '#152A63',
  },
  dynamicHoldButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  patternList: {
    gap: Spacing.three,
  },
  patternSectionHeader: {
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 12,
  },
  patternSectionHeaderSpaced: {
    marginTop: Spacing.two,
  },
  patternCard: {
    backgroundColor: theme.backgroundElement,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  patternCardSelected: {
    backgroundColor: theme.backgroundSelected,
  },
  patternCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  patternCardHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  patternName: {
    flexShrink: 1,
    color: theme.text,
  },
  patternDescription: {
    color: theme.textSecondary,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.backgroundElement,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    color: theme.text,
    fontSize: 18,
  },
  modalInfoText: {
    color: theme.textSecondary,
    lineHeight: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  modalCloseText: {
    color: theme.accent,
  },
  });
}
