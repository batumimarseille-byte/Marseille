-- Keep the newest Orhan Ates stay for room 101 / 6–7 Nov 2026; delete the extra copies.
with ranked as (
  select
    id,
    row_number() over (order by created_at desc nulls last, id desc) as rn
  from public.stays
  where hotel_id = 'marseille'
    and lower(trim(guest_name)) = 'orhan ates'
    and room_id = '101'
    and check_in = date '2026-11-06'
    and check_out = date '2026-11-07'
)
delete from public.stays
where id in (select id from ranked where rn > 1);
