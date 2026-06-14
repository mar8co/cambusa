import { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

type Props = {
  children: ReactNode;
  /** applica padding top dell'area sicura (default true) */
  edgeTop?: boolean;
  style?: ViewStyle;
};

/** Contenitore pagina: sfondo tematico + safe-area top. */
export function Screen({ children, edgeTop = true, style }: Props) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        { flex: 1, backgroundColor: palette.bg, paddingTop: edgeTop ? insets.top : 0 },
        style,
      ]}>
      {children}
    </View>
  );
}
