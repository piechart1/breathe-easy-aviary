import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ArticlesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

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
            Articles & Info
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.placeholder}>
          <SymbolView
            name={{ ios: 'book.closed', android: 'menu_book', web: 'menu_book' }}
            size={40}
            tintColor={theme.textSecondary}
          />
          <ThemedText type="default" style={styles.placeholderTitle}>
            Coming soon
          </ThemedText>
          <ThemedText type="small" style={styles.placeholderBody}>
            Articles and background reading on each breathing technique will live here.
          </ThemedText>
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
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.five,
    },
    placeholderTitle: {
      color: theme.text,
    },
    placeholderBody: {
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
}
