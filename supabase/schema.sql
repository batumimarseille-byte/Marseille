-- Hotel Marseille database schema
-- Run this in Supabase SQL Editor before connecting the app.

create extension if not exists pgcrypto;

create table if not exists public.rooms (
  id text primary key,
  type text not null,
  group_name text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_not_blank check (length(btrim(name)) > 0)
);

create table if not exists public.stays (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  company_id uuid references public.companies(id) on update cascade on delete set null,
  room_id text not null references public.rooms(id) on update cascade,
  check_in date not null,
  check_out date not null,
  color text not null default '#4f7cff',
  total_amount numeric(12, 2) not null default 0,
  cash_amount numeric(12, 2) not null default 0,
  card_amount numeric(12, 2) not null default 0,
  invoice_amount numeric(12, 2) not null default 0,
  debt_amount numeric(12, 2) not null default 0,
  notes text not null default '',
  is_cancelled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stays_valid_dates check (check_out > check_in),
  constraint stays_valid_color check (color ~ '^#[0-9A-Fa-f]{6}$')
);

alter table public.stays
add column if not exists company_id uuid references public.companies(id) on update cascade on delete set null;

create index if not exists stays_room_dates_idx on public.stays (room_id, check_in, check_out);
create index if not exists stays_company_id_idx on public.stays (company_id);
create index if not exists stays_check_in_idx on public.stays (check_in);
create index if not exists stays_check_out_idx on public.stays (check_out);
create index if not exists stays_debt_idx on public.stays (debt_amount);

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

alter table public.rooms enable row level security;
alter table public.companies enable row level security;
alter table public.stays enable row level security;

-- First stage: one authenticated hotel user can manage everything.
-- Later we can add roles if the hotel needs several staff accounts.
drop policy if exists "Authenticated users can read rooms" on public.rooms;
create policy "Authenticated users can read rooms"
on public.rooms for select
to authenticated
using (true);

drop policy if exists "Authenticated users can manage stays" on public.stays;
create policy "Authenticated users can manage stays"
on public.stays for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage companies" on public.companies;
create policy "Authenticated users can manage companies"
on public.companies for all
to authenticated
using (true)
with check (true);

insert into public.rooms (id, type, group_name, sort_order) values
  ('101', 'Suite', 'lux', 101),
  ('106', 'Suite', 'lux', 106),
  ('207', 'Suite', 'lux', 207),
  ('102', 'Standard', 'standard', 102),
  ('104', 'Standard', 'standard', 104),
  ('202', 'Standard', 'standard', 202),
  ('203', 'Standard', 'standard', 203),
  ('204', 'Standard', 'standard', 204),
  ('205', 'Standard', 'standard', 205),
  ('103', 'Twin', 'two-beds', 103),
  ('105', 'Triple', 'three-beds', 105),
  ('201', 'Junior Suite', 'semi-lux', 201),
  ('206', 'Junior Suite', 'semi-lux', 206)
on conflict (id) do update set
  type = excluded.type,
  group_name = excluded.group_name,
  sort_order = excluded.sort_order,
  is_active = true;

delete from public.rooms
where id in ('301', '302', '401', '402');
