import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassView } from 'expo-glass-effect';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import {
  BREATHING_PATTERNS,
  BreathingColors,
  MIN_BREATH_SCALE,
  MAX_BREATH_SCALE,
  PATTERN_ACCENT_COLORS,
  type BreathingPattern,
  type PhaseName,
} from '@/constants/breathing-patterns';
import { AccentColors, Colors, SystemFont, Spacing } from '@/constants/theme';
import { recordSessionSeconds } from '@/lib/session-history';

const CIRCLE_SIZE = 120;
const GLOW_OUTER_SIZE = CIRCLE_SIZE * 2.0;
const GLOW_INNER_SIZE = CIRCLE_SIZE * 1.5;
const screenColors = Colors.dark;
const BREATHE_IN_SOURCE = require('../../assets/sounds/breathe-in.wav');
const BREATHE_OUT_SOURCE = require('../../assets/sounds/breathe-out.wav');
// Measured durations (afinfo) used as a fallback until each async-loaded asset reports its own.
const BREATHE_IN_FALLBACK_SEC = 3.784853;
const BREATHE_OUT_FALLBACK_SEC = 5.723719;

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function waitUntilLoaded(player: AudioPlayer, maxAttempts = 20) {
  for (let attempt = 0; attempt < maxAttempts && !player.isLoaded; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 30));
  }
}

async function playCueForPhase(
  label: string,
  player: AudioPlayer,
  clipDurationSec: number,
  phaseDurationMs: number,
) {
  const tag = `[audio ${label}]`;
  try {
    await waitUntilLoaded(player);
    const rate = clipDurationSec / (phaseDurationMs / 1000);
    player.setPlaybackRate(Math.min(2, Math.max(0.5, rate)), 'high');
    await player.seekTo(0);
    player.play();

    // Forcibly pausing the other player mid-playback (a direct Exhale->Inhale
    // transition with no Hold in between) can occasionally cause the native
    // player to silently drop this play() call. Verify it actually started
    // and retry a couple of times if not.
    for (let attempt = 0; attempt < 3 && !player.playing; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 120));
      if (!player.playing) {
        console.log(tag, 'play() did not take effect, retrying', { attempt });
        player.play();
      }
    }
  } catch (error) {
    console.log(tag, 'ERROR', error);
  }
}

