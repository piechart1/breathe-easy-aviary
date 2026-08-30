import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Host, Picker } from '@expo/ui';

import { ThemedText } from '@/components/themed-text';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DEFAULT_TUMMO_HOLD_MODE,
  DEFAULT_TUMMO_HOLD_SECONDS,
  DEFAULT_TUMMO_INTEGRATION_MINUTES,
  DEFAULT_TUMMO_ROUNDS,
  DEFAULT_TUMMO_SOUNDTRACK,
  MAX_BUTEYKO_HOLD_SECONDS,
  MIN_BUTEYKO_HOLD_SECONDS,
  TUMMO_INTEGRATION_MINUTE_OPTIONS,
  type TummoHoldMode,
  type TummoIntegrationMinutes,
  type TummoSoundtrack,
  getTummoHoldMode,
  getTummoHoldSeconds,
  getTummoIntegrationEnabled,
  getTummoIntegrationMinutes,
  getTummoRounds,
  getTummoSkipToHold,
  getTummoSoundtrack,
  setTummoHoldMode as persistTummoHoldMode,
  setTummoHoldSeconds as persistTummoHoldSeconds,
  setTummoIntegrationEnabled as persistTummoIntegrationEnabled,
  setTummoIntegrationMinutes as persistTummoIntegrationMinutes,
  setTummoRounds as persistTummoRounds,
  setTummoSkipToHold as persistTummoSkipToHold,
  setTummoSoundtrack as persistTummoSoundtrack,
} from '@/lib/settings';

// Matches the magpie background on the Home screen (breathing-screen.tsx).
const BG_FINCH_SOURCE = require('../../assets/images/bg-finch.png');
const BG_FINCH_SIZE = 320;
const BG_FINCH_OPACITY = 0.2;
const BG_FINCH_LIFT = 20;
const BG_FINCH_SHIFT_LEFT = 10;

const BUTEYKO_HOLD_SECOND_OPTIONS = Array.from(
  { length: MAX_BUTEYKO_HOLD_SECONDS - MIN_BUTEYKO_HOLD_SECONDS + 1 },
  (_, index) => MIN_BUTEYKO_HOLD_SECONDS + index,
);

const TUMMO_ROUND_OPTIONS = [1, 2, 3] as const;

const TUMMO_HOLD_MODE_OPTIONS: { id: TummoHoldMode; label: string }[] = [
  { id: 'dynamic', label: 'Dynamic' },
  { id: 'preset', label: 'Preset' },
];

const TUMMO_SOUNDTRACK_OPTIONS: { id: TummoSoundtrack; label: string }[] = [
  { id: 'off', label: 'Off' },
  { id: 'set1', label: 'Track Set 1' },
  { id: 'set2', label: 'Track Set 2' },
];

