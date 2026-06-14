import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
  fetchPantry,
  fetchRecipes,
  fetchShopping,
  getMyHouseholdId,
  insertPantry,
  insertShopping,
  seedRemoteIfEmpty,
  setRecipeFavorite,
  softDeletePantry,
  softDeleteShopping,
  updatePantryRow,
  updateShoppingRow,
} from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import { adjustBase } from '@/domain/units';
import type { PantryItem, Recipe, ShoppingItem } from '@/domain/types';

import { SEED_PANTRY, SEED_RECIPES, SEED_SHOPPING } from './seed';

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const warn = (e: unknown) => console.warn('[store] sync error', e);

/** In modalità locale (no Supabase) partiamo dai dati seed; con backend partiamo vuoti e idratiamo. */
const localStart = !isSupabaseConfigured;

type State = {
  pantry: PantryItem[];
  shopping: ShoppingItem[];
  recipes: Recipe[];
  householdId: string | null;
  remoteReady: boolean;

  /** Carica household + righe da Supabase (chiamato dopo il login). */
  hydrate: () => Promise<void>;

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
    (set, get) => ({
      pantry: localStart ? SEED_PANTRY : [],
      shopping: localStart ? SEED_SHOPPING : [],
      recipes: localStart ? SEED_RECIPES : [],
      householdId: null,
      remoteReady: localStart,

      hydrate: async () => {
        if (!isSupabaseConfigured) return;
        try {
          const hid = await getMyHouseholdId();
          if (!hid) return;
          await seedRemoteIfEmpty(hid, {
            pantry: SEED_PANTRY.map(({ id, updatedAt, ...rest }) => rest),
            shopping: SEED_SHOPPING.map(({ id, updatedAt, checked, ...rest }) => rest),
            recipes: SEED_RECIPES.map(({ id, ...rest }) => rest),
          });
          const [pantry, shopping, recipes] = await Promise.all([
            fetchPantry(hid),
            fetchShopping(hid),
            fetchRecipes(hid),
          ]);
          set({ householdId: hid, pantry, shopping, recipes, remoteReady: true });
        } catch (e) {
          warn(e);
        }
      },

      addPantry: (item) => {
        const hid = get().householdId;
        if (isSupabaseConfigured && hid) {
          insertPantry(hid, item)
            .then((row) => row && set((s) => ({ pantry: [row, ...s.pantry] })))
            .catch(warn);
        } else {
          set((s) => ({ pantry: [{ ...item, id: uid(), updatedAt: Date.now() }, ...s.pantry] }));
        }
      },

      updatePantry: (id, patch) => {
        set((s) => ({
          pantry: s.pantry.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
          ),
        }));
        if (isSupabaseConfigured) updatePantryRow(id, patch).catch(warn);
      },

      removePantry: (id) => {
        set((s) => ({ pantry: s.pantry.filter((p) => p.id !== id) }));
        if (isSupabaseConfigured) softDeletePantry(id).catch(warn);
      },

      bumpPantry: (id, dir) => {
        set((s) => ({
          pantry: s.pantry.map((p) =>
            p.id === id
              ? { ...p, quantityBase: adjustBase(p.quantityBase, p.displayUnit, dir), updatedAt: Date.now() }
              : p,
          ),
        }));
        if (isSupabaseConfigured) {
          const updated = get().pantry.find((p) => p.id === id);
          if (updated) updatePantryRow(id, { quantityBase: updated.quantityBase }).catch(warn);
        }
      },

      addShopping: (item) => {
        const hid = get().householdId;
        if (isSupabaseConfigured && hid) {
          insertShopping(hid, item)
            .then((row) => row && set((s) => ({ shopping: [row, ...s.shopping] })))
            .catch(warn);
        } else {
          set((s) => ({
            shopping: [{ ...item, id: uid(), checked: false, updatedAt: Date.now() }, ...s.shopping],
          }));
        }
      },

      toggleShopping: (id) => {
        set((s) => ({
          shopping: s.shopping.map((it) =>
            it.id === id ? { ...it, checked: !it.checked, updatedAt: Date.now() } : it,
          ),
        }));
        if (isSupabaseConfigured) {
          const it = get().shopping.find((x) => x.id === id);
          if (it) updateShoppingRow(id, { checked: it.checked }).catch(warn);
        }
      },

      removeShopping: (id) => {
        set((s) => ({ shopping: s.shopping.filter((it) => it.id !== id) }));
        if (isSupabaseConfigured) softDeleteShopping(id).catch(warn);
      },

      toggleFavorite: (id) => {
        set((s) => ({
          recipes: s.recipes.map((r) => (r.id === id ? { ...r, favorite: !r.favorite } : r)),
        }));
        if (isSupabaseConfigured) {
          const r = get().recipes.find((x) => x.id === id);
          if (r) setRecipeFavorite(id, r.favorite).catch(warn);
        }
      },
    }),
    {
      name: 'cambusa-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        pantry: s.pantry,
        shopping: s.shopping,
        recipes: s.recipes,
        householdId: s.householdId,
      }),
    },
  ),
);
