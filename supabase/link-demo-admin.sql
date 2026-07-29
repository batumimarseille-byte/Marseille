-- Link an existing Supabase Auth user to the empty demo hotel as administrator.
-- Step 1: create the user in Supabase Authentication.
-- Step 2: change demo@example.com below to that user's email and run this file.

insert into public.hotel_users (user_id, hotel_id, display_name, role, position, is_active)
select
  auth_users.id,
  'demo',
  'Demo Administrator',
  'admin',
  'Hotel staff',
  true
from auth.users auth_users
where auth_users.email = 'demo@example.com'
on conflict (user_id) do update set
  hotel_id = excluded.hotel_id,
  display_name = excluded.display_name,
  role = excluded.role,
  position = excluded.position,
  is_active = true,
  updated_at = now();
