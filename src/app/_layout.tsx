import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { SafetyDisclaimerGate } from '@/components/safety-disclaimer-gate';
import { initPurchases } from '@/lib/purchases';
import { getAnalyticsEnabled } from '@/lib/settings';
import { initTelemetry } from '@/lib/telemetry';

SplashScreen.preventAutoHideAsync();
// Called at module load rather than in a useEffect below - Purchases.configure()
// is synchronous, but React fires a child component's effects before its
// parent's in the same commit, so any screen's useIsPlus() (which checks
// this synchronously on mount and permanently gives up on `false` rather
// than retrying) could otherwise run before this had a chance to. Calling
// it here guarantees it completes before any component starts rendering.
initPurchases();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    getAnalyticsEnabled().then((enabled) => {
      if (enabled) {
        initTelemetry();
      }
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <SafetyDisclaimerGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="articles/[slug]" />
      </Stack>
    </ThemeProvider>
  );
}
