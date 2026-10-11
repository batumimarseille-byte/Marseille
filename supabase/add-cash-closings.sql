create table if not exists public.cash_closings (
  id uuid primary key default gen_random_uuid(),
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  close_date date not null,
  amount numeric(12, 2) not null default 0,
  notes text not null default '',
  author_name text not null default '',
  author_user_id uuid references auth.users(id) on update cascade on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.cash_closings enable row level security;

drop policy if exists "Authenticated users can manage cash closings" on public.cash_closings;
create policy "Authenticated users can manage cash closings"
on public.cash_closings for all
to authenticated
using (true)
with check (true);

grant select, insert, update, delete on public.cash_closings to authenticated;

create index if not exists cash_closings_hotel_created_at_idx
on public.cash_closings (hotel_id, created_at desc);

drop trigger if exists cash_closings_set_updated_at on public.cash_closings;
create trigger cash_closings_set_updated_at
before update on public.cash_closings
for each row execute function public.set_updated_at();
