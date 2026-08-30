import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';

import { ThemedText } from '@/components/themed-text';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DEFAULT_SOUND_STYLE,
  DEFAULT_TIMER_MINUTES,
  TIMER_MINUTE_OPTIONS,
  type ReminderSettings,
  type SoundStyle,
  getAnalyticsEnabled,
  getBackingMusicEnabled,
  getDailyNudgeSettings,
  getHealthSyncEnabled,
  getSoundStyle,
  getTimerSettings,
  getWindDownSettings,
  setAnalyticsEnabled as persistAnalyticsEnabled,
  setBackingMusicEnabled as persistBackingMusicEnabled,
  setDailyNudgeSettings as persistDailyNudgeSettings,
  setHealthSyncEnabled as persistHealthSyncEnabled,
  setSoundStyle as persistSoundStyle,
  setTimerEnabled as persistTimerEnabled,
  setTimerMinutes as persistTimerMinutes,
  setWindDownSettings as persistWindDownSettings,
} from '@/lib/settings';
import { disableTelemetry, initTelemetry } from '@/lib/telemetry';
import { cancelDailyNudge, cancelWindDown, scheduleDailyNudge, scheduleWindDown } from '@/lib/notifications';
import { requestHealthKitPermission } from '@/lib/healthkit';

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

function reminderToDate(reminder: ReminderSettings): Date {
  const date = new Date();
  date.setHours(reminder.hour, reminder.minute, 0, 0);
  return date;
}

export function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [timerEnabled, setTimerEnabledState] = useState(false);
  const [timerMinutes, setTimerMinutesState] = useState(DEFAULT_TIMER_MINUTES);
  const [soundStyle, setSoundStyleState] = useState<SoundStyle>(DEFAULT_SOUND_STYLE);
  const [backingMusicEnabled, setBackingMusicEnabledState] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(false);
  const [healthSyncEnabled, setHealthSyncEnabledState] = useState(false);
  const [dailyNudge, setDailyNudge] = useState<ReminderSettings>({ enabled: false, hour: 9, minute: 0 });
  const [windDown, setWindDown] = useState<ReminderSettings>({ enabled: false, hour: 21, minute: 0 });

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

  return (
    <View style={styles.container}>
      <Image source={BG_FINCH_SOURCE} style={styles.bgImage} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Settings
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
        </View>

        <View style={styles.section}>
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
        </View>

        <View style={styles.section}>
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
              ? `Sessions will automatically stop after ${timerMinutes} minutes with the exception of Tummo which will run until completion of the number of rounds set, unless stopped manually.`
              : 'Sessions run until you stop them manually.'}
          </ThemedText>
        </View>

        <ThemedText type="smallBold" style={styles.subHeading}>
          Patterns
        </ThemedText>

        <Pressable
          onPress={() => router.push('/settings/buteyko')}
          accessibilityRole="button"
          accessibilityLabel="Buteyko settings"
          style={({ pressed }) => [styles.section, { opacity: pressed ? 0.7 : 1 }]}>
          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Buteyko
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
              tintColor={theme.textSecondary}
            />
          </View>
        </Pressable>

        <Pressable
          onPress={() => router.push('/settings/tummo')}
          accessibilityRole="button"
          accessibilityLabel="Tummo settings"
          style={({ pressed }) => [styles.section, { opacity: pressed ? 0.7 : 1 }]}>
          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Tummo
            </ThemedText>
            <SymbolView
              name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
              size={16}
              tintColor={theme.textSecondary}
            />
          </View>
        </Pressable>

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
    reminderLabel: {
      flex: 1,
      flexShrink: 1,
      gap: Spacing.half,
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
