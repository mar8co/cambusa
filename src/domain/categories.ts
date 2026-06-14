import {
  Apple,
  Beef,
  Cookie,
  CupSoda,
  Croissant,
  Egg,
  Fish,
  Flame,
  Milk,
  Package,
  Salad,
  Snowflake,
  Soup,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';

import type { CategoryId } from './types';

type CatMeta = { id: CategoryId; label: string; icon: LucideIcon };

/** Categorie ordinate per frequenza d'uso (fresco in alto, condimenti in fondo). */
export const CATEGORIES: CatMeta[] = [
  { id: 'frutta_verdura', label: 'Frutta e verdura', icon: Apple },
  { id: 'fresco', label: 'Freschi', icon: Salad },
  { id: 'carne_pesce', label: 'Carne e pesce', icon: Beef },
  { id: 'latticini', label: 'Latticini', icon: Milk },
  { id: 'surgelati', label: 'Surgelati', icon: Snowflake },
  { id: 'pane', label: 'Pane', icon: Croissant },
  { id: 'pasta_riso', label: 'Pasta e riso', icon: Wheat },
  { id: 'scatolame', label: 'Scatolame', icon: Soup },
  { id: 'colazione', label: 'Colazione', icon: Egg },
  { id: 'snack', label: 'Snack', icon: Cookie },
  { id: 'bevande', label: 'Bevande', icon: CupSoda },
  { id: 'condimenti', label: 'Condimenti', icon: Fish },
  { id: 'spezie', label: 'Spezie', icon: Flame },
  { id: 'altro', label: 'Altro', icon: Package },
];

const BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, CatMeta>;

export function categoryMeta(id: CategoryId): CatMeta {
  return BY_ID[id] ?? BY_ID.altro;
}

export const CATEGORY_ORDER: CategoryId[] = CATEGORIES.map((c) => c.id);