export function BreathingScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(MIN_BREATH_SCALE)).current;
  const isRunningRef = useRef(false);
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breatheInPlayer = useAudioPlayer(BREATHE_IN_SOURCE);
  const breatheOutPlayer = useAudioPlayer(BREATHE_OUT_SOURCE);
  const breatheInStatus = useAudioPlayerStatus(breatheInPlayer);
  const breatheOutStatus = useAudioPlayerStatus(breatheOutPlayer);

  const [selectedPatternId, setSelectedPatternId] = useState(BREATHING_PATTERNS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseName, setPhaseName] = useState<PhaseName | ''>('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [infoPatternId, setInfoPatternId] = useState<string | null>(null);

  const selectedPattern =
    BREATHING_PATTERNS.find((pattern) => pattern.id === selectedPatternId) ?? BREATHING_PATTERNS[0];

  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
    breatheInPlayer.volume = 1;
    breatheOutPlayer.volume = 1;
  }, [breatheInPlayer, breatheOutPlayer]);

  const stopBreathing = useCallback(() => {
    isRunningRef.current = false;
    activeAnimationRef.current?.stop();
    activeAnimationRef.current = null;
    scaleAnim.stopAnimation(() => {
      scaleAnim.setValue(MIN_BREATH_SCALE);
    });
    breatheInPlayer.pause();
    breatheOutPlayer.pause();
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    setIsRunning(false);
    setPhaseName('');
    setElapsedSeconds((secondsPracticed) => {
      recordSessionSeconds(secondsPracticed);
      return 0;
    });
  }, [scaleAnim, breatheInPlayer, breatheOutPlayer]);

  const runPhase = useCallback(
    (pattern: BreathingPattern, phaseIndex: number) => {
      if (!isRunningRef.current) {
        return;
      }

      const phase = pattern.phases[phaseIndex];
      setPhaseName(phase.name);

      if (phase.name === 'Inhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        breatheOutPlayer.pause();
        playCueForPhase(
          'inhale',
          breatheInPlayer,
          breatheInStatus.duration || BREATHE_IN_FALLBACK_SEC,
          phase.durationMs,
        );
      } else if (phase.name === 'Exhale') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        breatheInPlayer.pause();
        playCueForPhase(
          'exhale',
          breatheOutPlayer,
          breatheOutStatus.duration || BREATHE_OUT_FALLBACK_SEC,
          phase.durationMs,
        );
      } else {
        Haptics.selectionAsync();
        breatheInPlayer.pause();
        breatheOutPlayer.pause();
      }

      const animation =
        phase.name === 'Hold'
          ? Animated.delay(phase.durationMs)
          : Animated.timing(scaleAnim, {
              toValue: phase.targetScale,
              duration: phase.durationMs,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            });

      activeAnimationRef.current = animation;
      animation.start(({ finished }) => {
        if (!finished || !isRunningRef.current) {
          return;
        }

        const nextIndex = (phaseIndex + 1) % pattern.phases.length;
        runPhase(pattern, nextIndex);
      });
    },
    [scaleAnim, breatheInPlayer, breatheOutPlayer, breatheInStatus.duration, breatheOutStatus.duration],
  );

  const startBreathing = useCallback(() => {
    isRunningRef.current = true;
    setIsRunning(true);
    setElapsedSeconds(0);
    scaleAnim.setValue(MIN_BREATH_SCALE);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);
    runPhase(selectedPattern, 0);
  }, [runPhase, scaleAnim, selectedPattern]);

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
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current);
      }
    };
  }, [scaleAnim]);

  const activeAccentColor = PATTERN_ACCENT_COLORS[selectedPatternId] ?? BreathingColors.saltwaterSlide;
  const infoPattern = BREATHING_PATTERNS.find((pattern) => pattern.id === infoPatternId) ?? null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
              Breathe Easy
            </ThemedText>
            <Pressable
              onPress={() => router.push('/history')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="View breathing time history">
              <SymbolView
                name={{ ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }}
                size={22}
                tintColor={screenColors.text}
              />
            </Pressable>
          </View>

          <View style={styles.circleSection}>
            <View style={styles.circleWrapper} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
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
            <ThemedText
              type="default"
              style={styles.phaseText}
              accessibilityLiveRegion="polite"
              accessibilityLabel={`Breathing status: ${phaseName || 'Ready'}`}>
              {phaseName || 'Ready'}
            </ThemedText>
          </View>

          <View style={styles.patternList}>
            {BREATHING_PATTERNS.map((pattern) => {
              const isSelected = pattern.id === selectedPatternId;
              const accentColor = PATTERN_ACCENT_COLORS[pattern.id] ?? BreathingColors.saltwaterSlide;

              return (
                <Pressable
                  key={pattern.id}
                  disabled={isRunning}
                  onPress={() => setSelectedPatternId(pattern.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${pattern.name}, ${pattern.timing}, ${pattern.description}`}
                  accessibilityState={{ selected: isSelected, disabled: isRunning }}
                  style={({ pressed }) => [
                    styles.patternCard,
                    isSelected && styles.patternCardSelected,
                    {
                      opacity: isRunning ? 0.55 : pressed ? 0.9 : 1,
                      borderColor: isSelected ? accentColor : screenColors.border,
                    },
                  ]}>
                  <View style={styles.patternCardHeader}>
                    <ThemedText type="smallBold" style={styles.patternName}>{pattern.name}</ThemedText>
                    <Pressable
                      onPress={() => setInfoPatternId(pattern.id)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`About ${pattern.name}`}>
                      <SymbolView
                        name={{ ios: 'info.circle', android: 'info', web: 'info' }}
                        size={18}
                        tintColor={screenColors.textSecondary}
                      />
                    </Pressable>
                  </View>
                  <ThemedText type="small" style={styles.patternDescription}>
                    {pattern.timing} | {pattern.description}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.controls}>
            {isRunning ? (
              <ThemedText
                type="default"
                style={styles.elapsedText}
                accessibilityLabel={`Elapsed time: ${formatElapsed(elapsedSeconds)}`}>
                {formatElapsed(elapsedSeconds)}
              </ThemedText>
            ) : (
              <View />
            )}
            <Pressable
              onPress={isRunning ? stopBreathing : startBreathing}
              accessibilityRole="button"
              accessibilityLabel={isRunning ? 'Stop breathing exercise' : 'Begin breathing exercise'}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
              <GlassView
                style={[
                  styles.toggleButton,
                  { backgroundColor: isRunning ? AccentColors.pink : AccentColors.green },
                ]}
                glassEffectStyle="regular"
                tintColor={isRunning ? AccentColors.pink : AccentColors.green}
                isInteractive>
                <ThemedText type="smallBold" style={styles.controlButtonText}>
                  {isRunning ? 'Stop' : 'Begin'}
                </ThemedText>
              </GlassView>
            </Pressable>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screenColors.background,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.two,
  },
  headerSpacer: {
    width: 22,
  },
  title: {
    ...SystemFont.medium,
    textAlign: 'center',
    color: screenColors.text,
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
  phaseText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    color: screenColors.textSecondary,
  },
  elapsedText: {
    fontSize: 18,
    lineHeight: 24,
    color: screenColors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  patternList: {
    gap: Spacing.three,
  },
  patternCard: {
    backgroundColor: screenColors.backgroundElement,
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  patternCardSelected: {
    backgroundColor: screenColors.backgroundSelected,
  },
  patternCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patternName: {
    color: screenColors.text,
  },
  patternDescription: {
    color: screenColors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  toggleButton: {
    borderRadius: 20,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    overflow: 'hidden',
  },
  controlButtonText: {
    ...SystemFont.medium,
    color: '#FFFFFF',
    fontSize: 15,
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
    backgroundColor: screenColors.backgroundElement,
    borderRadius: 20,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    color: screenColors.text,
    fontSize: 18,
  },
  modalInfoText: {
    color: screenColors.textSecondary,
    lineHeight: 20,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  modalCloseText: {
    color: screenColors.accent,
  },
});
