/**
 * Query Supabase per il dominio. Mappa righe DB (snake_case) ⇄ tipi dominio.
 * Tutte le scritture sono scopate per household via RLS (lato server).
 */
import type { PantryItem, Recipe, ShoppingItem } from '@/domain/types';

import { supabase } from './supabase';

// ---- Mapper ------------------------------------------------

function rowToPantry(r: any): PantryItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    quantityBase: Number(r.quantity_base),
    baseUnit: r.base_unit,
    displayUnit: r.display_unit,
    expiry: r.expiry,
    updatedAt: Date.parse(r.updated_at),
  };
}

function rowToShopping(r: any): ShoppingItem {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    quantityBase: Number(r.quantity_base),
    baseUnit: r.base_unit,
    displayUnit: r.display_unit,
    checked: r.checked,
    updatedAt: Date.parse(r.updated_at),
  };
}

function rowToRecipe(r: any): Recipe {
  return {
    id: r.id,
    title: r.title,
    servings: r.servings,
    ingredients: r.ingredients ?? [],
    steps: r.steps ?? [],
    favorite: r.favorite,
  };
}

// ---- Household ---------------------------------------------

/** household_id dell'utente corrente (creato dal trigger al signup). */
export async function getMyHouseholdId(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('household_members').select('household_id').limit(1);
  if (error || !data?.length) return null;
  return data[0].household_id as string;
}

// ---- Fetch (solo righe non eliminate) ---------------------

export async function fetchPantry(hid: string): Promise<PantryItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('household_id', hid)
    .is('deleted_at', null);
  if (error) throw error;
  return (data ?? []).map(rowToPantry);
}

export async function fetchShopping(hid: string): Promise<ShoppingItem[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('household_id', hid)
    .is('deleted_at', null);
  if (error) throw error;
  return (data ?? []).map(rowToShopping);
}

export async function fetchRecipes(hid: string): Promise<Recipe[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('household_id', hid)
    .is('deleted_at', null);
  if (error) throw error;
  return (data ?? []).map(rowToRecipe);
}

// ---- Mutazioni dispensa -----------------------------------

export async function insertPantry(
  hid: string,
  item: Omit<PantryItem, 'id' | 'updatedAt'>,
): Promise<PantryItem | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('pantry_items')
    .insert({
      household_id: hid,
      name: item.name,
      category: item.category,
      quantity_base: item.quantityBase,
      base_unit: item.baseUnit,
      display_unit: item.displayUnit,
      expiry: item.expiry,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPantry(data);
}

export async function updatePantryRow(id: string, patch: Partial<PantryItem>): Promise<void> {
  if (!supabase) return;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.quantityBase !== undefined) row.quantity_base = patch.quantityBase;
  if (patch.baseUnit !== undefined) row.base_unit = patch.baseUnit;
  if (patch.displayUnit !== undefined) row.display_unit = patch.displayUnit;
  if (patch.expiry !== undefined) row.expiry = patch.expiry;
  const { error } = await supabase.from('pantry_items').update(row).eq('id', id);
  if (error) throw error;
}

export async function softDeletePantry(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('pantry_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ---- Mutazioni spesa --------------------------------------

export async function insertShopping(
  hid: string,
  item: Omit<ShoppingItem, 'id' | 'updatedAt' | 'checked'>,
): Promise<ShoppingItem | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('shopping_items')
    .insert({
      household_id: hid,
      name: item.name,
      category: item.category,
      quantity_base: item.quantityBase,
      base_unit: item.baseUnit,
      display_unit: item.displayUnit,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToShopping(data);
}

export async function updateShoppingRow(id: string, patch: Partial<ShoppingItem>): Promise<void> {
  if (!supabase) return;
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.checked !== undefined) row.checked = patch.checked;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.quantityBase !== undefined) row.quantity_base = patch.quantityBase;
  const { error } = await supabase.from('shopping_items').update(row).eq('id', id);
  if (error) throw error;
}

export async function softDeleteShopping(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('shopping_items')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ---- Ricette ----------------------------------------------

export async function setRecipeFavorite(id: string, favorite: boolean): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('recipes')
    .update({ favorite, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

// ---- Seed iniziale (popola il DB la prima volta) ----------

export async function seedRemoteIfEmpty(
  hid: string,
  seed: { pantry: Omit<PantryItem, 'id' | 'updatedAt'>[]; shopping: Omit<ShoppingItem, 'id' | 'updatedAt' | 'checked'>[]; recipes: Omit<Recipe, 'id'>[] },
): Promise<boolean> {
  if (!supabase) return false;
  const existing = await fetchPantry(hid);
  if (existing.length > 0) return false;

  await supabase.from('pantry_items').insert(
    seed.pantry.map((p) => ({
      household_id: hid,
      name: p.name,
      category: p.category,
      quantity_base: p.quantityBase,
      base_unit: p.baseUnit,
      display_unit: p.displayUnit,
      expiry: p.expiry,
    })),
  );
  await supabase.from('shopping_items').insert(
    seed.shopping.map((s) => ({
      household_id: hid,
      name: s.name,
      category: s.category,
      quantity_base: s.quantityBase,
      base_unit: s.baseUnit,
      display_unit: s.displayUnit,
    })),
  );
  await supabase.from('recipes').insert(
    seed.recipes.map((r) => ({
      household_id: hid,
      title: r.title,
      servings: r.servings,
      ingredients: r.ingredients,
      steps: r.steps,
      favorite: r.favorite,
    })),
  );
  return true;
}
