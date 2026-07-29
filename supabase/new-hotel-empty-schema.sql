-- Clean schema for a new hotel.
-- This creates the app tables and policies, but does not insert Marseille rooms,
-- Marseille stays, companies, or old demo data.

create extension if not exists pgcrypto;

create table if not exists public.hotel_settings (
  id uuid primary key default gen_random_uuid(),
  hotel_name text not null default 'New Hotel',
  hotel_label text not null default 'Hotel',
  logo_url text not null default 'assets/hotel-marseille-logo.png',
  default_language text not null default 'en',
  currency_code text not null default 'GEL',
  currency_symbol text not null default '₾',
  timezone text not null default 'Asia/Tbilisi',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotel_settings_hotel_name_not_blank check (length(btrim(hotel_name)) > 0),
  constraint hotel_settings_hotel_label_not_blank check (length(btrim(hotel_label)) > 0),
  constraint hotel_settings_default_language_valid check (default_language in ('en', 'ka')),
  constraint hotel_settings_currency_code_not_blank check (length(btrim(currency_code)) > 0),
  constraint hotel_settings_currency_symbol_not_blank check (length(btrim(currency_symbol)) > 0)
);

create table if not exists public.rooms (
  id text primary key,
  type text not null,
  group_name text not null,
  sort_order integer not null,
  nightly_price numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#4f7cff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_not_blank check (length(btrim(name)) > 0),
  constraint companies_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  company_id uuid references public.companies(id) on update cascade on delete set null,
  room_id text not null references public.rooms(id) on update cascade,
  check_in date not null,
  check_out date not null,
  night_count integer not null default 0,
  color text not null default '#4f7cff',
  total_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  cash_amount numeric(12, 2) not null default 0,
  card_amount numeric(12, 2) not null default 0,
  invoice_amount numeric(12, 2) not null default 0,
  debt_amount numeric(12, 2) not null default 0,
  notes text not null default '',
  is_cancelled boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stays_valid_dates check (check_out > check_in),
  constraint stays_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.booking_colors (
  id uuid primary key default gen_random_uuid(),
  color text not null unique,
  created_at timestamptz not null default now(),
  constraint booking_colors_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$')
);

create table if not exists public.staff_messages (
  id uuid primary key default gen_random_uuid(),
  author text not null default 'reception',
  color text not null default '#4f7cff',
  message text not null,
  created_at timestamptz not null default now(),
  constraint staff_messages_author_valid check (author in ('admin', 'reception', 'housekeeping', 'manager')),
  constraint staff_messages_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint staff_messages_message_not_blank check (length(btrim(message)) > 0)
);

create index if not exists stays_room_dates_idx on public.stays (room_id, check_in, check_out);
create index if not exists stays_company_id_idx on public.stays (company_id);
create index if not exists stays_check_in_idx on public.stays (check_in);
create index if not exists stays_check_out_idx on public.stays (check_out);
create index if not exists stays_debt_idx on public.stays (debt_amount);
create index if not exists stays_pinned_idx on public.stays (is_pinned) where is_pinned = true;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists stays_set_updated_at on public.stays;
create trigger stays_set_updated_at
before update on public.stays
for each row execute function public.set_updated_at();

drop trigger if exists companies_set_updated_at on public.companies;
create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

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
alter table public.companies enable row level security;
alter table public.stays enable row level security;
alter table public.booking_colors enable row level security;
alter table public.staff_messages enable row level security;

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

drop policy if exists "Authenticated users can manage stays" on public.stays;
create policy "Authenticated users can manage stays"
on public.stays for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage booking colors" on public.booking_colors;
create policy "Authenticated users can manage booking colors"
on public.booking_colors for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage companies" on public.companies;
create policy "Authenticated users can manage companies"
on public.companies for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage staff messages" on public.staff_messages;
create policy "Authenticated users can manage staff messages"
on public.staff_messages for all
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
  'New Hotel',
  'Hotel',
  'assets/hotel-marseille-logo.png',
  'en',
  'GEL',
  '₾',
  'Asia/Tbilisi'
where not exists (select 1 from public.hotel_settings);
