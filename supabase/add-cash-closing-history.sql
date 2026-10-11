alter table public.cash_closings
add column if not exists notes text not null default '';

alter table public.cash_closings
add column if not exists author_name text not null default '';

alter table public.cash_closings
add column if not exists author_user_id uuid references auth.users(id) on update cascade on delete set null;

alter table public.cash_closings
drop constraint if exists cash_closings_hotel_id_close_date_key;

create index if not exists cash_closings_hotel_created_at_idx
on public.cash_closings (hotel_id, created_at desc);
