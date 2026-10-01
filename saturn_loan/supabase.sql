-- ============================================================
-- SATURN LOAN - BASE DE DATOS SUPABASE
-- Pega TODO este archivo en Supabase > SQL Editor > New query
-- y ejecútalo.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. Perfiles y roles
-- ------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'friend' check (role in ('friend', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon;
grant select on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'friend')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------
-- 2. Juegos
-- ------------------------------------------------------------

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  platform text not null,
  code text not null unique,
  condition text not null default 'Bueno',
  notes text default '',
  cover_a text default '#7c3aed',
  cover_b text default '#06b6d4',
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;

revoke all on table public.games from anon, authenticated;
grant select on table public.games to anon, authenticated;
grant insert, update, delete on table public.games to authenticated;

drop policy if exists "Anyone can view games" on public.games;
create policy "Anyone can view games"
on public.games
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert games" on public.games;
create policy "Admins can insert games"
on public.games
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update games" on public.games;
create policy "Admins can update games"
on public.games
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete games" on public.games;
create policy "Admins can delete games"
on public.games
for delete
to authenticated
using ((select public.is_admin()));

-- ------------------------------------------------------------
-- 3. Préstamos
-- ------------------------------------------------------------

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  person text not null,
  game_id uuid not null references public.games(id) on delete restrict,
  start_date date not null,
  duration_days integer not null check (duration_days in (7, 14, 30)),
  due_date date not null,
  price numeric(10,2) not null default 0,
  returned_at date,
  created_at timestamptz not null default now()
);

alter table public.loans enable row level security;

revoke all on table public.loans from anon, authenticated;
grant select, insert, update, delete on table public.loans to authenticated;

drop policy if exists "Admins can view loans" on public.loans;
create policy "Admins can view loans"
on public.loans
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "Admins can insert loans" on public.loans;
create policy "Admins can insert loans"
on public.loans
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update loans" on public.loans;
create policy "Admins can update loans"
on public.loans
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete loans" on public.loans;
create policy "Admins can delete loans"
on public.loans
for delete
to authenticated
using ((select public.is_admin()));

-- ------------------------------------------------------------
-- 4. Datos iniciales
-- ------------------------------------------------------------

insert into public.games (title, platform, code, condition, notes, cover_a, cover_b)
values
  ('Mario Kart 8 Deluxe', 'Nintendo Switch', 'SL-001', 'Bueno', 'Cartucho + caja.', '#f97316', '#ef4444'),
  ('Pokémon Rubí', 'Game Boy Advance', 'SL-002', 'Aceptable', 'Cartucho original. Sin caja.', '#ef4444', '#be123c'),
  ('The Legend of Zelda: Breath of the Wild', 'Nintendo Switch', 'SL-003', 'Perfecto', 'Cartucho + caja.', '#10b981', '#0ea5e9'),
  ('Minecraft', 'Nintendo Switch', 'SL-004', 'Bueno', 'Edición física.', '#84cc16', '#15803d'),
  ('Animal Crossing: New Horizons', 'Nintendo Switch', 'SL-005', 'Perfecto', 'Cartucho + caja.', '#22c55e', '#06b6d4'),
  ('Mario & Luigi RPG', 'Nintendo DS', 'SL-006', 'Bueno', 'Cartucho original.', '#3b82f6', '#7c3aed')
on conflict (code) do nothing;

-- ------------------------------------------------------------
-- 5. Realtime para refrescar los cambios entre navegadores
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'games'
  ) then
    alter publication supabase_realtime add table public.games;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'loans'
  ) then
    alter publication supabase_realtime add table public.loans;
  end if;
end
$$;

-- ============================================================
-- DESPUÉS:
-- 1) Crea tu usuario desde Supabase > Authentication > Users.
-- 2) Sustituye TU-USER-ID por su UUID y ejecuta:
--
-- update public.profiles
-- set role = 'admin'
-- where id = 'TU-USER-ID';
--
-- Así solo esa cuenta será administradora.
-- ============================================================
