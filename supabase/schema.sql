-- ============================================================
-- Cambusa — schema iniziale (normalizzato, multi-household, RLS)
-- Eseguire nel SQL Editor di Supabase sul progetto NUOVO.
-- Idempotente quanto basta per un primo setup pulito.
-- ============================================================

-- Estensioni -------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";     -- match fuzzy nomi
create extension if not exists "vector";      -- dedup semantico (pgvector)

-- ============================================================
-- Households (dispensa condivisa)
-- ============================================================
create table if not exists households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null default 'Casa',
  created_at  timestamptz not null default now()
);

create table if not exists household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'owner' check (role in ('owner','member')),
  created_at   timestamptz not null default now(),
  primary key (household_id, user_id)
);

-- Helper: household_id dell'utente corrente (usato dalle policy)
create or replace function my_household_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from household_members where user_id = auth.uid()
$$;

-- ============================================================
-- Catalogo prodotti canonico (condiviso, per dedup/aggregazione)
-- ============================================================
create table if not exists products_catalog (
  id               uuid primary key default gen_random_uuid(),
  canonical_name   text not null,
  brand            text,
  barcode          text unique,
  default_category text,
  base_unit        text not null check (base_unit in ('g','ml','count')),
  embedding        vector(768),
  created_at       timestamptz not null default now()
);
create index if not exists products_catalog_name_trgm
  on products_catalog using gin (canonical_name gin_trgm_ops);

-- ============================================================
-- Dispensa
-- ============================================================
create table if not exists pantry_items (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  product_id    uuid references products_catalog(id),
  name          text not null,
  category      text not null,
  quantity_base numeric not null default 0,
  base_unit     text not null check (base_unit in ('g','ml','count')),
  display_unit  text not null,
  expiry        date,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz                       -- soft delete (sync)
);
create index if not exists pantry_household on pantry_items(household_id);

-- ============================================================
-- Lista spesa
-- ============================================================
create table if not exists shopping_items (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references households(id) on delete cascade,
  product_id    uuid references products_catalog(id),
  name          text not null,
  category      text not null,
  quantity_base numeric not null default 1,
  base_unit     text not null check (base_unit in ('g','ml','count')),
  display_unit  text not null,
  checked       boolean not null default false,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index if not exists shopping_household on shopping_items(household_id);

-- ============================================================
-- Scontrini (pipeline OCR async)
-- ============================================================
create table if not exists receipts (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  image_path   text,
  status       text not null default 'pending' check (status in ('pending','processing','ready','error')),
  total        numeric,
  scanned_at   timestamptz not null default now()
);
create index if not exists receipts_household on receipts(household_id);

create table if not exists receipt_lines (
  id            uuid primary key default gen_random_uuid(),
  receipt_id    uuid not null references receipts(id) on delete cascade,
  product_id    uuid references products_catalog(id),
  raw_text      text,
  name          text,
  quantity_base numeric,
  base_unit     text check (base_unit in ('g','ml','count')),
  price         numeric,
  confidence    numeric        -- 0..1, sotto soglia = revisione obbligatoria
);

-- ============================================================
-- Ricette (salvate / preferiti / storico)
-- ============================================================
create table if not exists recipes (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid references households(id) on delete cascade,
  title        text not null,
  servings     int not null default 2,
  ingredients  jsonb not null default '[]'::jsonb,
  steps        jsonb not null default '[]'::jsonb,
  favorite     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists recipes_household on recipes(household_id);

create table if not exists cook_log (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  recipe_id    uuid references recipes(id) on delete set null,
  title        text,
  servings     int,
  cooked_at    timestamptz not null default now()
);

-- ============================================================
-- Impostazioni utente
-- ============================================================
create table if not exists user_settings (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Trigger: al signup crea household personale + membership + settings
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
begin
  insert into households (name) values ('Casa') returning id into hid;
  insert into household_members (household_id, user_id, role) values (hid, new.id, 'owner');
  insert into user_settings (user_id) values (new.id) on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table households        enable row level security;
alter table household_members enable row level security;
alter table pantry_items      enable row level security;
alter table shopping_items    enable row level security;
alter table receipts          enable row level security;
alter table receipt_lines     enable row level security;
alter table recipes           enable row level security;
alter table cook_log          enable row level security;
alter table user_settings     enable row level security;
alter table products_catalog  enable row level security;

-- households: membro può leggere/aggiornare le proprie case
create policy households_select on households for select
  using (id in (select my_household_ids()));
create policy households_update on households for update
  using (id in (select my_household_ids()));

-- membership: vedo le membership delle mie case
create policy members_select on household_members for select
  using (household_id in (select my_household_ids()));

-- macro per tabelle "di household": accesso pieno se household_id è mio
create policy pantry_all on pantry_items for all
  using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));
create policy shopping_all on shopping_items for all
  using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));
create policy receipts_all on receipts for all
  using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));
create policy recipes_all on recipes for all
  using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));
create policy cooklog_all on cook_log for all
  using (household_id in (select my_household_ids()))
  with check (household_id in (select my_household_ids()));

-- receipt_lines: tramite lo scontrino padre
create policy receipt_lines_all on receipt_lines for all
  using (receipt_id in (select id from receipts where household_id in (select my_household_ids())))
  with check (receipt_id in (select id from receipts where household_id in (select my_household_ids())));

-- settings: solo le proprie
create policy settings_all on user_settings for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- catalogo: lettura per tutti gli autenticati, scrittura via service role (proxy AI)
create policy catalog_read on products_catalog for select
  using (auth.role() = 'authenticated');
