import { useCallback, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
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
  MAX_BUTEYKO_HOLD_SECONDS,
  MIN_BUTEYKO_HOLD_SECONDS,
  TIMER_MINUTE_OPTIONS,
  TUMMO_INTEGRATION_MINUTE_OPTIONS,
  type ReminderSettings,
  type SoundStyle,
  type TummoHoldMode,
  type TummoIntegrationMinutes,
  type TummoSoundtrack,
  getAnalyticsEnabled,
  getBackingMusicEnabled,
  getButeykoHoldSeconds,
  getDailyNudgeSettings,
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
  getWindDownSettings,
  setAnalyticsEnabled as persistAnalyticsEnabled,
  setBackingMusicEnabled as persistBackingMusicEnabled,
  setButeykoHoldSeconds as persistButeykoHoldSeconds,
  setDailyNudgeSettings as persistDailyNudgeSettings,
  setHealthSyncEnabled as persistHealthSyncEnabled,
  setSoundStyle as persistSoundStyle,
  setTimerEnabled as persistTimerEnabled,
  setTimerMinutes as persistTimerMinutes,
  setTummoHoldMode as persistTummoHoldMode,
  setTummoHoldSeconds as persistTummoHoldSeconds,
  setTummoIntegrationEnabled as persistTummoIntegrationEnabled,
  setTummoIntegrationMinutes as persistTummoIntegrationMinutes,
  setTummoRounds as persistTummoRounds,
  setTummoSkipToHold as persistTummoSkipToHold,
  setTummoSoundtrack as persistTummoSoundtrack,
  setWindDownSettings as persistWindDownSettings,
} from '@/lib/settings';
import { disableTelemetry, initTelemetry } from '@/lib/telemetry';
import { cancelDailyNudge, cancelWindDown, scheduleDailyNudge, scheduleWindDown } from '@/lib/notifications';
import { requestHealthKitPermission } from '@/lib/healthkit';
import { presentPlusPaywall, restorePurchases, setDevPlusOverride, useIsPlus } from '@/lib/purchases';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { PRIVACY_POLICY_URL, SAFETY_DISCLAIMER_URL, TERMS_OF_USE_URL } from '@/constants/legal';

function openLegalUrl(url: string) {
  openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
}

// Matches the magpie background on the Home screen (breathing-screen.tsx).
const BG_FINCH_SOURCE = require('../../assets/images/bg-finch.png');
const BG_FINCH_SIZE = 320;
const BG_FINCH_OPACITY = 0.2;
const BG_FINCH_LIFT = 20;
const BG_FINCH_SHIFT_LEFT = 10;

const SOUND_STYLE_OPTIONS: { id: SoundStyle; label: string }[] = [
  { id: 'resonant', label: 'Voice' },
  { id: 'metronome', label: 'Metronome' },
];

const BUTEYKO_HOLD_STEP_SECONDS = 5;

function clampButeykoHoldSeconds(seconds: number): number {
  return Math.min(MAX_BUTEYKO_HOLD_SECONDS, Math.max(MIN_BUTEYKO_HOLD_SECONDS, seconds));
}

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

function reminderToDate(reminder: ReminderSettings): Date {
  const date = new Date();
  date.setHours(reminder.hour, reminder.minute, 0, 0);
  return date;
}

