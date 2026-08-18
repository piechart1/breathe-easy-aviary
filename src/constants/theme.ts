/**
 * Dark mobile UI palette inspired by layered card interfaces.
 */

import '@/global.css';

import { Platform, type TextStyle } from 'react-native';

export const AccentColors = {
  blue: '#3B82F6',
  green: '#22A06B',
  orange: '#E67E22',
  pink: '#E85D75',
  red: '#DA3633',
} as const;

export const Colors = {
  light: {
    text: '#111111',
    background: '#FFFFFF',
    backgroundElement: '#F4F4F4',
    backgroundSelected: '#E8EAED',
    textSecondary: '#6B7280',
    textOnAccent: '#FFFFFF',
    border: '#E5E7EB',
    accent: AccentColors.blue,
  },
  dark: {
    text: '#FFFFFF',
    background: '#0D1117',
    backgroundElement: '#1C212B',
    backgroundSelected: '#252B36',
    textSecondary: '#8B949E',
    textOnAccent: '#FFFFFF',
    border: '#2A3140',
    accent: AccentColors.blue,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Helvetica: { medium: TextStyle; bold: TextStyle } = {
  medium: Platform.select<TextStyle>({
    ios: { fontFamily: 'HelveticaNeue-Medium', fontWeight: '500' },
    android: { fontFamily: 'sans-serif-medium', fontWeight: '500' },
    web: {
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      fontWeight: '500',
    },
    default: { fontWeight: '500' },
  })!,
  bold: Platform.select<TextStyle>({
    ios: { fontFamily: 'Helvetica-Bold', fontWeight: '700' },
    android: { fontFamily: 'sans-serif', fontWeight: '700' },
    web: {
      fontFamily: 'Helvetica Neue, Helvetica, Arial, sans-serif',
      fontWeight: '700',
    },
    default: { fontWeight: '700' },
  })!,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'HelveticaNeue-Medium',
    serif: 'HelveticaNeue-Medium',
    rounded: 'HelveticaNeue-Medium',
    mono: 'Helvetica-Bold',
  },
  default: {
    sans: 'sans-serif-medium',
    serif: 'sans-serif-medium',
    rounded: 'sans-serif-medium',
    mono: 'sans-serif',
  },
  web: {
    sans: 'var(--font-helvetica)',
    serif: 'var(--font-helvetica)',
    rounded: 'var(--font-helvetica)',
    mono: 'var(--font-helvetica)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
