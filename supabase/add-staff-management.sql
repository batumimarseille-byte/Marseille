-- Staff management for hotel admins.
-- Run this after add-hotel-users.sql and add-user-profile-fields.sql.

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
