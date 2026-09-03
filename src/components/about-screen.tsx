import { useCallback, useEffect, useMemo, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { WorldHeatmap } from '@/components/world-heatmap';
import { COMMUNITY_MAP_COUNTS_URL } from '@/constants/community-map';
import { getAnalyticsEnabled } from '@/lib/settings';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const COMMUNITY_MAP_FETCH_TIMEOUT_MS = 5000;

// Fetches the latest published counts (see COMMUNITY_MAP_COUNTS_URL's
// comment for the pipeline that produces them). Resolves to undefined on
// any failure or timeout, which leaves WorldHeatmap's own placeholder
// hotspot in place rather than showing a blank map.
function useCommunityMapCounts(): number[] | undefined {
  const [counts, setCounts] = useState<number[] | undefined>(undefined);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), COMMUNITY_MAP_FETCH_TIMEOUT_MS);

    fetch(COMMUNITY_MAP_COUNTS_URL, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (Array.isArray(data?.counts)) {
          setCounts(data.counts);
        }
      })
      .catch(() => {
        // Offline, timed out, or no data published yet - keep the fallback.
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return counts;
}

// Matches the magpie background on the Home screen (breathing-screen.tsx).
const BG_WREN_SOURCE = require('../../assets/images/bg-variegated-wren.png');
const BG_WREN_SIZE = 380;
const BG_WREN_OPACITY = 0.2;
const BG_WREN_LIFT = 20;
const BG_WREN_SHIFT_LEFT = 10;

// Required attribution for the licensed backing-music tracks - see
// src/lib/backing-music.ts for where each track is actually used.
const SUPPORT_EMAIL = 'breatheeasyaviary@gmail.com';

const MUSIC_CREDITS = [
  'Music track: A Sweet Story by Guillermo Guareschi',
  'Music track: Enlivening by Pufino',
  'Music track: City Life by Spiring',
  'Music track: Thoughtful by Pufino',
  'Music track: Freedom Motivation by Walen',
  'Music track: Careful by Pufino',
  'Music track: Dark Heart by Walen',
];

export function AboutScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mapWidth, setMapWidth] = useState(0);
  const communityMapCounts = useCommunityMapCounts();
  // null until loaded, so the hint card doesn't flash on screen before we
  // know whether analytics sharing is already on.
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean | null>(null);

  // Refetch on focus so flipping the toggle in Settings and coming back
  // hides the card immediately.
  useFocusEffect(useCallback(() => {
    getAnalyticsEnabled().then(setAnalyticsEnabled);
  }, []));

  return (
    <View style={styles.container}>
      {/* pointerEvents is passed via style rather than as a prop, per the
          "props.pointerEvents is deprecated" warning - expo-image's
          ImageStyle type hasn't caught up with that change yet, hence the
          cast. */}
      <Image source={BG_WREN_SOURCE} style={[styles.bgImage, { pointerEvents: 'none' } as any]} />
      {/* edges excludes 'bottom' - this screen sits above the tab bar, not
          against the device's true bottom edge, so SafeAreaView's default
          bottom inset (sized for the home indicator) double-reserves space
          the tab bar already accounts for, leaving a permanent gap above it
          regardless of scroll position. */}
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            About
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <ThemedText type="smallBold" style={styles.mapTitle}>
            Around the World
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Where the Breathe Easy community is practicing.
          </ThemedText>

          <View style={styles.mapContainer} onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}>
            {mapWidth > 0 && <WorldHeatmap width={mapWidth} counts={communityMapCounts} />}
          </View>

          {analyticsEnabled === false && (
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel="Turn on sharing anonymous usage data, in Settings"
              style={({ pressed }) => [styles.analyticsHint, { opacity: pressed ? 0.85 : 1 }]}>
              <SymbolView
                name={{ ios: 'globe.americas.fill', android: 'public', web: 'public' }}
                size={18}
                tintColor={theme.textSecondary}
              />
              <View style={styles.analyticsHintText}>
                <ThemedText type="smallBold" style={styles.analyticsHintTitle}>
                  Help build this map
                </ThemedText>
                <ThemedText type="small" style={styles.analyticsHintBody}>
                  Turn on anonymous usage sharing in Settings — it also helps us improve the app.
                </ThemedText>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={14}
                tintColor={theme.textSecondary}
              />
            </Pressable>
          )}

          <ThemedText type="smallBold" style={styles.mapTitle}>
            Music Credits
          </ThemedText>
          <View style={styles.creditsList}>
            {MUSIC_CREDITS.map((credit) => (
              <ThemedText key={credit} type="small" style={styles.creditLine}>
                {credit}
              </ThemedText>
            ))}
          </View>

          <ThemedText type="smallBold" style={styles.mapTitle}>
            About
          </ThemedText>
          <ThemedText type="small" style={styles.subtitle}>
            Made in Melbourne (Naarm), Australia.
          </ThemedText>
          <ThemedText type="small" style={styles.feedbackPrompt}>
            Tell us what you love, what could be better, or ideas for new features.
          </ThemedText>
          <Pressable onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)} hitSlop={Spacing.one}>
            <ThemedText type="small" style={styles.feedbackLink}>
              Send feedback — {SUPPORT_EMAIL}
            </ThemedText>
          </Pressable>
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
      width: BG_WREN_SIZE,
      height: BG_WREN_SIZE,
      right: -BG_WREN_SIZE * 0.22 + BG_WREN_SHIFT_LEFT,
      bottom: -BG_WREN_SIZE * 0.06 + BG_WREN_LIFT,
      opacity: BG_WREN_OPACITY,
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
    mapTitle: {
      color: theme.text,
      marginTop: Spacing.four,
    },
    subtitle: {
      color: theme.textSecondary,
      marginTop: Spacing.one,
    },
    mapContainer: {
      marginTop: Spacing.four,
    },
    analyticsHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      padding: Spacing.three,
      marginTop: Spacing.four,
    },
    analyticsHintText: {
      flex: 1,
      gap: 2,
    },
    analyticsHintTitle: {
      color: theme.text,
    },
    analyticsHintBody: {
      color: theme.textSecondary,
    },
    scrollContent: {
      paddingBottom: Spacing.five,
    },
    creditsList: {
      marginTop: Spacing.two,
      gap: Spacing.half,
    },
    creditLine: {
      color: theme.textSecondary,
    },
    feedbackPrompt: {
      color: theme.textSecondary,
      marginTop: Spacing.two,
    },
    feedbackLink: {
      color: theme.accent,
      marginTop: Spacing.one,
    },
  });
}
