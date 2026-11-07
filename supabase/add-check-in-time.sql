alter table public.stays
add column if not exists check_in_time time;

comment on column public.stays.check_in_time is
  'Local check-in clock time for the stay, without timezone.';
