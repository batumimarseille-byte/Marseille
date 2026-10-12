-- Allow staff to sign in with display name or email.
-- Run this in the Supabase SQL Editor.

create or replace function public.resolve_login_email(
  identifier text,
  target_hotel_id text default null
)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  safe_id text := lower(btrim(coalesce(identifier, '')));
  safe_hotel text := lower(btrim(coalesce(target_hotel_id, '')));
  match_count integer := 0;
  found_email text;
begin
  if safe_id = '' then
    return null;
  end if;

  if position('@' in safe_id) > 0 then
    return safe_id;
  end if;

  with matches as (
    select distinct lower(au.email::text) as email
    from public.hotel_users hu
    join auth.users au on au.id = hu.user_id
    where hu.is_active = true
      and au.email is not null
      and (
        lower(btrim(hu.display_name)) = safe_id
        or lower(split_part(btrim(hu.display_name), ' ', 1)) = safe_id
      )
      and (safe_hotel = '' or hu.hotel_id = safe_hotel)
  )
  select count(*)::integer, max(email)
  into match_count, found_email
  from matches;

  if match_count = 1 then
    return found_email;
  end if;

  if match_count > 1 then
    return null;
  end if;

  if safe_hotel = '' then
    return null;
  end if;

  with matches as (
    select distinct lower(au.email::text) as email
    from public.hotel_users hu
    join auth.users au on au.id = hu.user_id
    where hu.is_active = true
      and au.email is not null
      and (
        lower(btrim(hu.display_name)) = safe_id
        or lower(split_part(btrim(hu.display_name), ' ', 1)) = safe_id
      )
  )
  select count(*)::integer, max(email)
  into match_count, found_email
  from matches;

  if match_count = 1 then
    return found_email;
  end if;

  return null;
end;
$$;

revoke all on function public.resolve_login_email(text, text) from public;
grant execute on function public.resolve_login_email(text, text) to anon, authenticated;

create or replace function public.list_login_staff(target_hotel_id text default null)
returns table (
  id uuid,
  display_name text,
  avatar_url text,
  chat_color text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    hu.id,
    hu.display_name,
    hu.avatar_url,
    hu.chat_color
  from public.hotel_users hu
  where hu.is_active = true
    and (
      target_hotel_id is null
      or btrim(target_hotel_id) = ''
      or hu.hotel_id = lower(btrim(target_hotel_id))
    )
  order by hu.display_name;
$$;

revoke all on function public.list_login_staff(text) from public;
grant execute on function public.list_login_staff(text) to anon, authenticated;

create or replace function public.resolve_login_staff_id(staff_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select lower(au.email::text)
  from public.hotel_users hu
  join auth.users au on au.id = hu.user_id
  where hu.id = staff_id
    and hu.is_active = true
    and au.email is not null
  limit 1;
$$;

revoke all on function public.resolve_login_staff_id(uuid) from public;
grant execute on function public.resolve_login_staff_id(uuid) to anon, authenticated;
