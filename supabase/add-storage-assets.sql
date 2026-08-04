-- Hotel assets storage for uploaded logos and staff avatars.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hotel-assets',
  'hotel-assets',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Hotel assets are publicly readable" on storage.objects;
create policy "Hotel assets are publicly readable"
on storage.objects for select
using (bucket_id = 'hotel-assets');

drop policy if exists "Hotel users can upload hotel assets" on storage.objects;
create policy "Hotel users can upload hotel assets"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'hotel-assets'
  and exists (
    select 1
    from public.hotel_users
    where user_id = auth.uid()
      and hotel_id = (storage.foldername(name))[1]
      and is_active = true
  )
);

drop policy if exists "Hotel users can update hotel assets" on storage.objects;
create policy "Hotel users can update hotel assets"
on storage.objects for update
to authenticated
using (
  bucket_id = 'hotel-assets'
  and exists (
    select 1
    from public.hotel_users
    where user_id = auth.uid()
      and hotel_id = (storage.foldername(name))[1]
      and is_active = true
  )
)
with check (
  bucket_id = 'hotel-assets'
  and exists (
    select 1
    from public.hotel_users
    where user_id = auth.uid()
      and hotel_id = (storage.foldername(name))[1]
      and is_active = true
  )
);

drop policy if exists "Hotel admins can delete hotel assets" on storage.objects;
create policy "Hotel admins can delete hotel assets"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'hotel-assets'
  and exists (
    select 1
    from public.hotel_users
    where user_id = auth.uid()
      and hotel_id = (storage.foldername(name))[1]
      and role = 'admin'
      and is_active = true
  )
);
