import type { Palette } from '@/theme';

export type ExpiryStatus = 'expired' | 'soon' | 'ok' | 'none';

/** Giorni rimanenti alla scadenza (negativo = scaduto). */
export function daysToExpiry(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso + 'T00:00:00');
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function expiryStatus(iso: string | null): ExpiryStatus {
  const d = daysToExpiry(iso);
  if (d === null) return 'none';
  if (d < 0) return 'expired';
  if (d <= 3) return 'soon';
  return 'ok';
}

export function expiryColor(status: ExpiryStatus, palette: Palette): string {
  switch (status) {
    case 'expired':
      return palette.danger;
    case 'soon':
      return palette.warn;
    case 'ok':
      return palette.good;
    default:
      return palette.inkFaint;
  }
}

/** Etichetta breve in italiano. */
export function expiryLabel(iso: string | null): string {
  const d = daysToExpiry(iso);
  if (d === null) return '';
  if (d < 0) return `scaduto da ${Math.abs(d)}g`;
  if (d === 0) return 'scade oggi';
  if (d === 1) return 'scade domani';
  if (d <= 7) return `tra ${d} giorni`;
  return new Date(iso + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
}
