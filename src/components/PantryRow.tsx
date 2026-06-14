import { View } from 'react-native';

import { expiryColor, expiryLabel, expiryStatus } from '@/domain/expiry';
import type { PantryItem } from '@/domain/types';
import { formatQty } from '@/domain/units';
import { space, useTheme } from '@/theme';

import { Stepper } from './ui/Stepper';
import { Text } from './ui/Text';

type Props = {
  item: PantryItem;
  onInc: () => void;
  onDec: () => void;
};

export function PantryRow({ item, onInc, onDec }: Props) {
  const { palette } = useTheme();
  const status = expiryStatus(item.expiry);
  const finished = item.quantityBase <= 0;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
      }}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong" color={finished ? 'inkFaint' : 'ink'}>
          {item.name}
        </Text>
        {item.expiry ? (
          <Text variant="caption" style={{ color: expiryColor(status, palette), marginTop: 2 }}>
            {expiryLabel(item.expiry)}
          </Text>
        ) : null}
      </View>
      <Stepper value={formatQty(item.quantityBase, item.displayUnit)} onInc={onInc} onDec={onDec} />
    </View>
  );
}
