import { Minus, Plus } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Text } from './Text';

type Props = {
  /** etichetta già formattata (es. "500 g") */
  value: string;
  onDec: () => void;
  onInc: () => void;
};

export function Stepper({ value, onDec, onInc }: Props) {
  const { palette } = useTheme();
  const btn = {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: palette.surfaceAlt,
  };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Pressable onPress={onDec} hitSlop={6} style={btn}>
        <Minus size={16} color={palette.ink} strokeWidth={2.5} />
      </Pressable>
      <Text variant="label" color="inkSoft" style={{ minWidth: 56, textAlign: 'center' }}>
        {value}
      </Text>
      <Pressable onPress={onInc} hitSlop={6} style={btn}>
        <Plus size={16} color={palette.ink} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}
