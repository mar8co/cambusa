import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { radius, space, useTheme } from '@/theme';

type Props = {
  children: ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

/** Superficie elevata con bordo sottile. */
export function Card({ children, style, padded = true }: Props) {
  const { palette } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: palette.surface,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: palette.hair,
          padding: padded ? space.lg : 0,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
