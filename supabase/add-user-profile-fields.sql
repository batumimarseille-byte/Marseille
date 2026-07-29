-- Add editable user profile fields for staff chat and account settings.
-- Run this in Supabase SQL Editor before deploying the matching app code.

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

alter table public.staff_messages
add column if not exists author_user_id uuid references auth.users(id) on update cascade on delete set null;

alter table public.staff_messages
add column if not exists author_name text not null default 'Message';

alter table public.staff_messages
add column if not exists author_position text not null default '';

alter table public.staff_messages
add column if not exists author_avatar_url text not null default '';

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
