import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { Host, Picker } from '@expo/ui';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';

import { ThemedText } from '@/components/themed-text';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DEFAULT_BUTEYKO_HOLD_SECONDS,
  DEFAULT_TIMER_MINUTES,
  MAX_BUTEYKO_HOLD_SECONDS,
  MIN_BUTEYKO_HOLD_SECONDS,
  TIMER_MINUTE_OPTIONS,
  type ReminderSettings,
  getAnalyticsEnabled,
  getButeykoHoldSeconds,
  getDailyNudgeSettings,
  getTimerSettings,
  getWindDownSettings,
  setAnalyticsEnabled as persistAnalyticsEnabled,
  setButeykoHoldSeconds as persistButeykoHoldSeconds,
  setDailyNudgeSettings as persistDailyNudgeSettings,
  setTimerEnabled as persistTimerEnabled,
  setTimerMinutes as persistTimerMinutes,
  setWindDownSettings as persistWindDownSettings,
} from '@/lib/settings';
import { disableTelemetry, initTelemetry } from '@/lib/telemetry';
import { cancelDailyNudge, cancelWindDown, scheduleDailyNudge, scheduleWindDown } from '@/lib/notifications';

// Matches the magpie background on the Home screen (breathing-screen.tsx).
const BG_EMU_SOURCE = require('../../assets/images/bg-emu.png');
const BG_EMU_SIZE = 320;
const BG_EMU_OPACITY = 0.2;
const BG_EMU_LIFT = 20;
const BG_EMU_SHIFT_LEFT = 10;

const BUTEYKO_HOLD_SECOND_OPTIONS = Array.from(
  { length: MAX_BUTEYKO_HOLD_SECONDS - MIN_BUTEYKO_HOLD_SECONDS + 1 },
  (_, index) => MIN_BUTEYKO_HOLD_SECONDS + index,
);

function reminderToDate(reminder: ReminderSettings): Date {
  const date = new Date();
  date.setHours(reminder.hour, reminder.minute, 0, 0);
  return date;
}

export function SettingsScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [timerEnabled, setTimerEnabledState] = useState(false);
  const [timerMinutes, setTimerMinutesState] = useState(DEFAULT_TIMER_MINUTES);
  const [buteykoHoldSeconds, setButeykoHoldSecondsState] = useState(DEFAULT_BUTEYKO_HOLD_SECONDS);
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(false);
  const [dailyNudge, setDailyNudge] = useState<ReminderSettings>({ enabled: false, hour: 9, minute: 0 });
  const [windDown, setWindDown] = useState<ReminderSettings>({ enabled: false, hour: 21, minute: 0 });

  useFocusEffect(
    useCallback(() => {
      getTimerSettings().then(({ enabled, minutes }) => {
        setTimerEnabledState(enabled);
        setTimerMinutesState(minutes);
      });
      getButeykoHoldSeconds().then(setButeykoHoldSecondsState);
      getAnalyticsEnabled().then(setAnalyticsEnabledState);
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

  const handleButeykoHoldChange = (seconds: number) => {
    setButeykoHoldSecondsState(seconds);
    persistButeykoHoldSeconds(seconds);
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
      <Image source={BG_EMU_SOURCE} style={styles.bgImage} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Settings
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Default Timer Duration
            </ThemedText>
            <Switch
              value={timerEnabled}
              onValueChange={handleToggleTimer}
              accessibilityLabel="Default timer duration"
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
              ? `Sessions will automatically stop after ${timerMinutes} minutes.`
              : 'Sessions run until you stop them manually.'}
          </ThemedText>
        </View>

        <View style={styles.section}>
          <View style={styles.toggleRow}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              Buteyko Hold Duration
            </ThemedText>

            <Host matchContents style={styles.secondsPickerHost} seedColor={theme.text}>
              <Picker
                selectedValue={buteykoHoldSeconds}
                onValueChange={handleButeykoHoldChange}
                appearance="menu">
                {BUTEYKO_HOLD_SECOND_OPTIONS.map((seconds) => (
                  <Picker.Item key={seconds} label={`${seconds}s`} value={seconds} />
                ))}
              </Picker>
            </Host>
          </View>
        </View>

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
        </View>

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
      width: BG_EMU_SIZE,
      height: BG_EMU_SIZE,
      right: -BG_EMU_SIZE * 0.22 + BG_EMU_SHIFT_LEFT,
      bottom: -BG_EMU_SIZE * 0.06 + BG_EMU_LIFT,
      opacity: BG_EMU_OPACITY,
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
    section: {
      marginTop: Spacing.five,
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
    sectionHint: {
      color: theme.textSecondary,
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
