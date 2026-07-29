-- Add hotel_id tenancy to the existing Hotel Marseille database.
-- Run once in Supabase SQL Editor before deploying the matching app version.

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

insert into public.hotels (id, name, slug)
values ('marseille', 'Marseille', 'marseille')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

alter table public.hotel_settings add column if not exists hotel_id text;
alter table public.rooms add column if not exists hotel_id text;
alter table public.companies add column if not exists hotel_id text;
alter table public.stays add column if not exists hotel_id text;
alter table public.booking_colors add column if not exists hotel_id text;
alter table public.staff_messages add column if not exists hotel_id text;

update public.hotel_settings set hotel_id = 'marseille' where hotel_id is null;
update public.rooms set hotel_id = 'marseille' where hotel_id is null;
update public.companies set hotel_id = 'marseille' where hotel_id is null;
update public.stays set hotel_id = 'marseille' where hotel_id is null;
update public.booking_colors set hotel_id = 'marseille' where hotel_id is null;
update public.staff_messages set hotel_id = 'marseille' where hotel_id is null;

alter table public.hotel_settings alter column hotel_id set not null;
alter table public.rooms alter column hotel_id set not null;
alter table public.companies alter column hotel_id set not null;
alter table public.stays alter column hotel_id set not null;
alter table public.booking_colors alter column hotel_id set not null;
alter table public.staff_messages alter column hotel_id set not null;

do $$
begin
  alter table public.hotel_settings
  add constraint hotel_settings_hotel_id_fkey
  foreign key (hotel_id) references public.hotels(id)
  on update cascade on delete restrict;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.rooms
  add constraint rooms_hotel_id_fkey
  foreign key (hotel_id) references public.hotels(id)
  on update cascade on delete restrict;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.companies
  add constraint companies_hotel_id_fkey
  foreign key (hotel_id) references public.hotels(id)
  on update cascade on delete restrict;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.stays
  add constraint stays_hotel_id_fkey
  foreign key (hotel_id) references public.hotels(id)
  on update cascade on delete restrict;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.booking_colors
  add constraint booking_colors_hotel_id_fkey
  foreign key (hotel_id) references public.hotels(id)
  on update cascade on delete restrict;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.staff_messages
  add constraint staff_messages_hotel_id_fkey
  foreign key (hotel_id) references public.hotels(id)
  on update cascade on delete restrict;
exception
  when duplicate_object then null;
end $$;

alter table public.stays drop constraint if exists stays_room_id_fkey;
alter table public.rooms drop constraint if exists rooms_pkey;

do $$
begin
  alter table public.rooms
  add constraint rooms_pkey primary key (hotel_id, id);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.stays
  add constraint stays_hotel_room_fkey
  foreign key (hotel_id, room_id) references public.rooms(hotel_id, id)
  on update cascade;
exception
  when duplicate_object then null;
end $$;

alter table public.companies drop constraint if exists companies_name_key;

do $$
begin
  alter table public.companies
  add constraint companies_hotel_id_name_key unique (hotel_id, name);
exception
  when duplicate_object then null;
end $$;

alter table public.booking_colors drop constraint if exists booking_colors_color_key;

do $$
begin
  alter table public.booking_colors
  add constraint booking_colors_hotel_id_color_key unique (hotel_id, color);
exception
  when duplicate_object then null;
end $$;

create unique index if not exists hotel_settings_hotel_id_key
on public.hotel_settings (hotel_id);

drop index if exists stays_room_dates_idx;
create index if not exists stays_hotel_room_dates_idx
on public.stays (hotel_id, room_id, check_in, check_out);

create index if not exists stays_hotel_company_id_idx
on public.stays (hotel_id, company_id);

create index if not exists stays_hotel_check_in_idx
on public.stays (hotel_id, check_in);

create index if not exists stays_hotel_check_out_idx
on public.stays (hotel_id, check_out);

create index if not exists stays_hotel_debt_idx
on public.stays (hotel_id, debt_amount);

create index if not exists stays_hotel_pinned_idx
on public.stays (hotel_id, is_pinned)
where is_pinned = true;

create index if not exists rooms_hotel_active_sort_idx
on public.rooms (hotel_id, is_active, sort_order);

create index if not exists staff_messages_hotel_created_at_idx
on public.staff_messages (hotel_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hotels_set_updated_at on public.hotels;
create trigger hotels_set_updated_at
before update on public.hotels
for each row execute function public.set_updated_at();

alter table public.hotels enable row level security;

drop policy if exists "Authenticated users can manage hotels" on public.hotels;
create policy "Authenticated users can manage hotels"
on public.hotels for all
to authenticated
using (true)
with check (true);
