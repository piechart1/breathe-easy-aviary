import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';

import { ThemedText } from '@/components/themed-text';
import { PRIVACY_POLICY_URL, TERMS_OF_USE_URL } from '@/constants/legal';
import { Spacing, SystemFont } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getHasAcceptedSafetyDisclaimer, setHasAcceptedSafetyDisclaimer } from '@/lib/settings';

function openLink(url: string) {
  openBrowserAsync(url, { presentationStyle: WebBrowserPresentationStyle.AUTOMATIC });
}

export function SafetyDisclaimerGate() {
  const theme = useTheme();
  const styles = createStyles(theme);
  // Defaults to true (blocking) so the gate is fail-closed - it only ever
  // disappears once we've positively confirmed acceptance was stored,
  // never because the async read hasn't resolved yet.
  const [showGate, setShowGate] = useState(true);

  useEffect(() => {
    getHasAcceptedSafetyDisclaimer().then((accepted) => setShowGate(!accepted));
  }, []);

  if (!showGate) return null;

  const handleAgree = () => {
    setHasAcceptedSafetyDisclaimer(true);
    setShowGate(false);
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Before you begin
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            A few of the breathing patterns in this app - like Cyclic Hyperventilation - involve rapid breathing and
            extended breath holds, which can cause lightheadedness or dizziness in some people.
          </ThemedText>

          <ThemedText type="smallBold" style={styles.subheading}>
            Talk to a doctor first if:
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            You are pregnant, or have epilepsy, cardiovascular disease, high or low blood pressure, a respiratory
            condition such as asthma, or a panic or anxiety disorder.
          </ThemedText>

          <ThemedText type="smallBold" style={styles.subheading}>
            Always:
          </ThemedText>
          <ThemedText style={styles.paragraph}>
            Practice seated or lying down, away from hazards. Never do these exercises while driving, operating
            machinery, or in or near water. Stop immediately if you feel unwell.
          </ThemedText>

          <ThemedText style={styles.paragraph}>
            This app is a wellness tool, not a substitute for medical advice. By continuing, you agree to the{' '}
            <ThemedText type="link" themeColor="accent" onPress={() => openLink(TERMS_OF_USE_URL)}>
              Terms of Use
            </ThemedText>{' '}
            and{' '}
            <ThemedText type="link" themeColor="accent" onPress={() => openLink(PRIVACY_POLICY_URL)}>
              Privacy Policy
            </ThemedText>
            , and confirm you've read the full Safety Disclaimer above.
          </ThemedText>
        </ScrollView>

        <Pressable style={styles.button} onPress={handleAgree} accessibilityRole="button">
          <ThemedText type="smallBold" themeColor="textOnAccent">
            I Understand &amp; Agree
          </ThemedText>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

function createStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: theme.background,
      zIndex: 900,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: Spacing.four,
    },
    scrollContent: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    title: {
      ...SystemFont.bold,
      fontSize: 28,
      lineHeight: 34,
      marginBottom: Spacing.four,
    },
    subheading: {
      marginTop: Spacing.three,
      marginBottom: Spacing.one,
    },
    paragraph: {
      marginBottom: Spacing.two,
    },
    button: {
      backgroundColor: theme.accent,
      borderRadius: 12,
      paddingVertical: Spacing.three,
      alignItems: 'center',
      marginBottom: Spacing.three,
    },
  });
}