export function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isPlus = useIsPlus() === true;
  const [timerEnabled, setTimerEnabledState] = useState(false);
  const [timerMinutes, setTimerMinutesState] = useState(DEFAULT_TIMER_MINUTES);
  const [soundStyle, setSoundStyleState] = useState<SoundStyle>(DEFAULT_SOUND_STYLE);
  const [backingMusicEnabled, setBackingMusicEnabledState] = useState(DEFAULT_BACKING_MUSIC_ENABLED);
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(false);
  const [healthSyncEnabled, setHealthSyncEnabledState] = useState(false);
  const [dailyNudge, setDailyNudge] = useState<ReminderSettings>({ enabled: false, hour: 9, minute: 0 });
  const [windDown, setWindDown] = useState<ReminderSettings>({ enabled: false, hour: 21, minute: 0 });
  const [buteykoHoldSeconds, setButeykoHoldSecondsState] = useState(DEFAULT_BUTEYKO_HOLD_SECONDS);
  const [tummoRounds, setTummoRoundsState] = useState<number>(DEFAULT_TUMMO_ROUNDS);
  const [tummoHoldSeconds, setTummoHoldSecondsState] = useState<number>(DEFAULT_TUMMO_HOLD_SECONDS);
  const [tummoHoldMode, setTummoHoldModeState] = useState<TummoHoldMode>(DEFAULT_TUMMO_HOLD_MODE);
  const [tummoSoundtrack, setTummoSoundtrackState] = useState<TummoSoundtrack>(DEFAULT_TUMMO_SOUNDTRACK);
  const [tummoIntegrationEnabled, setTummoIntegrationEnabledState] = useState(true);
  const [tummoIntegrationMinutes, setTummoIntegrationMinutesState] = useState<TummoIntegrationMinutes>(
    DEFAULT_TUMMO_INTEGRATION_MINUTES,
  );
  const [tummoSkipToHold, setTummoSkipToHoldState] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTimerSettings().then(({ enabled, minutes }) => {
        setTimerEnabledState(enabled);
        setTimerMinutesState(minutes);
      });
      getSoundStyle().then(setSoundStyleState);
      getBackingMusicEnabled().then(setBackingMusicEnabledState);
      getAnalyticsEnabled().then(setAnalyticsEnabledState);
      getHealthSyncEnabled().then(setHealthSyncEnabledState);
      getDailyNudgeSettings().then(setDailyNudge);
      getWindDownSettings().then(setWindDown);
      getButeykoHoldSeconds().then(setButeykoHoldSecondsState);
      getTummoRounds().then(setTummoRoundsState);
      getTummoSkipToHold().then(setTummoSkipToHoldState);
      getTummoHoldSeconds().then(setTummoHoldSecondsState);
      getTummoHoldMode().then(setTummoHoldModeState);
      getTummoSoundtrack().then(setTummoSoundtrackState);
      getTummoIntegrationEnabled().then(setTummoIntegrationEnabledState);
      getTummoIntegrationMinutes().then(setTummoIntegrationMinutesState);
    }, []),
  );

  const handleToggleTimer = (enabled: boolean) => {
    setTimerEnabledState(enabled);
    persistTimerEnabled(enabled);
  };

  const handleSelectMinutes = (minutes: number) => {
    setTimerMinutesState(minutes);
    persistTimerMinutes(minutes);
  };

  const handleSelectSoundStyle = (style: SoundStyle) => {
    setSoundStyleState(style);
    persistSoundStyle(style);
  };

  const handleToggleBackingMusic = (enabled: boolean) => {
    setBackingMusicEnabledState(enabled);
    persistBackingMusicEnabled(enabled);
  };

  const handleUpgrade = () => {
    presentPlusPaywall();
  };

  const handleRestorePurchases = async () => {
    try {
      const restored = await restorePurchases();
      Alert.alert(
        restored ? 'Restored' : 'Nothing to restore',
        restored
          ? 'Your Plus subscription has been restored.'
          : "We couldn't find a previous Plus purchase for this account.",
      );
    } catch (error) {
      console.log('[settings] restorePurchases ERROR', error);
      Alert.alert('Restore failed', 'Something went wrong restoring your purchase. Please try again.');
    }
  };

  const handleToggleAnalytics = (enabled: boolean) => {
    setAnalyticsEnabledState(enabled);
    persistAnalyticsEnabled(enabled);
    if (enabled) {
      initTelemetry();
    } else {
      disableTelemetry();
    }
  };

  const handleToggleHealthSync = (enabled: boolean) => {
    setHealthSyncEnabledState(enabled);
    persistHealthSyncEnabled(enabled);
    if (enabled) {
      requestHealthKitPermission();
    }
  };

  const handleToggleDailyNudge = async (enabled: boolean) => {
    setDailyNudge((current) => ({ ...current, enabled }));
    if (enabled) {
      const granted = await scheduleDailyNudge(dailyNudge.hour, dailyNudge.minute);
      if (!granted) {
        // OS permission was declined - don't leave the toggle on with
        // nothing actually scheduled.
        setDailyNudge((current) => ({ ...current, enabled: false }));
        await persistDailyNudgeSettings({ ...dailyNudge, enabled: false });
        return;
      }
    } else {
      await cancelDailyNudge();
    }
    await persistDailyNudgeSettings({ ...dailyNudge, enabled });
  };

  const handleDailyNudgeTimeChange = async (_event: unknown, date: Date | undefined) => {
    if (!date) {
      return;
    }
    const next = { ...dailyNudge, hour: date.getHours(), minute: date.getMinutes() };
    setDailyNudge(next);
    await persistDailyNudgeSettings(next);
    if (next.enabled) {
      await scheduleDailyNudge(next.hour, next.minute);
    }
  };

  const handleToggleWindDown = async (enabled: boolean) => {
    setWindDown((current) => ({ ...current, enabled }));
    if (enabled) {
      const granted = await scheduleWindDown(windDown.hour, windDown.minute);
      if (!granted) {
        setWindDown((current) => ({ ...current, enabled: false }));
        await persistWindDownSettings({ ...windDown, enabled: false });
        return;
      }
    } else {
      await cancelWindDown();
    }
    await persistWindDownSettings({ ...windDown, enabled });
  };

  const handleWindDownTimeChange = async (_event: unknown, date: Date | undefined) => {
    if (!date) {
      return;
    }
    const next = { ...windDown, hour: date.getHours(), minute: date.getMinutes() };
    setWindDown(next);
    await persistWindDownSettings(next);
    if (next.enabled) {
      await scheduleWindDown(next.hour, next.minute);
    }
  };

  const handleButeykoHoldChange = (seconds: number) => {
    setButeykoHoldSecondsState(seconds);
    persistButeykoHoldSeconds(seconds);
  };

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

  const handleToggleDevPlusOverride = (enabled: boolean) => {
    setDevPlusOverride(enabled);
  };

  return (
    <View style={styles.container}>
      {/* pointerEvents is passed via style rather than as a prop, per the
          "props.pointerEvents is deprecated" warning - expo-image's
          ImageStyle type hasn't caught up with that change yet, hence the
          cast. */}
      <Image source={BG_FINCH_SOURCE} style={[styles.bgImage, { pointerEvents: 'none' } as any]} />
      {/* edges excludes 'bottom' - this screen sits above the tab bar, not
          against the device's true bottom edge, so SafeAreaView's default
          bottom inset (sized for the home indicator) double-reserves space
          the tab bar already accounts for, leaving a permanent gap above it
          regardless of scroll position. */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Settings
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="smallBold" style={styles.subHeading}>
          Plus
        </ThemedText>

        <View style={styles.section}>
          <View style={styles.reminderLabel}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              {isPlus ? 'Breathe Easy Plus' : 'Free Plan'}
            </ThemedText>
            <ThemedText type="small" style={styles.sectionHint}>
              {isPlus
                ? 'You have access to every breathing pattern and the complete soundtrack.'
                : 'Unlock all breathing patterns and the full soundtrack.'}
            </ThemedText>
          </View>

          {!isPlus && (
            <Pressable
              onPress={handleUpgrade}
              accessibilityRole="button"
              accessibilityLabel="Upgrade to Plus"
              style={({ pressed }) => [styles.upgradeButton, { opacity: pressed ? 0.85 : 1 }]}>
              <ThemedText type="smallBold" style={styles.upgradeButtonText}>
                Upgrade to Plus
              </ThemedText>
            </Pressable>
          )}

          <Pressable
            onPress={handleRestorePurchases}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
            style={({ pressed }) => [styles.restoreRow, { opacity: pressed ? 0.7 : 1 }]}>
            <ThemedText type="small" style={styles.restoreText}>
              Restore Purchases
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText type="smallBold" style={styles.subHeading}>
          General
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Audio
          </ThemedText>

          <View style={styles.segmentedControl}>
            {SOUND_STYLE_OPTIONS.map((option) => {
              const isSelected = option.id === soundStyle;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => handleSelectSoundStyle(option.id)}
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
            Choose the audio cue style played during breathing exercises.
          </ThemedText>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Backing Music
            </ThemedText>
            <Switch
              value={backingMusicEnabled}
              onValueChange={handleToggleBackingMusic}
              accessibilityLabel="Backing music"
            />
          </View>

          <ThemedText type="small" style={styles.sectionHint}>
            Play a music track underneath breathing exercises.
          </ThemedText>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Auto Stop
            </ThemedText>
            <Switch
              value={timerEnabled}
              onValueChange={handleToggleTimer}
              accessibilityLabel="Auto stop"
            />
          </View>

          {timerEnabled && (
            <View style={styles.minutesRow}>
              {TIMER_MINUTE_OPTIONS.map((minutes) => {
                const isSelected = minutes === timerMinutes;
                return (
                  <Pressable
                    key={minutes}
                    onPress={() => handleSelectMinutes(minutes)}
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

          <ThemedText type="small" style={styles.sectionHint}>
            {timerEnabled
              ? `Sessions will automatically stop after ${timerMinutes} minutes with the exception of Cyclic Hyperventilation which will run until completion of the number of rounds set, unless stopped manually.`
              : 'Sessions run until you stop them manually.'}
          </ThemedText>
        </View>

        <ThemedText type="smallBold" style={styles.subHeading}>
          Buteyko
        </ThemedText>

        <View style={styles.section}>
          <ThemedText type="smallBold" style={styles.cardTitle}>
            Hold Duration
          </ThemedText>

          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => handleButeykoHoldChange(clampButeykoHoldSeconds(buteykoHoldSeconds - BUTEYKO_HOLD_STEP_SECONDS))}
              disabled={buteykoHoldSeconds <= MIN_BUTEYKO_HOLD_SECONDS}
              accessibilityRole="button"
              accessibilityLabel="Decrease hold duration"
              style={[styles.stepperButton, buteykoHoldSeconds <= MIN_BUTEYKO_HOLD_SECONDS && styles.stepperButtonDisabled]}>
              <SymbolView
                name={{ ios: 'minus', android: 'remove', web: 'remove' }}
                size={16}
                tintColor={theme.text}
              />
            </Pressable>
            <ThemedText type="smallBold" style={styles.stepperValue}>
              {buteykoHoldSeconds}s
            </ThemedText>
            <Pressable
              onPress={() => handleButeykoHoldChange(clampButeykoHoldSeconds(buteykoHoldSeconds + BUTEYKO_HOLD_STEP_SECONDS))}
              disabled={buteykoHoldSeconds >= MAX_BUTEYKO_HOLD_SECONDS}
              accessibilityRole="button"
              accessibilityLabel="Increase hold duration"
              style={[styles.stepperButton, buteykoHoldSeconds >= MAX_BUTEYKO_HOLD_SECONDS && styles.stepperButtonDisabled]}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={16}
                tintColor={theme.text}
              />
            </Pressable>
          </View>

          <ThemedText type="small" style={styles.sectionHint}>
            Sustainable breath hold duration. You may notice you can increase this value over time as your practice develops.
          </ThemedText>
        </View>

        <ThemedText type="smallBold" style={styles.subHeading}>
          Cyclic Hyperventilation
        </ThemedText>

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

          <ThemedText type="small" style={styles.sectionHint}>
            Recommend starting with 1 and building up to 2 or 3 over time as your body adapts.
          </ThemedText>

          <View style={styles.divider} />

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

          <View style={styles.divider} />

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

                <View style={styles.stepperRow}>
                  <Pressable
                    onPress={() => handleTummoHoldSecondsChange(clampButeykoHoldSeconds(tummoHoldSeconds - BUTEYKO_HOLD_STEP_SECONDS))}
                    disabled={tummoHoldSeconds <= MIN_BUTEYKO_HOLD_SECONDS}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease hold duration"
                    style={[styles.stepperButton, tummoHoldSeconds <= MIN_BUTEYKO_HOLD_SECONDS && styles.stepperButtonDisabled]}>
                    <SymbolView
                      name={{ ios: 'minus', android: 'remove', web: 'remove' }}
                      size={16}
                      tintColor={theme.text}
                    />
                  </Pressable>
                  <ThemedText type="smallBold" style={styles.stepperValue}>
                    {tummoHoldSeconds}s
                  </ThemedText>
                  <Pressable
                    onPress={() => handleTummoHoldSecondsChange(clampButeykoHoldSeconds(tummoHoldSeconds + BUTEYKO_HOLD_STEP_SECONDS))}
                    disabled={tummoHoldSeconds >= MAX_BUTEYKO_HOLD_SECONDS}
                    accessibilityRole="button"
                    accessibilityLabel="Increase hold duration"
                    style={[styles.stepperButton, tummoHoldSeconds >= MAX_BUTEYKO_HOLD_SECONDS && styles.stepperButtonDisabled]}>
                    <SymbolView
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      size={16}
                      tintColor={theme.text}
                    />
                  </Pressable>
                </View>
              </View>
            </>
          )}

          <View style={styles.divider} />

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

        <ThemedText type="smallBold" style={styles.subHeading}>
          Reminders
        </ThemedText>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <View style={styles.reminderLabel}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Daily practice
              </ThemedText>
              <ThemedText type="small" style={styles.sectionHint}>
                Fit a session into your day
              </ThemedText>
            </View>
            <Switch
              value={dailyNudge.enabled}
              onValueChange={handleToggleDailyNudge}
              accessibilityLabel="Daily practice"
            />
          </View>

          {dailyNudge.enabled && (
            <View style={styles.timePickerRow}>
              <DateTimePicker
                value={reminderToDate(dailyNudge)}
                mode="time"
                display="compact"
                onValueChange={handleDailyNudgeTimeChange}
                style={styles.timePicker}
              />
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View style={styles.reminderLabel}>
              <ThemedText type="smallBold" style={styles.sectionLabel}>
                Wind-down at night
              </ThemedText>
              <ThemedText type="small" style={styles.sectionHint}>
                A gentle cue before bed
              </ThemedText>
            </View>
            <Switch
              value={windDown.enabled}
              onValueChange={handleToggleWindDown}
              accessibilityLabel="Wind-down at night"
            />
          </View>

          {windDown.enabled && (
            <View style={styles.timePickerRow}>
              <DateTimePicker
                value={reminderToDate(windDown)}
                mode="time"
                display="compact"
                onValueChange={handleWindDownTimeChange}
                style={styles.timePicker}
              />
            </View>
          )}
        </View>

        <ThemedText type="smallBold" style={styles.subHeading}>
          Data
        </ThemedText>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Share Anonymous Usage &amp; Crash Data
            </ThemedText>
            <Switch
              value={analyticsEnabled}
              onValueChange={handleToggleAnalytics}
              accessibilityLabel="Share anonymous usage and crash data"
            />
          </View>

          <ThemedText type="small" style={styles.sectionHint}>
            Helps catch bugs and shows which patterns get used - never anything that identifies you, and nothing is sent unless this is on.
          </ThemedText>

          {Platform.OS === 'ios' && (
            <>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <ThemedText type="smallBold" style={styles.sectionLabel}>
                  Log Sessions to Apple Health
                </ThemedText>
                <Switch
                  value={healthSyncEnabled}
                  onValueChange={handleToggleHealthSync}
                  accessibilityLabel="Log sessions to Apple Health"
                />
              </View>

              <ThemedText type="small" style={styles.sectionHint}>
                Completed sessions are logged to Health as Mindful Minutes.
              </ThemedText>
            </>
          )}
        </View>

        <ThemedText type="smallBold" style={styles.subHeading}>
          Legal
        </ThemedText>

        <View style={styles.section}>
          <Pressable style={styles.legalRow} onPress={() => openLegalUrl(PRIVACY_POLICY_URL)}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Privacy Policy
            </ThemedText>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.legalRow} onPress={() => openLegalUrl(TERMS_OF_USE_URL)}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Terms of Use
            </ThemedText>
          </Pressable>

          <View style={styles.divider} />

          <Pressable style={styles.legalRow} onPress={() => openLegalUrl(SAFETY_DISCLAIMER_URL)}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Safety Disclaimer
            </ThemedText>
          </Pressable>
        </View>

        {__DEV__ && (
          <>
            <ThemedText type="smallBold" style={styles.subHeading}>
              Developer
            </ThemedText>

            <View style={styles.section}>
              <View style={styles.toggleRow}>
                <ThemedText type="smallBold" style={styles.sectionLabel}>
                  Force Plus
                </ThemedText>
                <Switch
                  value={isPlus}
                  onValueChange={handleToggleDevPlusOverride}
                  accessibilityLabel="Force Plus entitlement"
                />
              </View>

              <ThemedText type="small" style={styles.sectionHint}>
                Overrides Plus status locally for testing gated features. Dev builds only - never appears in a release build.
              </ThemedText>

              <View style={styles.divider} />

              <View style={styles.toggleRow}>
                <View style={styles.reminderLabel}>
                  <ThemedText type="smallBold" style={styles.sectionLabel}>
                    Skip to Hold
                  </ThemedText>
                  <ThemedText type="small" style={styles.sectionHint}>
                    Cyclic Hyperventilation: go straight to the retention hold, skipping the 30 breaths
                  </ThemedText>
                </View>
                <Switch
                  value={tummoSkipToHold}
                  onValueChange={handleToggleTummoSkipToHold}
                  accessibilityLabel="Skip to Hold"
                />
              </View>
            </View>
          </>
        )}
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
      alignItems: 'center',
      marginTop: Spacing.two,
    },
    title: {
      ...SystemFont.medium,
      color: theme.text,
    },
    subHeading: {
      marginTop: Spacing.five,
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontSize: 12,
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
    // For a title standing alone as a card's only heading (not sharing a
    // row with a Switch/control) - sectionLabel's flex:1 is only meant for
    // that row context and can collapse to zero height on native without a
    // sibling to size against.
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
    // Plain RN stepper instead of @expo/ui's Host/Picker - that native
    // SwiftUI-hosted control had a persistent bug where its label would
    // render overlapping the hint text below it after an unrelated card
    // elsewhere on the screen changed size while this one was scrolled out
    // of view. Several layout-side fixes (matchContents, a reserved
    // minHeight, even a separate overflow:hidden clipping ancestor) all
    // failed to stop it, which points to the glitch being in how the
    // native view composites itself rather than anything fixable from RN
    // style code. A plain Pressable-based stepper sidesteps the whole
    // native-hosting bridge for this control.
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    stepperButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperButtonDisabled: {
      opacity: 0.35,
    },
    stepperValue: {
      minWidth: 44,
      textAlign: 'center',
      color: theme.text,
    },
    reminderLabel: {
      flex: 1,
      flexShrink: 1,
      gap: Spacing.half,
    },
    upgradeButton: {
      backgroundColor: theme.accent,
      borderRadius: 10,
      paddingVertical: Spacing.two,
      alignItems: 'center',
    },
    upgradeButtonText: {
      color: '#FFFFFF',
    },
    restoreRow: {
      alignItems: 'center',
    },
    legalRow: {
      paddingVertical: Spacing.one,
    },
    restoreText: {
      color: theme.textSecondary,
    },
    timePickerRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: Spacing.one,
    },
    timePicker: {
      width: 100,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.border,
      marginVertical: Spacing.three,
    },
  });
}
