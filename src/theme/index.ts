import { useColorScheme } from 'react-native';

import { palettes, type Palette } from './tokens';

export * from './tokens';

/** Restituisce la palette attiva in base allo schema di sistema. */
export function useTheme(): { palette: Palette; scheme: 'light' | 'dark' } {
  const scheme = useColorScheme();
  const name = scheme === 'dark' ? 'dark' : 'light';
  return { palette: palettes[name], scheme: name };
}
