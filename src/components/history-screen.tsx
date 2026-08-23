import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { getDailyTotals, type DailyTotal } from '@/lib/session-history';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const BAR_COLOR = '#B0A99F'; // warm stone/taupe
const CHART_HEIGHT = 120;
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const DAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function formatDuration(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

function formatDateRange(start: Date, end: Date): string {
  const startLabel = `${start.getDate()}`;
  const endLabel = `${end.getDate()} ${MONTH_NAMES[end.getMonth()]}`;
  return `${startLabel} – ${endLabel}`;
}

type Styles = ReturnType<typeof createStyles>;

function WeekChart({
  days,
  maxSeconds,
  accentColor,
  borderColor,
  styles,
}: {
  days: DailyTotal[];
  maxSeconds: number;
  accentColor: string;
  borderColor: string;
  styles: Styles;
}) {
  const weekTotal = days.reduce((sum, day) => sum + day.seconds, 0);

  return (
    <View style={styles.weekBlock}>
      <ThemedText type="smallBold" style={styles.weekTotal}>
        {formatDuration(weekTotal)} total
      </ThemedText>

      <View style={styles.chartArea}>
        <View style={styles.barsRow}>
          {days.map((day) => {
            const ratio = maxSeconds > 0 ? day.seconds / maxSeconds : 0;
            const barHeight = Math.max(3, ratio * CHART_HEIGHT);
            return (
              <View key={day.dateKey} style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: day.seconds > 0 ? accentColor : borderColor,
                    },
                  ]}
                  accessibilityLabel={`${DAY_INITIALS[day.date.getDay()]}: ${formatDuration(day.seconds)}`}
                />
              </View>
            );
          })}
        </View>
      </View>

      <ThemedText type="small" style={styles.weekRangeLabel}>
        {formatDateRange(days[0].date, days[days.length - 1].date)}
      </ThemedText>
    </View>
  );
}

export function HistoryScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[] | null>(null);

  const loadTotals = useCallback(() => {
    getDailyTotals(14).then(setDailyTotals);
  }, []);

  // Refetch every time this tab gains focus, so the rolling 14-day window
  // and any session just recorded are reflected immediately, not just on
  // first app launch.
  useFocusEffect(loadTotals);

  const maxSeconds = dailyTotals ? Math.max(1, ...dailyTotals.map((day) => day.seconds)) : 1;
  const olderWeek = dailyTotals?.slice(0, 7) ?? [];
  const newerWeek = dailyTotals?.slice(7, 14) ?? [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Breathing Time
          </ThemedText>
        </View>

        <ThemedText type="small" style={styles.subtitle}>Last 14 Days</ThemedText>

        {dailyTotals && (
          <View style={styles.weeksRow}>
            <WeekChart
              days={olderWeek}
              maxSeconds={maxSeconds}
              accentColor={BAR_COLOR}
              borderColor={theme.border}
              styles={styles}
            />
            <WeekChart
              days={newerWeek}
              maxSeconds={maxSeconds}
              accentColor={BAR_COLOR}
              borderColor={theme.border}
              styles={styles}
            />
          </View>
        )}
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
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  title: {
    ...SystemFont.medium,
    color: theme.text,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    color: theme.textSecondary,
    marginTop: Spacing.four,
  },
  weeksRow: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginTop: Spacing.four,
  },
  weekBlock: {
    flex: 1,
    gap: Spacing.two,
  },
  weekTotal: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  chartArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    gap: Spacing.half,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: CHART_HEIGHT,
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  weekRangeLabel: {
    color: theme.textSecondary,
  },
  });
}
