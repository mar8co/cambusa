/**
 * Conversione unità e matematica quantità — modulo PURO e testabile.
 * Tutto ruota attorno alle base-unit ('g' | 'ml' | 'count').
 */
import type { BaseUnit, DisplayUnit } from './types';

/** Fattore di conversione: 1 displayUnit = N base-unit. */
const FACTOR: Record<DisplayUnit, { base: BaseUnit; factor: number }> = {
  pz: { base: 'count', factor: 1 },
  g: { base: 'g', factor: 1 },
  kg: { base: 'g', factor: 1000 },
  ml: { base: 'ml', factor: 1 },
  l: { base: 'ml', factor: 1000 },
};

/** Unità di visualizzazione disponibili per una base-unit. */
export const UNITS_FOR_BASE: Record<BaseUnit, DisplayUnit[]> = {
  count: ['pz'],
  g: ['g', 'kg'],
  ml: ['ml', 'l'],
};

export function baseOfDisplay(unit: DisplayUnit): BaseUnit {
  return FACTOR[unit].base;
}

/** Converte un valore espresso in displayUnit verso la base-unit. */
export function toBase(value: number, unit: DisplayUnit): number {
  return value * FACTOR[unit].factor;
}

/** Converte un valore base-unit verso la displayUnit. */
export function fromBase(valueBase: number, unit: DisplayUnit): number {
  return valueBase / FACTOR[unit].factor;
}

/** Passo del +/- per ogni unità (UX: pz±1, g±50, kg±0,25, ml±50, l±0,25). */
export function step(unit: DisplayUnit): number {
  switch (unit) {
    case 'pz':
      return 1;
    case 'g':
      return 50;
    case 'ml':
      return 50;
    case 'kg':
      return 0.25;
    case 'l':
      return 0.25;
  }
}

/** Incrementa/decrementa una quantità base rispettando il passo dell'unità. */
export function adjustBase(quantityBase: number, unit: DisplayUnit, dir: 1 | -1): number {
  const next = fromBase(quantityBase, unit) + dir * step(unit);
  return Math.max(0, toBase(next, unit));
}

/** Formatta una quantità base nell'unità scelta, in italiano (virgola decimale). */
export function formatQty(quantityBase: number, unit: DisplayUnit): string {
  const v = fromBase(quantityBase, unit);
  const rounded = Math.round(v * 100) / 100;
  const text = Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  return `${text.replace('.', ',')} ${unit}`;
}

/** Sceglie automaticamente l'unità leggibile (kg sopra 1000 g, l sopra 1000 ml). */
export function autoUnit(quantityBase: number, base: BaseUnit): DisplayUnit {
  if (base === 'count') return 'pz';
  if (base === 'g') return quantityBase >= 1000 ? 'kg' : 'g';
  return quantityBase >= 1000 ? 'l' : 'ml';
}
