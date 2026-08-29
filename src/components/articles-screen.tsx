import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ARTICLES } from '@/constants/articles';
import { todaysQuote } from '@/constants/quotes';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// Matches the magpie background on the Home screen (breathing-screen.tsx).
const BG_EMU_SOURCE = require('../../assets/images/bg-emu.png');
const BG_EMU_SIZE = 380;
const BG_EMU_OPACITY = 0.2;
const BG_EMU_LIFT = 20;
const BG_EMU_SHIFT_LEFT = -40;

export function ArticlesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const quote = useMemo(() => todaysQuote(), []);

  return (
    <View style={styles.container}>
      <Image source={BG_EMU_SOURCE} style={styles.bgImage} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
            Topics
          </ThemedText>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
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
      width: BG_EMU_SIZE,
      height: BG_EMU_SIZE,
      right: -BG_EMU_SIZE * 0.22 + BG_EMU_SHIFT_LEFT,
      bottom: -BG_EMU_SIZE * 0.06 + BG_EMU_LIFT,
      opacity: BG_EMU_OPACITY,
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
