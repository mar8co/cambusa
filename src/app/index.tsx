import { useMemo } from 'react';
import { SectionList, View } from 'react-native';

import { PantryRow } from '@/components/PantryRow';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { CATEGORY_ORDER, categoryMeta } from '@/domain/categories';
import { expiryStatus } from '@/domain/expiry';
import { useStore } from '@/data/store';
import { radius, space, useTheme } from '@/theme';

export default function DispensaScreen() {
  const { palette } = useTheme();
  const pantry = useStore((s) => s.pantry);
  const bump = useStore((s) => s.bumpPantry);

  const sections = useMemo(() => {
    const byCat = new Map<string, typeof pantry>();
    for (const item of pantry) {
      const arr = byCat.get(item.category) ?? [];
      arr.push(item);
      byCat.set(item.category, arr);
    }
    return CATEGORY_ORDER.filter((c) => byCat.has(c)).map((c) => ({
      title: categoryMeta(c).label,
      icon: categoryMeta(c).icon,
      data: (byCat.get(c) ?? []).sort((a, b) => a.name.localeCompare(b.name, 'it')),
    }));
  }, [pantry]);

  const expiringSoon = useMemo(
    () => pantry.filter((p) => ['soon', 'expired'].includes(expiryStatus(p.expiry))),
    [pantry],
  );

  return (
    <Screen>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingTop: space.sm, paddingBottom: space.md }}>
            <Text variant="display">Dispensa</Text>
            <Text variant="caption" color="inkSoft" style={{ marginTop: 2 }}>
              {pantry.length} prodotti · {expiringSoon.length} in scadenza
            </Text>

            {expiringSoon.length > 0 ? (
              <Card style={{ marginTop: space.lg }} padded>
                <Text variant="micro" color="warn" style={{ textTransform: 'uppercase' }}>
                  In scadenza
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm }}>
                  {expiringSoon.map((p) => (
                    <View
                      key={p.id}
                      style={{
                        paddingHorizontal: space.md,
                        paddingVertical: 6,
                        borderRadius: radius.pill,
                        backgroundColor: palette.surfaceAlt,
                      }}>
                      <Text variant="caption" color="ink">
                        {p.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}
          </View>
        }
        renderSectionHeader={({ section }) => {
          const Icon = section.icon;
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.sm,
                backgroundColor: palette.bg,
                paddingTop: space.lg,
                paddingBottom: space.xs,
              }}>
              <Icon size={16} color={palette.inkSoft} strokeWidth={2.2} />
              <Text variant="micro" color="inkSoft" style={{ textTransform: 'uppercase' }}>
                {section.title}
              </Text>
            </View>
          );
        }}
        renderItem={({ item, index, section }) => (
          <View
            style={{
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: palette.hair,
            }}>
            <PantryRow item={item} onInc={() => bump(item.id, 1)} onDec={() => bump(item.id, -1)} />
          </View>
        )}
        stickySectionHeadersEnabled
      />
    </Screen>
  );
}
