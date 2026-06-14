import type { PantryItem, Recipe, ShoppingItem } from '@/domain/types';

const now = Date.now();
const inDays = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString().slice(0, 10);
};

export const SEED_PANTRY: PantryItem[] = [
  { id: 'p1', name: 'Pomodori pelati', category: 'scatolame', quantityBase: 800, baseUnit: 'g', displayUnit: 'g', expiry: inDays(120), updatedAt: now },
  { id: 'p2', name: 'Spaghetti', category: 'pasta_riso', quantityBase: 1000, baseUnit: 'g', displayUnit: 'kg', expiry: inDays(300), updatedAt: now },
  { id: 'p3', name: 'Uova', category: 'altro', quantityBase: 6, baseUnit: 'count', displayUnit: 'pz', expiry: inDays(12), updatedAt: now },
  { id: 'p4', name: 'Latte', category: 'latticini', quantityBase: 1000, baseUnit: 'ml', displayUnit: 'l', expiry: inDays(3), updatedAt: now },
  { id: 'p5', name: 'Parmigiano', category: 'latticini', quantityBase: 200, baseUnit: 'g', displayUnit: 'g', expiry: inDays(40), updatedAt: now },
  { id: 'p6', name: 'Mele', category: 'frutta_verdura', quantityBase: 5, baseUnit: 'count', displayUnit: 'pz', expiry: inDays(8), updatedAt: now },
  { id: 'p7', name: 'Zucchine', category: 'frutta_verdura', quantityBase: 4, baseUnit: 'count', displayUnit: 'pz', expiry: inDays(2), updatedAt: now },
  { id: 'p8', name: 'Olio extravergine', category: 'condimenti', quantityBase: 1000, baseUnit: 'ml', displayUnit: 'l', expiry: inDays(400), updatedAt: now },
  { id: 'p9', name: 'Petto di pollo', category: 'carne_pesce', quantityBase: 500, baseUnit: 'g', displayUnit: 'g', expiry: inDays(1), updatedAt: now },
  { id: 'p10', name: 'Pane in cassetta', category: 'pane', quantityBase: 1, baseUnit: 'count', displayUnit: 'pz', expiry: inDays(5), updatedAt: now },
];

export const SEED_SHOPPING: ShoppingItem[] = [
  { id: 's1', name: 'Basilico', category: 'frutta_verdura', quantityBase: 1, baseUnit: 'count', displayUnit: 'pz', checked: false, updatedAt: now },
  { id: 's2', name: 'Mozzarella', category: 'latticini', quantityBase: 250, baseUnit: 'g', displayUnit: 'g', checked: false, updatedAt: now },
  { id: 's3', name: 'Acqua frizzante', category: 'bevande', quantityBase: 6000, baseUnit: 'ml', displayUnit: 'l', checked: true, updatedAt: now },
];

export const SEED_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Pasta al pomodoro',
    servings: 2,
    ingredients: [
      { name: 'Spaghetti', quantityBase: 160, baseUnit: 'g' },
      { name: 'Pomodori pelati', quantityBase: 400, baseUnit: 'g' },
      { name: 'Olio extravergine', quantityBase: 20, baseUnit: 'ml' },
    ],
    steps: [
      { text: 'Porta a bollore l’acqua salata e cuoci gli spaghetti.', timerSeconds: 540 },
      { text: 'Scalda l’olio, aggiungi i pelati e cuoci.', timerSeconds: 600 },
      { text: 'Manteca la pasta nel sugo e servi.' },
    ],
    favorite: true,
  },
];
