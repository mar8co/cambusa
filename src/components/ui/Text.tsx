import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { type Palette, type TypeVariant, type, useTheme } from '@/theme';

type Props = RNTextProps & {
  variant?: TypeVariant;
  /** chiave colore della palette; default 'ink' */
  color?: keyof Palette;
};

/** Testo tematizzato: applica scala tipografica e colore dalla palette. */
export function Text({ variant = 'body', color = 'ink', style, ...rest }: Props) {
  const { palette } = useTheme();
  return <RNText style={[type[variant], { color: palette[color] }, style]} {...rest} />;
}
