import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

export function AboutScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [mapWidth, setMapWidth] = useState(0);

  return (
    <View style={styles.container}>
      <Image source={BG_WREN_SOURCE} style={styles.bgImage} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            About
          </ThemedText>
        </View>

        <ThemedText type="smallBold" style={styles.mapTitle}>
          Around the World
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Where the Breathe Easy community is practicing right now.
        </ThemedText>

        <View style={styles.mapContainer} onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}>
          {mapWidth > 0 && <WorldHeatmap width={mapWidth} />}
        </View>
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
  });
}
