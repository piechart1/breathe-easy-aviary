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
import { recordSessionSeconds } from '@/lib/session-history';
import {
  DEFAULT_BUTEYKO_HOLD_SECONDS,
  DEFAULT_SOUND_STYLE,
  DEFAULT_TIMER_MINUTES,
  DEFAULT_TUMMO_HOLD_SECONDS,
  type SoundStyle,
  getButeykoHoldSeconds,
  getSoundStyle,
  getTimerSettings,
  getTummoHoldSeconds,
  getTummoSkipToHold,
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
} as const;
const RESONANT_CUE_VOLUME = 1;
// Tummo's rapid-breath cues repeat every ~1.5s for up to 30 breaths, so they
// run quieter than the rest of the resonant cues, which only play once per
// (much longer) phase.
const RESONANT_CUE_VOLUME_OVERRIDES: Partial<Record<keyof typeof RESONANT_SOUND_SOURCES, number>> = {
  'tummo-inhale': 0.05,
  'tummo-exhale': 0.05,
};

function resonantSoundIdForPhase(phase: BreathingPhase): keyof typeof RESONANT_SOUND_SOURCES {
  if (phase.resonantSoundId && phase.resonantSoundId in RESONANT_SOUND_SOURCES) {
    return phase.resonantSoundId as keyof typeof RESONANT_SOUND_SOURCES;
  }
  return phase.name.toLowerCase() as keyof typeof RESONANT_SOUND_SOURCES;
}

// The primary cue plus any resonantOverlaySoundIds, all played concurrently
// on their own player instances - see playResonantCue below.
function resonantSoundIdsForPhase(phase: BreathingPhase): (keyof typeof RESONANT_SOUND_SOURCES)[] {
  const overlayIds = (phase.resonantOverlaySoundIds ?? []).filter(
    (id): id is keyof typeof RESONANT_SOUND_SOURCES => id in RESONANT_SOUND_SOURCES,
  );
  return [resonantSoundIdForPhase(phase), ...overlayIds];
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
): string | undefined {
  if (pattern.id === 'buteyko' && pattern.timing) {
    return pattern.timing.replace('hold', `${buteykoHoldSeconds}`);
  }
  if (pattern.id === 'tummo' && pattern.timing) {
    return pattern.timing.replace('hold', `${tummoHoldSeconds}`);
  }
  return pattern.timing;
}

