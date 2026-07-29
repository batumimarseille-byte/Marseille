-- Create an empty demo hotel inside the shared database.
-- The app can open it with: ?hotel=demo

insert into public.hotels (id, name, slug)
values ('demo', 'Demo Hotel', 'demo')
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug;

insert into public.hotel_settings (
  hotel_id,
  hotel_name,
  hotel_label,
  logo_url,
  default_language,
  currency_code,
  currency_symbol,
  timezone
)
values (
  'demo',
  'Demo Hotel',
  'Hotel',
  '/logo.png',
  'en',
  'GEL',
  '₾',
  'Asia/Tbilisi'
)
on conflict (hotel_id) do update set
  hotel_name = excluded.hotel_name,
  hotel_label = excluded.hotel_label,
  logo_url = excluded.logo_url,
  default_language = excluded.default_language,
  currency_code = excluded.currency_code,
  currency_symbol = excluded.currency_symbol,
  timezone = excluded.timezone;
