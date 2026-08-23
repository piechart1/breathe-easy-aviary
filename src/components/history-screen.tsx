import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { getDailyTotals, seedMockDailyMinutes, type DailyTotal } from '@/lib/session-history';
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
  const weekAverage = weekTotal / days.length;
  const averageRatio = maxSeconds > 0 ? Math.min(1, weekAverage / maxSeconds) : 0;

  return (
    <View style={styles.weekBlock}>
      <ThemedText type="smallBold" style={[styles.weekTotal, { color: accentColor }]}>
        {formatDuration(weekTotal)}
      </ThemedText>
      <ThemedText type="small" style={styles.weekAverage}>
        {formatDuration(weekAverage)} avg
      </ThemedText>

      <View style={styles.chartArea}>
        {weekTotal > 0 && (
          <View
            style={[styles.averageLine, { bottom: averageRatio * CHART_HEIGHT }]}
            accessibilityElementsHidden
          />
        )}
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
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [dailyTotals, setDailyTotals] = useState<DailyTotal[] | null>(null);

  const loadTotals = useCallback(() => {
    getDailyTotals(14).then(setDailyTotals);
  }, []);

  useEffect(() => {
    // TEMPORARY: seed requested mock data (minutes/day, 10 Aug onward), then load.
    seedMockDailyMinutes([3, 6, 2, 9, 1, 3, 6, 8, 5, 3, 2, 1, 1, 5]).then(loadTotals);
  }, [loadTotals]);

  const maxSeconds = dailyTotals ? Math.max(1, ...dailyTotals.map((day) => day.seconds)) : 1;
  const olderWeek = dailyTotals?.slice(0, 7) ?? [];
  const newerWeek = dailyTotals?.slice(7, 14) ?? [];

  return (
    <View style={styles.container}>
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
            Breathing Time
          </ThemedText>
          <View style={styles.headerSpacer} />
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
  },
  weekAverage: {
    color: theme.textSecondary,
  },
  chartArea: {
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  averageLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.textSecondary,
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