// Guards against a slow-resolving seekTo() from an older play request
// finishing after a newer request for the same player has already started -
// without this, the stale call's play() can fire after (and stomp on) the
// newer one, which is audible as a cut-off or dropped cue.
const playRequestGeneration = new WeakMap<AudioPlayer, number>();

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
  timing,
  isSelected,
  isRunning,
  accentColor,
  theme,
  styles,
  onSelect,
  onShowInfo,
}: {
  pattern: BreathingPattern;
  timing?: string;
  isSelected: boolean;
  isRunning: boolean;
  accentColor: string;
  theme: ReturnType<typeof useTheme>;
  styles: Styles;
  onSelect: () => void;
  onShowInfo: () => void;
}) {
  return (
    <Pressable
      disabled={isRunning}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${pattern.name}, ${timing ? `${timing}, ` : ''}${pattern.description}`}
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
        <ThemedText type="smallBold" style={styles.patternName}>{pattern.name}</ThemedText>
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
  const tickPlayer = useAudioPlayer(TICK_SOURCE);
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
    ],
  );

  const [selectedPatternId, setSelectedPatternId] = useState(BREATHING_PATTERNS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseName, setPhaseName] = useState<PhaseName | ''>('');
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [infoPatternId, setInfoPatternId] = useState<string | null>(null);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(DEFAULT_TIMER_MINUTES);
  const [buteykoHoldSeconds, setButeykoHoldSeconds] = useState(DEFAULT_BUTEYKO_HOLD_SECONDS);
  const [tummoSkipToHold, setTummoSkipToHold] = useState(false);
  const [tummoHoldSeconds, setTummoHoldSeconds] = useState(DEFAULT_TUMMO_HOLD_SECONDS);
  const [soundStyle, setSoundStyle] = useState<SoundStyle>(DEFAULT_SOUND_STYLE);

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
            ).map((phase) =>
              phase.timingSegmentIndex === 1 ? { ...phase, durationMs: tummoHoldSeconds * 1000 } : phase,
            ),
          }
        : selectedPattern;

  const selectedPatternTiming = getPatternTiming(selectedPattern, buteykoHoldSeconds, tummoHoldSeconds);
  const timingSegments = selectedPatternTiming ? selectedPatternTiming.split('-') : [];
  const activePhase = activePattern.phases[currentPhaseIndex];
  const activeTimingSegmentIndex = isRunning ? activePhase?.timingSegmentIndex ?? currentPhaseIndex : -1;

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
      getSoundStyle().then(setSoundStyle);
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
  // too and cleared whenever a new phase's cue starts or the session stops.
  const playResonantCue = useCallback(
    (phase: BreathingPhase) => {
      clearScheduledResonantCues();
      for (const soundId of resonantSoundIdsForPhase(phase)) {
        playSound(resonantPlayers[soundId], RESONANT_CUE_VOLUME_OVERRIDES[soundId] ?? RESONANT_CUE_VOLUME);
      }
      for (const { atMs, soundId } of phase.resonantDelayedCues ?? []) {
        if (!(soundId in resonantPlayers)) {
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
    Object.values(resonantPlayers).forEach((player) => player.pause());
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    setIsRunning(false);
    setPhaseName('');
    setElapsedSeconds((secondsPracticed) => {
      recordSessionSeconds(secondsPracticed);
      if (secondsPracticed > 0) {
        trackSessionCompleted(selectedPatternId, secondsPracticed);
      }
      return 0;
    });
  }, [scaleAnim, clearScheduledTicks, clearScheduledResonantCues, tickPlayer, resonantPlayers, selectedPatternId]);

  const runPhase = useCallback(
    (pattern: BreathingPattern, phaseIndex: number) => {
      if (!isRunningRef.current) {
        return;
      }

      const phase = pattern.phases[phaseIndex];
      setPhaseName(phase.name);
      setCurrentPhaseIndex(phaseIndex);

      if (phase.name === 'Inhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (phase.name === 'Exhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.selectionAsync();
      }

      // Tummo's later phases (retention hold, recovery breath) don't have a
      // resonant cue set up yet, so only its phases with an explicit
      // resonantSoundId (currently just the 30 rapid breaths) opt in -
      // everything else on Tummo stays on the metronome regardless of style.
      const supportsResonant = pattern.id !== 'tummo' || phase.resonantSoundId != null;
      if (soundStyle === 'resonant' && supportsResonant) {
        clearScheduledTicks();
        playResonantCue(phase);
      } else {
        scheduleTicksForPhase(phase.durationMs);
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
      if (phase.name === 'Hold') {
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

      phaseTimeoutRef.current = setTimeout(() => {
        if (!isRunningRef.current) {
          return;
        }
        const nextIndex = (phaseIndex + 1) % pattern.phases.length;
        runPhase(pattern, nextIndex);
      }, phase.durationMs);
    },
    [scaleAnim, scheduleTicksForPhase, clearScheduledTicks, playResonantCue, soundStyle],
  );

  const startBreathing = useCallback(() => {
    isRunningRef.current = true;
    setIsRunning(true);
    scaleAnim.setValue(MIN_BREATH_SCALE);
    trackPatternStarted(selectedPatternId);

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
  }, [runPhase, scaleAnim, activePattern, timerEnabled, timerMinutes, stopBreathing, selectedPatternId]);

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
            accessibilityLabel={isRunning ? 'Stop breathing exercise' : 'Begin breathing exercise'}
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
                accessibilityLabel={`Breathing status: ${phaseName || 'Tap the circle to begin'}`}>
                {phaseName || 'Tap to begin'}
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
                {timingSegments.map((segment, index) => (
                  <Text key={index}>
                    <Text style={index === activeTimingSegmentIndex ? styles.patternTimingSegmentActive : undefined}>
                      {segment}
                    </Text>
                    {index < timingSegments.length - 1 ? '-' : ''}
                  </Text>
                ))}
              </ThemedText>
            )}
          </Pressable>

          <View style={styles.patternList}>
            <ThemedText type="smallBold" style={styles.patternSectionHeader}>
              Guided Patterns
            </ThemedText>
            {guidedPatterns.map((pattern) => (
              <PatternCard
                key={pattern.id}
                pattern={pattern}
                timing={getPatternTiming(pattern, buteykoHoldSeconds, tummoHoldSeconds)}
                isSelected={pattern.id === selectedPatternId}
                isRunning={isRunning}
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
                timing={getPatternTiming(pattern, buteykoHoldSeconds, tummoHoldSeconds)}
                isSelected={pattern.id === selectedPatternId}
                isRunning={isRunning}
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
  },
  patternName: {
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
