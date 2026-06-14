import { Heart } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useStore } from '@/data/store';
import { space, useTheme } from '@/theme';

export default function RicetteScreen() {
  const { palette } = useTheme();
  const recipes = useStore((s) => s.recipes);
  const toggleFav = useStore((s) => s.toggleFavorite);

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: space.sm, paddingBottom: space.md }}>
          <Text variant="display">Ricette</Text>
          <Text variant="caption" color="inkSoft" style={{ marginTop: 2 }}>
            Proposte con ciò che hai in dispensa
          </Text>
        </View>

        {recipes.map((r) => (
          <Card key={r.id} style={{ marginTop: space.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
              <View style={{ flex: 1 }}>
                <Text variant="title">{r.title}</Text>
                <Text variant="caption" color="inkSoft" style={{ marginTop: 2 }}>
                  {r.servings} porzioni · {r.ingredients.length} ingredienti
                </Text>
              </View>
              <Pressable onPress={() => toggleFav(r.id)} hitSlop={8}>
                <Heart
                  size={22}
                  color={r.favorite ? palette.accent : palette.inkFaint}
                  fill={r.favorite ? palette.accent : 'transparent'}
                  strokeWidth={2.2}
                />
              </Pressable>
            </View>

            <View style={{ marginTop: space.md, gap: space.xs }}>
              {r.steps.map((s, i) => (
                <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
                  <Text variant="label" color="accentStrong">
                    {i + 1}
                  </Text>
                  <Text variant="body" color="inkSoft" style={{ flex: 1 }}>
                    {s.text}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        ))}
      </ScrollView>
    </Screen>
  );
}
