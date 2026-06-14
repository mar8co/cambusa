import { Check } from 'lucide-react-native';
import { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { CATEGORY_ORDER, categoryMeta } from '@/domain/categories';
import { formatQty } from '@/domain/units';
import { useStore } from '@/data/store';
import { radius, space, useTheme } from '@/theme';

export default function SpesaScreen() {
  const { palette } = useTheme();
  const shopping = useStore((s) => s.shopping);
  const toggle = useStore((s) => s.toggleShopping);

  const grouped = useMemo(() => {
    const byCat = new Map<string, typeof shopping>();
    for (const it of shopping) {
      const arr = byCat.get(it.category) ?? [];
      arr.push(it);
      byCat.set(it.category, arr);
    }
    return CATEGORY_ORDER.filter((c) => byCat.has(c)).map((c) => ({
      label: categoryMeta(c).label,
      items: byCat.get(c) ?? [],
    }));
  }, [shopping]);

  const todo = shopping.filter((s) => !s.checked).length;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: space.sm, paddingBottom: space.md }}>
          <Text variant="display">Spesa</Text>
          <Text variant="caption" color="inkSoft" style={{ marginTop: 2 }}>
            {todo} da comprare · {shopping.length - todo} nel carrello
          </Text>
        </View>

        {grouped.map((group) => (
          <View key={group.label} style={{ marginTop: space.lg }}>
            <Text variant="micro" color="inkSoft" style={{ textTransform: 'uppercase', marginBottom: space.xs }}>
              {group.label}
            </Text>
            {group.items.map((it, idx) => (
              <Pressable
                key={it.id}
                onPress={() => toggle(it.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  paddingVertical: space.md,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderTopColor: palette.hair,
                }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: radius.sm,
                    borderWidth: 2,
                    borderColor: it.checked ? palette.accent : palette.hair,
                    backgroundColor: it.checked ? palette.accent : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {it.checked ? <Check size={15} color={palette.onAccent} strokeWidth={3} /> : null}
                </View>
                <Text
                  variant="bodyStrong"
                  color={it.checked ? 'inkFaint' : 'ink'}
                  style={{ flex: 1, textDecorationLine: it.checked ? 'line-through' : 'none' }}>
                  {it.name}
                </Text>
                <Text variant="caption" color="inkSoft">
                  {formatQty(it.quantityBase, it.displayUnit)}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
