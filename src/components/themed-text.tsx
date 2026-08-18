import { StyleSheet, Text, type TextProps } from 'react-native';

import { Helvetica, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    ...Helvetica.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    ...Helvetica.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  default: {
    ...Helvetica.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  title: {
    ...Helvetica.bold,
    fontSize: 40,
    lineHeight: 44,
  },
  subtitle: {
    ...Helvetica.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  link: {
    ...Helvetica.medium,
    lineHeight: 22,
    fontSize: 14,
  },
  linkPrimary: {
    ...Helvetica.medium,
    lineHeight: 22,
    fontSize: 14,
    color: '#3B82F6',
  },
  code: {
    ...Helvetica.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