export function SettingsTummoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tummoRounds, setTummoRoundsState] = useState<number>(DEFAULT_TUMMO_ROUNDS);
  const [tummoHoldSeconds, setTummoHoldSecondsState] = useState<number>(DEFAULT_TUMMO_HOLD_SECONDS);
  const [tummoHoldMode, setTummoHoldModeState] = useState<TummoHoldMode>(DEFAULT_TUMMO_HOLD_MODE);
  const [tummoSoundtrack, setTummoSoundtrackState] =
    useState<TummoSoundtrack>(DEFAULT_TUMMO_SOUNDTRACK);
  const [tummoIntegrationEnabled, setTummoIntegrationEnabledState] = useState(true);
  const [tummoIntegrationMinutes, setTummoIntegrationMinutesState] =
    useState<TummoIntegrationMinutes>(DEFAULT_TUMMO_INTEGRATION_MINUTES);
  const [tummoSkipToHold, setTummoSkipToHoldState] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTummoRounds().then(setTummoRoundsState);
      getTummoSkipToHold().then(setTummoSkipToHoldState);
      getTummoHoldSeconds().then(setTummoHoldSecondsState);
      getTummoHoldMode().then(setTummoHoldModeState);
      getTummoSoundtrack().then(setTummoSoundtrackState);
      getTummoIntegrationEnabled().then(setTummoIntegrationEnabledState);
      getTummoIntegrationMinutes().then(setTummoIntegrationMinutesState);
    }, []),
  );

  const handleTummoRoundsChange = (rounds: number) => {
    setTummoRoundsState(rounds);
    persistTummoRounds(rounds);
  };

  const handleSelectTummoSoundtrack = (soundtrack: TummoSoundtrack) => {
    setTummoSoundtrackState(soundtrack);
    persistTummoSoundtrack(soundtrack);
  };

  const handleSelectTummoHoldMode = (mode: TummoHoldMode) => {
    setTummoHoldModeState(mode);
    persistTummoHoldMode(mode);
  };

  const handleTummoHoldSecondsChange = (seconds: number) => {
    setTummoHoldSecondsState(seconds);
    persistTummoHoldSeconds(seconds);
  };

  const handleToggleTummoIntegration = (enabled: boolean) => {
    setTummoIntegrationEnabledState(enabled);
    persistTummoIntegrationEnabled(enabled);
  };

  const handleTummoIntegrationMinutesChange = (minutes: TummoIntegrationMinutes) => {
    setTummoIntegrationMinutesState(minutes);
    persistTummoIntegrationMinutes(minutes);
  };

  const handleToggleTummoSkipToHold = (enabled: boolean) => {
    setTummoSkipToHoldState(enabled);
    persistTummoSkipToHold(enabled);
  };

  return (
    <View style={styles.container}>
      <Image source={BG_FINCH_SOURCE} style={styles.bgImage} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <SymbolView
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
              size={22}
              tintColor={theme.text}
            />
          </Pressable>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Tummo
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Number of Rounds
            </ThemedText>

            <View style={styles.minutesRow}>
              {TUMMO_ROUND_OPTIONS.map((rounds) => {
                const isSelected = rounds === tummoRounds;
                return (
                  <Pressable
                    key={rounds}
                    onPress={() => handleTummoRoundsChange(rounds)}
                    accessibilityRole="button"
                    accessibilityLabel={`${rounds} round${rounds > 1 ? 's' : ''}`}
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      styles.minutePill,
                      { borderColor: isSelected ? theme.accent : theme.border },
                      isSelected && { backgroundColor: theme.backgroundSelected },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={[styles.minutePillText, { color: isSelected ? theme.text : theme.textSecondary }]}>
                      {rounds}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Soundtrack Selection
            </ThemedText>

            <View style={styles.segmentedControl}>
              {TUMMO_SOUNDTRACK_OPTIONS.map((option) => {
                const isSelected = option.id === tummoSoundtrack;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleSelectTummoSoundtrack(option.id)}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: isSelected }}
                    style={[styles.segment, isSelected && { backgroundColor: theme.background }]}>
                    <ThemedText
                      type="smallBold"
                      style={[styles.segmentText, { color: isSelected ? theme.text : theme.textSecondary }]}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Retention duration
            </ThemedText>

            <View style={styles.segmentedControl}>
              {TUMMO_HOLD_MODE_OPTIONS.map((option) => {
                const isSelected = option.id === tummoHoldMode;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleSelectTummoHoldMode(option.id)}
                    accessibilityRole="button"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected: isSelected }}
                    style={[styles.segment, isSelected && { backgroundColor: theme.background }]}>
                    <ThemedText
                      type="smallBold"
                      style={[styles.segmentText, { color: isSelected ? theme.text : theme.textSecondary }]}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText type="small" style={styles.sectionHint}>
              {tummoHoldMode === 'preset'
                ? 'Hold for a fixed, configurable duration.'
                : "Hold until you indicate you're ready to move on."}
            </ThemedText>

            {tummoHoldMode === 'preset' && (
              <>
                <View style={styles.divider} />

                <View style={styles.toggleRow}>
                  <ThemedText type="small" style={styles.sectionHint}>
                    Hold Duration
                  </ThemedText>

                  <Host matchContents={{ vertical: true }} style={styles.secondsPickerHost} seedColor={theme.text}>
                    <Picker
                      selectedValue={tummoHoldSeconds}
                      onValueChange={handleTummoHoldSecondsChange}
                      appearance="menu">
                      {BUTEYKO_HOLD_SECOND_OPTIONS.map((seconds) => (
                        <Picker.Item key={seconds} label={`${seconds}s`} value={seconds} />
                      ))}
                    </Picker>
                  </Host>
                </View>
              </>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.reminderLabel}>
                <ThemedText type="smallBold" style={styles.sectionLabel}>
                  Integration
                </ThemedText>
                <ThemedText type="small" style={styles.sectionHint}>
                  A quiet integration period after the final round
                </ThemedText>
              </View>
              <Switch
                value={tummoIntegrationEnabled}
                onValueChange={handleToggleTummoIntegration}
                accessibilityLabel="Integration"
              />
            </View>

            {tummoIntegrationEnabled && (
              <View style={styles.minutesRow}>
                {TUMMO_INTEGRATION_MINUTE_OPTIONS.map((minutes) => {
                  const isSelected = minutes === tummoIntegrationMinutes;
                  return (
                    <Pressable
                      key={minutes}
                      onPress={() => handleTummoIntegrationMinutesChange(minutes)}
                      accessibilityRole="button"
                      accessibilityLabel={`${minutes} minutes`}
                      accessibilityState={{ selected: isSelected }}
                      style={[
                        styles.minutePill,
                        { borderColor: isSelected ? theme.accent : theme.border },
                        isSelected && { backgroundColor: theme.backgroundSelected },
                      ]}>
                      <ThemedText
                        type="smallBold"
                        style={[styles.minutePillText, { color: isSelected ? theme.text : theme.textSecondary }]}>
                        {minutes}m
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <View style={styles.reminderLabel}>
                <ThemedText type="smallBold" style={styles.sectionLabel}>
                  Skip to Hold
                </ThemedText>
                <ThemedText type="small" style={styles.sectionHint}>
                  Go straight to the retention hold, skipping the 30 breaths
                </ThemedText>
              </View>
              <Switch
                value={tummoSkipToHold}
                onValueChange={handleToggleTummoSkipToHold}
                accessibilityLabel="Skip to Hold"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
      width: BG_FINCH_SIZE,
      height: BG_FINCH_SIZE,
      right: -BG_FINCH_SIZE * 0.22 + BG_FINCH_SHIFT_LEFT,
      bottom: -BG_FINCH_SIZE * 0.06 + BG_FINCH_LIFT,
      opacity: BG_FINCH_OPACITY,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: Spacing.four,
    },
    scrollContent: {
      paddingBottom: Spacing.five,
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
      flex: 1,
      textAlign: 'center',
      color: theme.text,
    },
    section: {
      marginTop: Spacing.three,
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    sectionLabel: {
      color: theme.text,
      flex: 1,
      flexShrink: 1,
    },
    cardTitle: {
      color: theme.text,
    },
    sectionHint: {
      color: theme.textSecondary,
    },
    segmentedControl: {
      flexDirection: 'row',
      backgroundColor: theme.backgroundSelected,
      borderRadius: 10,
      padding: 3,
      gap: 3,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: Spacing.two,
      borderRadius: 8,
    },
    segmentText: {
      fontSize: 14,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    minutesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    minutePill: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.one,
      borderRadius: 999,
      borderWidth: 1,
    },
    minutePillText: {
      fontSize: 14,
    },
    secondsPickerHost: {
      alignSelf: 'flex-start',
      // See the comment on this same style in settings-buteyko-screen.tsx -
      // a fixed width sidesteps matchContents' horizontal mode locking its
      // measurement to whatever value is on screen at mount.
      minWidth: 72,
    },
    reminderLabel: {
      flex: 1,
      flexShrink: 1,
      gap: Spacing.half,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border,
      marginVertical: Spacing.three,
    },
  });
}
