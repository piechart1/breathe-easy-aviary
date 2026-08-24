import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ARTICLES } from '@/constants/articles';
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
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Topics
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {ARTICLES.map((article) => (
            <Pressable
              key={article.slug}
              onPress={() => router.push(`/articles/${article.slug}`)}
              accessibilityRole="button"
              accessibilityLabel={`Read: ${article.title}`}
              style={({ pressed }) => [styles.articleCard, { opacity: pressed ? 0.85 : 1 }]}>
              <View style={styles.articleCardText}>
                <ThemedText type="smallBold" style={styles.articleTitle}>{article.title}</ThemedText>
                <ThemedText type="small" style={styles.articleSummary}>{article.summary}</ThemedText>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={16}
                tintColor={theme.textSecondary}
              />
            </Pressable>
          ))}
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
    list: {
      gap: Spacing.three,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.five,
    },
    articleCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.three,
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      padding: Spacing.three,
    },
    articleCardText: {
      flex: 1,
      gap: Spacing.one,
    },
    articleTitle: {
      color: theme.text,
    },
    articleSummary: {
      color: theme.textSecondary,
    },
  });
}
