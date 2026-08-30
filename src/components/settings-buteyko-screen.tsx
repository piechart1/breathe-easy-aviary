import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Host, Picker } from '@expo/ui';

import { ThemedText } from '@/components/themed-text';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  DEFAULT_BUTEYKO_HOLD_SECONDS,
  MAX_BUTEYKO_HOLD_SECONDS,
  MIN_BUTEYKO_HOLD_SECONDS,
  getButeykoHoldSeconds,
  setButeykoHoldSeconds as persistButeykoHoldSeconds,
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

export function SettingsButeykoScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [buteykoHoldSeconds, setButeykoHoldSecondsState] = useState(DEFAULT_BUTEYKO_HOLD_SECONDS);

  useFocusEffect(
    useCallback(() => {
      getButeykoHoldSeconds().then(setButeykoHoldSecondsState);
    }, []),
  );

  const handleButeykoHoldChange = (seconds: number) => {
    setButeykoHoldSecondsState(seconds);
    persistButeykoHoldSeconds(seconds);
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
            Buteyko
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <ThemedText type="smallBold" style={styles.cardTitle}>
              Hold Duration
            </ThemedText>

            <Host matchContents={{ vertical: true }} style={styles.secondsPickerHost} seedColor={theme.text}>
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
    cardTitle: {
      color: theme.text,
    },
    secondsPickerHost: {
      alignSelf: 'flex-start',
      // Width is fixed rather than left to matchContents' horizontal mode:
      // that mode locks its measurement at mount, but selectedValue (loaded
      // from storage a moment after mount) can render a much wider label
      // than the default one it mounted with - e.g. "300s" vs "15s" - and
      // the stale, too-narrow box then lets the wider SwiftUI label overflow
      // and wrap outside the card. A fixed width sized for the widest
      // possible label (up to MAX_BUTEYKO_HOLD_SECONDS = 300) avoids that.
      minWidth: 72,
    },
  });
}
