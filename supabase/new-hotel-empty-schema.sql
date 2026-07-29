-- Clean schema for a new hotel.
-- This creates the app tables and policies, but does not insert Marseille rooms,
-- Marseille stays, companies, or old demo data.

create extension if not exists pgcrypto;

create table if not exists public.hotels (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotels_id_not_blank check (length(btrim(id)) > 0),
  constraint hotels_name_not_blank check (length(btrim(name)) > 0),
  constraint hotels_slug_not_blank check (length(btrim(slug)) > 0)
);

create table if not exists public.hotel_settings (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  hotel_name text not null default 'New Hotel',
  hotel_label text not null default 'Hotel',
  logo_url text not null default '/logo.png',
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
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  id text not null,
  type text not null,
  group_name text not null,
  sort_order integer not null,
  nightly_price numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (hotel_id, id)
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  name text not null,
  color text not null default '#4f7cff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_not_blank check (length(btrim(name)) > 0),
  constraint companies_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint companies_hotel_id_name_key unique (hotel_id, name)
);

create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  guest_name text not null,
  company_id uuid references public.companies(id) on update cascade on delete set null,
  room_id text not null,
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
  constraint stays_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint stays_hotel_room_fkey foreign key (hotel_id, room_id) references public.rooms(hotel_id, id) on update cascade
);

create table if not exists public.booking_colors (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  color text not null,
  created_at timestamptz not null default now(),
  constraint booking_colors_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint booking_colors_hotel_id_color_key unique (hotel_id, color)
);

create table if not exists public.staff_messages (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  author text not null default 'reception',
  color text not null default '#4f7cff',
  message text not null,
  created_at timestamptz not null default now(),
  constraint staff_messages_author_valid check (author in ('admin', 'reception', 'housekeeping', 'manager')),
  constraint staff_messages_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint staff_messages_message_not_blank check (length(btrim(message)) > 0)
);

create index if not exists stays_hotel_room_dates_idx on public.stays (hotel_id, room_id, check_in, check_out);
create index if not exists stays_hotel_company_id_idx on public.stays (hotel_id, company_id);
create index if not exists stays_hotel_check_in_idx on public.stays (hotel_id, check_in);
create index if not exists stays_hotel_check_out_idx on public.stays (hotel_id, check_out);
create index if not exists stays_hotel_debt_idx on public.stays (hotel_id, debt_amount);
create index if not exists stays_hotel_pinned_idx on public.stays (hotel_id, is_pinned) where is_pinned = true;
create index if not exists rooms_hotel_active_sort_idx on public.rooms (hotel_id, is_active, sort_order);
create index if not exists staff_messages_hotel_created_at_idx on public.staff_messages (hotel_id, created_at desc);
create unique index if not exists hotel_settings_hotel_id_key on public.hotel_settings (hotel_id);

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

drop trigger if exists hotels_set_updated_at on public.hotels;
create trigger hotels_set_updated_at
before update on public.hotels
for each row execute function public.set_updated_at();

alter table public.hotels enable row level security;
alter table public.hotel_settings enable row level security;
alter table public.rooms enable row level security;
alter table public.companies enable row level security;
alter table public.stays enable row level security;
alter table public.booking_colors enable row level security;
alter table public.staff_messages enable row level security;

drop policy if exists "Authenticated users can manage hotels" on public.hotels;
create policy "Authenticated users can manage hotels"
on public.hotels for all
to authenticated
using (true)
with check (true);

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

insert into public.hotels (id, name, slug)
values ('new-hotel', 'New Hotel', 'new-hotel')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

insert into public.hotel_settings (
  hotel_id,
  hotel_name,
  hotel_label,
  logo_url,
  default_language,
  currency_code,
  currency_symbol,
  timezone
)
select
  'new-hotel',
  'New Hotel',
  'Hotel',
  '/logo.png',
  'en',
  'GEL',
  '₾',
  'Asia/Tbilisi'
where not exists (select 1 from public.hotel_settings where hotel_id = 'new-hotel');
