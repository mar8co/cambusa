import { Pressable } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Text } from './Text';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

/** Chip selezionabile (filtri reparti, unità, ecc.). */
export function Chip({ label, active = false, onPress }: Props) {
  const { palette } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: space.md,
        paddingVertical: space.sm,
        borderRadius: radius.pill,
        backgroundColor: active ? palette.accentWash : palette.surfaceAlt,
        borderWidth: 1,
        borderColor: active ? palette.accent : 'transparent',
      }}>
      <Text variant="label" color={active ? 'accentStrong' : 'inkSoft'}>
        {label}
      </Text>
    </Pressable>
  );
}
