import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ARTICLES } from '@/constants/articles';
import { todaysQuote } from '@/constants/quotes';
import { Spacing } from '@/constants/theme';
import { useScreenGutter } from '@/hooks/use-screen-gutter';
import { useTheme } from '@/hooks/use-theme';

export function ArticlesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const screenGutter = useScreenGutter();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const quote = useMemo(() => todaysQuote(), []);

  return (
        <ScrollView
          style={styles.container}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.list, { paddingHorizontal: screenGutter }]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.quoteContainer}>
            <ThemedText type="small" style={styles.quoteText}>
              &ldquo;{quote.text}&rdquo;
            </ThemedText>
            <ThemedText type="small" style={styles.quoteAuthor}>
              — {quote.author}
            </ThemedText>
          </View>

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
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    list: {
      gap: Spacing.three,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.five,
    },
    quoteContainer: {
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.two,
    },
    quoteText: {
      color: theme.text,
      fontStyle: 'italic',
      fontSize: 22,
      lineHeight: 30,
      textAlign: 'center',
    },
    quoteAuthor: {
      alignSelf: 'stretch',
      color: theme.textSecondary,
      textAlign: 'right',
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
