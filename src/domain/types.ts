/**
 * Modello dati di dominio (alto livello).
 * Regola d'oro: le quantità si memorizzano SEMPRE in base-unit
 * ('g' | 'ml' | 'count') + un'unità di visualizzazione preferita.
 */

export type BaseUnit = 'g' | 'ml' | 'count';

/** Unità mostrate in UI; ognuna mappa a una base-unit con un fattore. */
export type DisplayUnit = 'pz' | 'g' | 'kg' | 'ml' | 'l';

export type CategoryId =
  | 'fresco'
  | 'frutta_verdura'
  | 'carne_pesce'
  | 'latticini'
  | 'surgelati'
  | 'pane'
  | 'pasta_riso'
  | 'scatolame'
  | 'colazione'
  | 'snack'
  | 'bevande'
  | 'condimenti'
  | 'spezie'
  | 'altro';

/** Voce in dispensa. */
export type PantryItem = {
  id: string;
  name: string;
  category: CategoryId;
  /** quantità nella base-unit della voce */
  quantityBase: number;
  baseUnit: BaseUnit;
  /** unità preferita per la visualizzazione */
  displayUnit: DisplayUnit;
  /** ISO date (yyyy-mm-dd) o null */
  expiry: string | null;
  updatedAt: number;
};

/** Voce in lista spesa. */
export type ShoppingItem = {
  id: string;
  name: string;
  category: CategoryId;
  quantityBase: number;
  baseUnit: BaseUnit;
  displayUnit: DisplayUnit;
  checked: boolean;
  updatedAt: number;
};

export type Recipe = {
  id: string;
  title: string;
  servings: number;
  ingredients: { name: string; quantityBase: number; baseUnit: BaseUnit }[];
  steps: { text: string; timerSeconds?: number }[];
  favorite: boolean;
};
