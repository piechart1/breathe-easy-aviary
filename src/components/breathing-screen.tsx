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
import { AccentColors, Colors, Helvetica, Spacing } from '@/constants/theme';

const CIRCLE_SIZE = 168;
const screenColors = Colors.dark;

export function BreathingScreen() {
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

  const activeAccentColor = PATTERN_ACCENT_COLORS[selectedPatternId] ?? BreathingColors.saltwaterSlide;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle" style={styles.title}>Breathe Easy</ThemedText>

          <View style={styles.circleSection}>
            <Animated.View
              style={[
                styles.circle,
                {
                  backgroundColor: activeAccentColor,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            />
            <ThemedText type="default" style={styles.phaseText}>
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
                  style={({ pressed }) => [
                    styles.patternCard,
                    isSelected && styles.patternCardSelected,
                    {
                      opacity: isRunning ? 0.55 : pressed ? 0.9 : 1,
                      borderColor: isSelected ? accentColor : screenColors.border,
                    },
                  ]}>
                  <View style={styles.timingTag}>
                    <ThemedText type="code" style={styles.timingText}>{pattern.timing}</ThemedText>
                  </View>
                  <ThemedText type="smallBold" style={styles.patternName}>{pattern.name}</ThemedText>
                  <ThemedText type="small" style={styles.patternDescription}>{pattern.description}</ThemedText>
                </Pressable>
              );
            })}
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
        </ScrollView>
      </SafeAreaView>
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
  title: {
    textAlign: 'center',
    marginTop: Spacing.two,
    color: screenColors.text,
  },
  circleSection: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    opacity: 0.92,
  },
  phaseText: {
    textAlign: 'center',
    fontSize: 18,
    lineHeight: 24,
    color: screenColors.textSecondary,
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
  timingTag: {
    alignSelf: 'flex-start',
    backgroundColor: screenColors.backgroundSelected,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    marginBottom: Spacing.half,
  },
  patternName: {
    color: screenColors.text,
  },
  patternDescription: {
    color: screenColors.textSecondary,
  },
  timingText: {
    color: screenColors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.one,
  },
  controlButton: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: AccentColors.green,
  },
  stopButton: {
    backgroundColor: AccentColors.pink,
  },
  controlButtonText: {
    ...Helvetica.bold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});
