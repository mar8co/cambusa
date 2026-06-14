# HANDOFF — "Cambusa" (app dispensa + spesa + ricette, nativa iOS)

> Competitor evoluto di "La Mia Dispensa". App **nativa** (Expo/React Native) con obiettivo **App Store**.
> Rispondere SEMPRE in italiano. Unità metriche (g/kg/ml/l) — mai cups/oz.

---

## 1. Visione
Stesso ciclo di "La Mia Dispensa" (spesa → dispensa → ricette AI → cucina → lista) ma **migliore su tutto**:
nativa (notifiche/timer reali, camera, background), local-first, data model normalizzato, dedup AI semantico.
Pubblicazione su **Apple App Store**.

## 2. Decisioni già prese (con l'utente)
- **Build iOS**: sviluppo/test con **Expo Go** (gratis, QR) → Apple Developer Program (99$/anno) + **EAS Build** solo alla pubblicazione. L'utente è su **Windows** (niente Mac necessario grazie a EAS).
- **Backend**: **nuovo** progetto Supabase (schema normalizzato), non riuso del vecchio.
- **Sync**: **a fasi** — ora online + cache locale scrivibile (offline-ready), **PowerSync** (local-first pieno) come fase successiva.
- **Styling**: design system **in-house** (token + primitivi su StyleSheet), NON Nativewind — scelta di affidabilità (no build native dirette, solo Expo Go + preview web).

## 3. Stack
- **Expo SDK 56** + React Native 0.85 + React 19.2 + **Expo Router** (file-based, `src/app`) + Reanimated 4 + Gesture Handler.
- **Stato**: Zustand + persist (AsyncStorage). È l'astrazione dati: verrà sostituita/affiancata da Supabase + PowerSync.
- **Icone**: `lucide-react-native` (+ `react-native-svg`).
- **TypeScript** strict ovunque.
- Dir locale: `C:\Users\pasqu\Downloads\cambusa`. Repo GitHub **pubblico**: https://github.com/mar8co/cambusa (branch `main`).

## 4. Struttura attuale
```
src/
  app/
    _layout.tsx        # root: providers (GestureHandler, SafeArea, StatusBar) + Tabs con tabBar custom
    index.tsx          # scheda DISPENSA (SectionList per reparto, card scadenze, steppers)
    spesa.tsx          # scheda SPESA (raggruppata per reparto, check carrello)
    ricette.tsx        # scheda RICETTE (card ricetta, step numerati, preferito)
  components/
    TabBar.tsx         # tab bar flottante a pillola (firma estetica)
    PantryRow.tsx      # riga prodotto dispensa (nome + scadenza + stepper)
    ui/                # kit primitivo: Text, Screen, Card, Chip, Button, Stepper
  theme/
    tokens.ts          # palette light/dark + space/radius/type (UNICO source of truth)
    index.ts           # useTheme() (palette da useColorScheme)
  domain/
    types.ts           # PantryItem, ShoppingItem, Recipe, unità, categorie
    units.ts           # PURO: base-unit (g/ml/count) ⇄ display (pz/g/kg/ml/l), passi, format IT
    categories.ts      # 14 categorie ordinate per uso + icone lucide
    expiry.ts          # giorni a scadenza, stato (expired/soon/ok), colori, etichette IT
  data/
    store.ts           # Zustand store + persist (CRUD pantry/shopping/recipes)
    seed.ts            # dati demo (10 prodotti, 3 spesa, 1 ricetta)
.claude/launch.json    # config preview web ("expo-web"); nel repo Matchflix c'è "cambusa-web"
```

## 5. Principi di design (Editoriale)
- Avorio **#F7F6F1** (`bg`), ink **#1A1A1A**, accento **pomodoro #D6442F**. Dark: bg #121211.
- Tutta la palette in `theme/tokens.ts` — niente colori hardcoded nei componenti, un solo set light/dark.
- **Quantità SEMPRE in base-unit** (g/ml/count) + displayUnit per la UI → matematica robusta in `units.ts`.
- Tab bar flottante a pillola; componenti coerenti (chips, stepper rotondo, card con hairline).

## 6. Stato — FATTO
- Scaffold Expo ripulito (rimossa demo template).
- Design system + kit primitivo (Text/Screen/Card/Chip/Button/Stepper/Input), light/dark, verificato in preview web (entrambi i temi, viewport iPhone).
- 3 schede funzionanti con dati seed persistiti localmente: Dispensa (steppers +/- live, scadenze colorate), Spesa (check carrello), Ricette (preferito).
- **Backend/auth scaffolding** (in attesa delle credenziali Supabase):
  - `supabase/schema.sql`: schema normalizzato completo (households, household_members, products_catalog+pgvector+trgm, pantry_items/shopping_items con base-unit + soft delete, receipts/receipt_lines, recipes, cook_log, user_settings), **RLS** per-household via `my_household_ids()`, **trigger signup** che crea household+membership+settings.
  - `src/lib/supabase.ts`: client con persistenza AsyncStorage; `isSupabaseConfigured` → se mancano le env l'app resta **offline-first** con i dati seed.
  - `src/hooks/useAuth.ts` + `src/components/AuthScreen.tsx`: login **email OTP a 6 cifre** (no deep-link, ok in Expo Go); gate in `_layout.tsx` (loading → Auth se configurato e non loggato → app).
  - `.env.example` (committabile) con `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `.env.local` è gitignored e NON presente: crearlo dalle credenziali reali.
- `npx tsc --noEmit` pulito.

### Setup Supabase (da fare dall'utente)
1. supabase.com → New project (regione EU). Annota Project URL e anon key (Settings → API).
2. SQL Editor → incolla ed esegui `supabase/schema.sql`.
3. Authentication → Providers → Email: abilita; per OTP a codice disattiva "Confirm email" link e tieni l'OTP (default invia un codice).
4. In locale: copia `.env.example` → `.env.local`, inserisci URL + anon key.
5. `npm start`, apri in Expo Go: comparirà la schermata di login. Inserisci email → ricevi codice → entra.

## 7. TODO (roadmap)
1. **Auth + Supabase nuovo**: creare progetto, schema normalizzato (households, products_catalog+pgvector, pantry_items con base-unit + soft delete, shopping, receipts/lines, recipes). Wiring client + login (magic-link/Apple).
2. **Proxy AI** (Edge Function Deno) per: OCR scontrino (structured output), suggerimenti ricette, stima quantità. Adapter provider (Gemini ora).
3. **Aggiunta prodotti**: manuale (sheet) + voce + barcode (expo-camera + Open Food Facts) + foto scontrino (pipeline async).
4. **Notifiche locali**: timer (expo-notifications, suonano da bloccato) + scadenze.
5. **Modalità cucina** + timer globali.
6. **Dedup semantico** (pgvector) + catalogo canonico.
7. **PowerSync** (local-first pieno) — fase sync.
8. **Polish**: animazioni Reanimated, sheet, onboarding; icona app; EAS Build + TestFlight → App Store.

## 8. Comandi
- Dev/test su iPhone: `npm start` poi scansiona il QR con **Expo Go**.
- Preview web (verifica visiva): config `cambusa-web` nel launch.json di Matchflix.
- Type-check: `npx tsc --noEmit` (eseguire dentro la dir cambusa).
- Build store (più avanti): EAS Build.

## 9. Note
- Su web compaiono warning `shadow*`/`pointerEvents` di react-native-web: innocui, l'API shadow è corretta per iOS native.
- Repo git inizializzato dallo scaffold; nessun commit fatto (committare su richiesta dell'utente).
