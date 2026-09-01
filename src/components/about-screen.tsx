import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { WorldHeatmap } from '@/components/world-heatmap';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Matches the magpie background on the Home screen (breathing-screen.tsx).
const BG_WREN_SOURCE = require('../../assets/images/bg-variegated-wren.png');
const BG_WREN_SIZE = 380;
const BG_WREN_OPACITY = 0.2;
const BG_WREN_LIFT = 20;
const BG_WREN_SHIFT_LEFT = 10;

// Required attribution for the licensed backing-music tracks - see
// src/lib/backing-music.ts for where each track is actually used.
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
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mapWidth, setMapWidth] = useState(0);

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
            {mapWidth > 0 && <WorldHeatmap width={mapWidth} />}
          </View>

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
  });
}
