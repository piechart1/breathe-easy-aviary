import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { scheduleDailyNudge } from '@/lib/notifications';
import { initPurchases } from '@/lib/purchases';
import { getAnalyticsEnabled, getDailyNudgeSettings } from '@/lib/settings';
import { initTelemetry } from '@/lib/telemetry';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    getAnalyticsEnabled().then((enabled) => {
      if (enabled) {
        initTelemetry();
      }
    });
    initPurchases();
    // Re-arms the daily nudge's Wednesday-rotation notification against
    // today's date - see the comment on WEDNESDAY_ROTATION_BODIES in
    // notifications.ts for why this needs to happen somewhere that runs
    // periodically rather than just once when the reminder is turned on.
    getDailyNudgeSettings().then(({ enabled, hour, minute }) => {
      if (enabled) {
        scheduleDailyNudge(hour, minute);
      }
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="articles/[slug]" />
        <Stack.Screen name="settings/buteyko" />
        <Stack.Screen name="settings/tummo" />
      </Stack>
    </ThemeProvider>
  );
}
