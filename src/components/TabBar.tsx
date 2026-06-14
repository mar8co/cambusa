import { Boxes, ShoppingCart, UtensilsCrossed, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, useTheme } from '@/theme';

import { Text } from './ui/Text';

/** Sottoinsieme dei props passati da expo-router al tabBar custom. */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

const ICONS: Record<string, LucideIcon> = {
  index: Boxes,
  spesa: ShoppingCart,
  ricette: UtensilsCrossed,
};
const LABELS: Record<string, string> = {
  index: 'Dispensa',
  spesa: 'Spesa',
  ricette: 'Ricette',
};

/** Tab bar flottante a pillola, centrata in basso. */
export function TabBar({ state, navigation }: TabBarProps) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + space.sm,
        alignItems: 'center',
        pointerEvents: 'box-none',
      }}>
      <View
        style={{
          flexDirection: 'row',
          gap: space.xs,
          padding: space.xs,
          borderRadius: radius.pill,
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.hair,
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const Icon = ICONS[route.name] ?? Boxes;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.xs,
                paddingVertical: space.sm,
                paddingHorizontal: focused ? space.lg : space.md,
                borderRadius: radius.pill,
                backgroundColor: focused ? palette.accentWash : 'transparent',
              }}>
              <Icon size={20} color={focused ? palette.accentStrong : palette.inkSoft} strokeWidth={2.2} />
              {focused ? (
                <Text variant="label" color="accentStrong">
                  {LABELS[route.name]}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
