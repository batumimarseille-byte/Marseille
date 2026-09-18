alter table public.stays
add column if not exists is_complimentary boolean not null default false;

comment on column public.stays.is_complimentary is
  'True when the guest stays free of charge. Total and debt stay at 0.';
