alter table public.products
  add column if not exists promo_price_kes integer,
  add column if not exists promo_label text,
  add column if not exists promo_starts_at timestamptz,
  add column if not exists promo_ends_at timestamptz;

alter table public.products drop constraint if exists products_promo_price_check;
alter table public.products
  add constraint products_promo_price_check
  check (promo_price_kes is null or (promo_price_kes >= 0 and promo_price_kes < price_kes));

alter table public.products drop constraint if exists products_promo_window_check;
alter table public.products
  add constraint products_promo_window_check
  check (promo_starts_at is null or promo_ends_at is null or promo_ends_at > promo_starts_at);

alter table public.ticket_types
  add column if not exists promo_price_kes integer,
  add column if not exists promo_label text,
  add column if not exists promo_starts_at timestamptz,
  add column if not exists promo_ends_at timestamptz;

alter table public.ticket_types drop constraint if exists ticket_types_promo_price_check;
alter table public.ticket_types
  add constraint ticket_types_promo_price_check
  check (promo_price_kes is null or (promo_price_kes >= 0 and promo_price_kes < price_kes));

alter table public.ticket_types drop constraint if exists ticket_types_promo_window_check;
alter table public.ticket_types
  add constraint ticket_types_promo_window_check
  check (promo_starts_at is null or promo_ends_at is null or promo_ends_at > promo_starts_at);

create or replace function public.create_ticket_order(
  p_event_id uuid,
  p_ticket_type_id uuid,
  p_quantity integer,
  p_email text,
  p_phone text,
  p_name text,
  p_company text default null
)
returns table (order_id uuid, order_status text, amount_kes integer, ticket_code text)
language plpgsql
security definer
set search_path to 'public'
as $$
#variable_conflict use_column
declare
  ev public.events%rowtype;
  tt public.ticket_types%rowtype;
  qty integer := greatest(coalesce(p_quantity, 1), 1);
  held_type integer;
  held_event integer;
  unit integer;
  total integer;
  code text;
  new_id uuid;
  is_free boolean;
begin
  select * into ev from public.events where id = p_event_id and published_at is not null for update;
  if not found then raise exception 'event_not_found'; end if;
  if ev.starts_at < now() - interval '12 hours' then raise exception 'event_over'; end if;
  if ev.registration_closes_at is not null and ev.registration_closes_at < now() then
    raise exception 'registration_closed';
  end if;

  select * into tt from public.ticket_types where id = p_ticket_type_id and event_id = ev.id;
  if not found then raise exception 'ticket_not_found'; end if;
  if tt.sales_start is not null and tt.sales_start > now() then raise exception 'sales_not_open'; end if;
  if tt.sales_end is not null and tt.sales_end < now() then raise exception 'sales_closed'; end if;
  if qty > coalesce(tt.max_per_order, 10) then raise exception 'too_many'; end if;

  select coalesce(sum(o.quantity), 0) into held_type from public.orders o
    where o.ticket_type_id = tt.id and (o.status = 'paid' or (o.status = 'pending' and o.created_at > now() - interval '15 minutes'));
  if tt.quota is not null and held_type + qty > tt.quota then raise exception 'sold_out'; end if;

  select coalesce(sum(o.quantity), 0) into held_event from public.orders o
    where o.event_id = ev.id and o.kind = 'ticket' and (o.status = 'paid' or (o.status = 'pending' and o.created_at > now() - interval '15 minutes'));
  if ev.capacity is not null and held_event + qty > ev.capacity then raise exception 'at_capacity'; end if;

  unit := tt.price_kes;
  if tt.promo_price_kes is not null
     and tt.promo_price_kes >= 0
     and tt.promo_price_kes < tt.price_kes
     and (tt.promo_starts_at is null or tt.promo_starts_at <= now())
     and (tt.promo_ends_at is null or tt.promo_ends_at > now())
  then
    unit := tt.promo_price_kes;
  end if;

  total := (unit * qty)::integer;
  is_free := total <= 0;
  code := 'UAT-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders (
    email, phone, amount_kes, provider, status, kind, event_id, ticket_type_id,
    attendee_name, attendee_company, quantity, ticket_code
  ) values (
    lower(trim(p_email)), p_phone, total, 'intasend',
    case when is_free then 'paid' else 'pending' end,
    'ticket', ev.id, tt.id, nullif(trim(p_name), ''), nullif(trim(p_company), ''), qty, code
  ) returning id into new_id;

  return query select new_id, case when is_free then 'paid' else 'pending' end, total, code;
end;
$$;
