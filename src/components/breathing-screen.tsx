import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  BREATHING_PATTERNS,
  MIN_BREATH_SCALE,
  MAX_BREATH_SCALE,
  type BreathingPattern,
  type PhaseName,
} from '@/constants/breathing-patterns';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CIRCLE_SIZE = 220;

export function BreathingScreen() {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(MIN_BREATH_SCALE)).current;
  const isRunningRef = useRef(false);
  const activeAnimationRef = useRef<Animated.CompositeAnimation | null>(null);

  const [selectedPatternId, setSelectedPatternId] = useState(BREATHING_PATTERNS[0].id);
  const [isRunning, setIsRunning] = useState(false);
  const [phaseName, setPhaseName] = useState<PhaseName | ''>('');

  const selectedPattern =
    BREATHING_PATTERNS.find((pattern) => pattern.id === selectedPatternId) ?? BREATHING_PATTERNS[0];

  const stopBreathing = useCallback(() => {
    isRunningRef.current = false;
    activeAnimationRef.current?.stop();
    activeAnimationRef.current = null;
    scaleAnim.stopAnimation(() => {
      scaleAnim.setValue(MIN_BREATH_SCALE);
    });
    setIsRunning(false);
    setPhaseName('');
  }, [scaleAnim]);

  const runPhase = useCallback(
    (pattern: BreathingPattern, phaseIndex: number) => {
      if (!isRunningRef.current) {
        return;
      }

      const phase = pattern.phases[phaseIndex];
      setPhaseName(phase.name);

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
    [scaleAnim],
  );

  const startBreathing = useCallback(() => {
    isRunningRef.current = true;
    setIsRunning(true);
    scaleAnim.setValue(MIN_BREATH_SCALE);
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
    };
  }, [scaleAnim]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="subtitle" style={styles.title}>Breathe Easy</ThemedText>

        <View style={styles.patternRow}>
          {BREATHING_PATTERNS.map((pattern) => {
            const isSelected = pattern.id === selectedPatternId;
            return (
              <Pressable
                key={pattern.id}
                disabled={isRunning}
                onPress={() => setSelectedPatternId(pattern.id)}
                style={({ pressed }) => [
                  styles.patternButton,
                  {
                    backgroundColor: isSelected ? theme.backgroundSelected : theme.backgroundElement,
                    opacity: isRunning ? 0.5 : pressed ? 0.85 : 1,
                  },
                ]}>
                <ThemedText type="smallBold">{pattern.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">{pattern.timing}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.circleSection}>
          <Animated.View
            style={[
              styles.circle,
              {
                backgroundColor: theme.backgroundSelected,
                borderColor: '#5B9FD4',
                transform: [{ scale: scaleAnim }],
              },
            ]}
          />
          <ThemedText type="title" style={styles.phaseText}>
            {phaseName || 'Ready'}
          </ThemedText>
        </View>

        <View style={styles.controls}>
          <Pressable
            disabled={isRunning}
            onPress={startBreathing}
            style={({ pressed }) => [
              styles.controlButton,
              styles.startButton,
              { opacity: isRunning ? 0.45 : pressed ? 0.85 : 1 },
            ]}>
            <ThemedText type="smallBold" style={styles.controlButtonText}>Start</ThemedText>
          </Pressable>

          <Pressable
            disabled={!isRunning}
            onPress={stopBreathing}
            style={({ pressed }) => [
              styles.controlButton,
              styles.stopButton,
              { opacity: !isRunning ? 0.45 : pressed ? 0.85 : 1 },
            ]}>
            <ThemedText type="smallBold" style={styles.controlButtonText}>Stop</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  patternRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  patternButton: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    gap: Spacing.half,
  },
  circleSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 3,
  },
  phaseText: {
    textAlign: 'center',
    fontSize: 36,
    lineHeight: 42,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  controlButton: {
    flex: 1,
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#3C87F7',
  },
  stopButton: {
    backgroundColor: '#D64545',
  },
  controlButtonText: {
    color: '#FFFFFF',
  },
});
