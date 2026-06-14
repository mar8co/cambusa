import { TextInput, type TextInputProps } from 'react-native';

import { radius, space, type, useTheme } from '@/theme';

export function Input(props: TextInputProps) {
  const { palette } = useTheme();
  return (
    <TextInput
      placeholderTextColor={palette.inkFaint}
      style={[
        type.body,
        {
          color: palette.ink,
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.hair,
          borderRadius: radius.md,
          paddingHorizontal: space.lg,
          paddingVertical: space.md,
        },
      ]}
      {...props}
    />
  );
}
