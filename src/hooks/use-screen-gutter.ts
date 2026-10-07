import { Platform, useWindowDimensions } from 'react-native';

import { Spacing } from '@/constants/theme';

// The horizontal padding for a tab's content, chosen so it lines up with the
// left edge of the system navigation bar's large title. iOS insets that
// title by 16pt on narrower phones and 20pt on wider ones, and doesn't
// offer a way to move it, so the content follows the title instead.
const WIDE_PHONE_MIN_WIDTH = 414;

export function useScreenGutter(): number {
  const { width } = useWindowDimensions();
  if (Platform.OS !== 'ios') {
    return Spacing.four;
  }
  return width >= WIDE_PHONE_MIN_WIDTH ? 20 : 16;
}
