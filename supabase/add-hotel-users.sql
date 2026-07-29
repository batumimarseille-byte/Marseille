-- Add hotel user profiles.
-- This is the first safe step toward separate hotel accounts.
-- Run this in Supabase SQL Editor after add-hotel-tenancy.sql.

create extension if not exists pgcrypto;

create table if not exists public.hotel_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on update cascade on delete cascade,
  hotel_id text not null references public.hotels(id) on update cascade on delete restrict,
  display_name text not null default 'Administrator',
  role text not null default 'staff',
  position text not null default '',
  avatar_url text not null default '',
  chat_color text not null default '#4f7cff',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint hotel_users_display_name_not_blank check (length(btrim(display_name)) > 0),
  constraint hotel_users_valid_chat_color check (chat_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint hotel_users_role_valid check (role in ('admin', 'manager', 'reception', 'housekeeping', 'staff', 'viewer')),
  constraint hotel_users_user_id_key unique (user_id)
);

create index if not exists hotel_users_hotel_role_idx
on public.hotel_users (hotel_id, role, is_active);

alter table public.hotel_users
add column if not exists avatar_url text not null default '';

alter table public.hotel_users
add column if not exists chat_color text not null default '#4f7cff';

do $$
begin
  alter table public.hotel_users
  add constraint hotel_users_valid_chat_color check (chat_color ~ '^#[0-9A-Fa-f]{6}$');
exception
  when duplicate_object then null;
end $$;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hotel_users_set_updated_at on public.hotel_users;
create trigger hotel_users_set_updated_at
before update on public.hotel_users
for each row execute function public.set_updated_at();

alter table public.hotel_users enable row level security;

create or replace function public.is_hotel_admin(target_hotel_id text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.hotel_users
    where user_id = auth.uid()
      and hotel_id = target_hotel_id
      and role = 'admin'
      and is_active = true
  );
$$;

grant execute on function public.is_hotel_admin(text) to authenticated;

create or replace function public.update_own_hotel_profile(
  next_display_name text,
  next_position text,
  next_avatar_url text,
  next_chat_color text
)
returns public.hotel_users
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.hotel_users;
begin
  update public.hotel_users
  set
    display_name = coalesce(nullif(btrim(next_display_name), ''), display_name),
    position = btrim(coalesce(next_position, '')),
    avatar_url = btrim(coalesce(next_avatar_url, '')),
    chat_color = coalesce(nullif(btrim(next_chat_color), ''), chat_color),
    updated_at = now()
  where user_id = auth.uid()
    and is_active = true
    and coalesce(nullif(btrim(next_chat_color), ''), chat_color) ~ '^#[0-9A-Fa-f]{6}$'
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'Profile was not updated';
  end if;

  return updated_profile;
end;
$$;

grant execute on function public.update_own_hotel_profile(text, text, text, text) to authenticated;

create or replace function public.add_hotel_staff_by_email(
  next_email text,
  next_display_name text,
  next_position text,
  next_role text
)
returns public.hotel_users
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  admin_hotel_id text;
  target_user_id uuid;
  existing_profile public.hotel_users;
  saved_profile public.hotel_users;
  safe_email text := lower(btrim(coalesce(next_email, '')));
  safe_role text := case when next_role = 'admin' then 'admin' else 'staff' end;
begin
  select hotel_id
  into admin_hotel_id
  from public.hotel_users
  where user_id = auth.uid()
    and role = 'admin'
    and is_active = true
  limit 1;

  if admin_hotel_id is null then
    raise exception 'Only active hotel admins can add staff';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email::text) = safe_email
  limit 1;

  if target_user_id is null then
    raise exception 'Auth user with this email was not found';
  end if;

  select *
  into existing_profile
  from public.hotel_users
  where user_id = target_user_id
  limit 1;

  if existing_profile.id is not null and existing_profile.hotel_id <> admin_hotel_id then
    raise exception 'This user is already linked to another hotel';
  end if;

  if existing_profile.id is not null then
    update public.hotel_users
    set
      display_name = coalesce(nullif(btrim(next_display_name), ''), display_name),
      position = btrim(coalesce(next_position, '')),
      role = safe_role,
      is_active = true,
      updated_at = now()
    where id = existing_profile.id
    returning * into saved_profile;
  else
    insert into public.hotel_users (user_id, hotel_id, display_name, role, position, is_active)
    values (
      target_user_id,
      admin_hotel_id,
      coalesce(nullif(btrim(next_display_name), ''), safe_email),
      safe_role,
      btrim(coalesce(next_position, '')),
      true
    )
    returning * into saved_profile;
  end if;

  return saved_profile;
end;
$$;

grant execute on function public.add_hotel_staff_by_email(text, text, text, text) to authenticated;

drop policy if exists "Users can read own hotel profile" on public.hotel_users;
create policy "Users can read own hotel profile"
on public.hotel_users for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Hotel admins can manage hotel users" on public.hotel_users;
create policy "Hotel admins can manage hotel users"
on public.hotel_users for all
to authenticated
using (public.is_hotel_admin(hotel_id))
with check (public.is_hotel_admin(hotel_id));

-- Bootstrap the current Marseille owner account if it already exists in Supabase Auth.
insert into public.hotel_users (user_id, hotel_id, display_name, role, position, is_active)
select
  auth_users.id,
  'marseille',
  'Administrator',
  'admin',
  'Hotel staff',
  true
from auth.users auth_users
where auth_users.email = 'batumimarseille@gmail.com'
on conflict (user_id) do update set
  hotel_id = excluded.hotel_id,
  display_name = excluded.display_name,
  role = excluded.role,
  position = excluded.position,
  is_active = true,
  updated_at = now();
