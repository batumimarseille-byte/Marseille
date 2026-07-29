-- Safe update for an existing Hotel Marseille database.
-- This does not delete stays, companies, rooms, payments, or messages.
-- It only adds the columns/triggers needed for editable room inventory.

create extension if not exists pgcrypto;

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

drop policy if exists "Authenticated users can read rooms" on public.rooms;
drop policy if exists "Authenticated users can manage rooms" on public.rooms;
create policy "Authenticated users can manage rooms"
on public.rooms for all
to authenticated
using (true)
with check (true);
