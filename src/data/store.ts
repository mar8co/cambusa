import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { adjustBase } from '@/domain/units';
import type { PantryItem, Recipe, ShoppingItem } from '@/domain/types';

import { SEED_PANTRY, SEED_RECIPES, SEED_SHOPPING } from './seed';

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

type State = {
  pantry: PantryItem[];
  shopping: ShoppingItem[];
  recipes: Recipe[];

  addPantry: (item: Omit<PantryItem, 'id' | 'updatedAt'>) => void;
  updatePantry: (id: string, patch: Partial<PantryItem>) => void;
  removePantry: (id: string) => void;
  bumpPantry: (id: string, dir: 1 | -1) => void;

  addShopping: (item: Omit<ShoppingItem, 'id' | 'updatedAt' | 'checked'>) => void;
  toggleShopping: (id: string) => void;
  removeShopping: (id: string) => void;

  toggleFavorite: (id: string) => void;
};

export const useStore = create<State>()(
  persist(
    (set) => ({
      pantry: SEED_PANTRY,
      shopping: SEED_SHOPPING,
      recipes: SEED_RECIPES,

      addPantry: (item) =>
        set((s) => ({
          pantry: [{ ...item, id: uid(), updatedAt: Date.now() }, ...s.pantry],
        })),

      updatePantry: (id, patch) =>
        set((s) => ({
          pantry: s.pantry.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
          ),
        })),

      removePantry: (id) => set((s) => ({ pantry: s.pantry.filter((p) => p.id !== id) })),

      bumpPantry: (id, dir) =>
        set((s) => ({
          pantry: s.pantry.map((p) =>
            p.id === id
              ? { ...p, quantityBase: adjustBase(p.quantityBase, p.displayUnit, dir), updatedAt: Date.now() }
              : p,
          ),
        })),

      addShopping: (item) =>
        set((s) => ({
          shopping: [{ ...item, id: uid(), checked: false, updatedAt: Date.now() }, ...s.shopping],
        })),

      toggleShopping: (id) =>
        set((s) => ({
          shopping: s.shopping.map((it) =>
            it.id === id ? { ...it, checked: !it.checked, updatedAt: Date.now() } : it,
          ),
        })),

      removeShopping: (id) => set((s) => ({ shopping: s.shopping.filter((it) => it.id !== id) })),

      toggleFavorite: (id) =>
        set((s) => ({
          recipes: s.recipes.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)),
        })),
    }),
    {
      name: 'cambusa-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
