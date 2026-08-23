import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ARTICLES } from '@/constants/articles';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ArticleDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = ARTICLES.find((item) => item.slug === slug);

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
          <View style={styles.headerSpacer} />
        </View>

        {article ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle" style={styles.title} accessibilityRole="header">
              {article.title}
            </ThemedText>
            {article.body.split('\n\n').map((paragraph, index) => (
              <ThemedText key={index} type="default" style={styles.paragraph}>
                {paragraph}
              </ThemedText>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.notFound}>
            <ThemedText type="default" style={styles.notFoundText}>Article not found.</ThemedText>
          </View>
        )}
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
    scrollContent: {
      paddingTop: Spacing.two,
      paddingBottom: Spacing.five,
      gap: Spacing.three,
    },
    title: {
      ...SystemFont.medium,
      color: theme.text,
    },
    paragraph: {
      color: theme.textSecondary,
      lineHeight: 22,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFoundText: {
      color: theme.textSecondary,
    },
  });
}
