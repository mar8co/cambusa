/**
 * Design system "Editoriale" — token unici per tutta l'app.
 * Palette light/dark, spaziature, raggi, tipografia.
 * Unico source of truth: niente colori hardcoded nei componenti.
 */

export type Palette = {
  /** sfondo pagina */
  bg: string;
  /** superficie elevata (card, sheet) */
  surface: string;
  /** superficie premuta/selezionata */
  surfaceAlt: string;
  /** testo primario */
  ink: string;
  /** testo secondario / didascalie */
  inkSoft: string;
  /** testo molto tenue / placeholder */
  inkFaint: string;
  /** linee sottili */
  hair: string;
  /** accento (pomodoro) */
  accent: string;
  /** accento scuro (pressed / testo su chiaro) */
  accentStrong: string;
  /** accento tenue di sfondo (pill attiva) */
  accentWash: string;
  /** testo/icona su accento pieno */
  onAccent: string;
  /** verde ok (in scadenza lontana) */
  good: string;
  /** ambra (in scadenza) */
  warn: string;
  /** rosso (scaduto) */
  danger: string;
};

const tomato = '#D6442F';
const tomato700 = '#B8351F';

export const light: Palette = {
  bg: '#F7F6F1',
  surface: '#FFFFFF',
  surfaceAlt: '#EFEDE6',
  ink: '#1A1A1A',
  inkSoft: '#6B6B66',
  inkFaint: '#A8A79F',
  hair: '#E3E1D9',
  accent: tomato,
  accentStrong: tomato700,
  accentWash: 'rgba(214,68,47,0.10)',
  onAccent: '#FFFFFF',
  good: '#3F8F5B',
  warn: '#C9852A',
  danger: tomato700,
};

export const dark: Palette = {
  bg: '#121211',
  surface: '#1C1B19',
  surfaceAlt: '#26241F',
  ink: '#F2F1EC',
  inkSoft: '#A8A69C',
  inkFaint: '#6E6C63',
  hair: '#2E2C27',
  accent: '#E85A44',
  accentStrong: '#F07358',
  accentWash: 'rgba(232,90,68,0.16)',
  onAccent: '#1A1A1A',
  good: '#5BB57A',
  warn: '#E0A24A',
  danger: '#E85A44',
};

export const palettes = { light, dark } as const;
export type SchemeName = keyof typeof palettes;

/** Spaziature (multipli di 4). */
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

/** Raggi. */
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/** Scala tipografica. weight come stringa per RN. */
export const type = {
  display: { fontSize: 32, lineHeight: 36, fontWeight: '800' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, lineHeight: 27, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 17, lineHeight: 22, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 17, fontWeight: '400' as const },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.4 },
} as const;

export type TypeVariant = keyof typeof type;
