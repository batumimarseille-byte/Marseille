-- Safe update for an existing Hotel Marseille database.
-- This does not delete stays, companies, rooms, payments, or messages.
-- It only adds the columns/triggers needed for editable room inventory
-- and hotel settings.

create extension if not exists pgcrypto;

create table if not exists public.hotel_settings (
  id uuid primary key default gen_random_uuid(),
  hotel_name text not null default 'Marseille',
  hotel_label text not null default 'Hotel',
  logo_url text not null default '/logo.png',
  default_language text not null default 'en',
  currency_code text not null default 'GEL',
  currency_symbol text not null default '₾',
  timezone text not null default 'Asia/Tbilisi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hotel_settings
add column if not exists hotel_name text not null default 'Marseille';

alter table public.hotel_settings
add column if not exists hotel_label text not null default 'Hotel';

alter table public.hotel_settings
add column if not exists logo_url text not null default '/logo.png';

alter table public.hotel_settings
add column if not exists default_language text not null default 'en';

alter table public.hotel_settings
add column if not exists currency_code text not null default 'GEL';

alter table public.hotel_settings
add column if not exists currency_symbol text not null default '₾';

alter table public.hotel_settings
add column if not exists timezone text not null default 'Asia/Tbilisi';

alter table public.hotel_settings
add column if not exists created_at timestamptz not null default now();

alter table public.hotel_settings
add column if not exists updated_at timestamptz not null default now();

alter table public.rooms
add column if not exists nightly_price numeric(12, 2) not null default 0;

alter table public.rooms
add column if not exists is_active boolean not null default true;

alter table public.rooms
add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rooms_set_updated_at on public.rooms;
create trigger rooms_set_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists hotel_settings_set_updated_at on public.hotel_settings;
create trigger hotel_settings_set_updated_at
before update on public.hotel_settings
for each row execute function public.set_updated_at();

alter table public.hotel_settings enable row level security;
alter table public.rooms enable row level security;

drop policy if exists "Authenticated users can manage hotel settings" on public.hotel_settings;
create policy "Authenticated users can manage hotel settings"
on public.hotel_settings for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can read rooms" on public.rooms;
drop policy if exists "Authenticated users can manage rooms" on public.rooms;
create policy "Authenticated users can manage rooms"
on public.rooms for all
to authenticated
using (true)
with check (true);

insert into public.hotel_settings (
  hotel_name,
  hotel_label,
  logo_url,
  default_language,
  currency_code,
  currency_symbol,
  timezone
)
select
  'Marseille',
  'Hotel',
  '/logo.png',
  'en',
  'GEL',
  '₾',
  'Asia/Tbilisi'
where not exists (select 1 from public.hotel_settings);
