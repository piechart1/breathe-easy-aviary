import { Platform } from 'react-native';
import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';

const IOS_HAS_SCROLL_EDGE_EFFECT = Platform.OS === 'ios' && Number.parseInt(String(Platform.Version), 10) >= 26;

// The stack each tab (other than Home) sits in, which gives it the system
// navigation bar: a large title that shrinks into the bar as the screen
// scrolls. For that to work the screen's ScrollView has to be the screen's
// top-level view, not wrapped in another view, and has to set
// contentInsetAdjustmentBehavior="automatic".
export function TabStack({ title }: { title: string }) {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        title,
        headerLargeTitleEnabled: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        // The bar is transparent so the page background shows behind the
        // large title. iOS 26 and later blur content passing under the bar
        // on their own; earlier versions need a blur set here.
        headerTransparent: true,
        headerBlurEffect: IOS_HAS_SCROLL_EDGE_EFFECT ? undefined : 'systemChromeMaterial',
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },
        // Smaller than the system's 34pt bold large title, and in the medium
        // weight used through the rest of the app.
        headerLargeTitleStyle: { color: theme.text, fontSize: 30, fontWeight: '500' },
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
