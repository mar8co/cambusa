import { ActivityIndicator, Pressable, View, type ViewStyle } from 'react-native';

import { radius, space, useTheme } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}: Props) {
  const { palette } = useTheme();
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  const bg = isPrimary ? palette.accent : isGhost ? 'transparent' : palette.surfaceAlt;
  const fg = isPrimary ? 'onAccent' : 'ink';

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.sm,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
          borderRadius: radius.md,
          backgroundColor: bg,
          borderWidth: isGhost ? 0 : 1,
          borderColor: isPrimary ? palette.accent : palette.hair,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.onAccent : palette.ink} />
      ) : (
        <>
          {icon ? <View>{icon}</View> : null}
          <Text variant="bodyStrong" color={fg as 'ink'}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
