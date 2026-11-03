-- Unpaid orders hold seats for 15 minutes; public availability; staff check-in.

create or replace function public.ticket_holds(p_event_ids uuid[])
returns table (event_id uuid, ticket_type_id uuid, taken integer)
language sql
stable
security definer
set search_path to 'public'
as $$
  select tt.event_id,
         tt.id,
         coalesce(sum(o.quantity) filter (
           where o.status = 'paid'
              or (o.status = 'pending' and o.created_at > now() - interval '15 minutes')
         ), 0)::integer
  from public.ticket_types tt
  join public.events e on e.id = tt.event_id and (e.published_at is not null or is_staff())
  left join public.orders o on o.ticket_type_id = tt.id and o.kind = 'ticket'
  where tt.event_id = any (p_event_ids)
  group by tt.event_id, tt.id;
$$;

revoke all on function public.ticket_holds(uuid[]) from public;
grant execute on function public.ticket_holds(uuid[]) to anon, authenticated, service_role;

create or replace view public.event_ticket_stats
with (security_invoker = true) as
select
  tt.event_id,
  tt.id as ticket_type_id,
  coalesce(sum(o.quantity) filter (where o.status = 'paid'), 0)::integer as sold,
  coalesce(sum(o.quantity) filter (
    where o.status = 'pending' and o.created_at > now() - interval '15 minutes'
  ), 0)::integer as held,
  coalesce(sum(o.amount_kes) filter (where o.status = 'paid'), 0)::integer as revenue_kes,
  coalesce(sum(o.quantity) filter (where o.checked_in_at is not null), 0)::integer as checked_in
from public.ticket_types tt
left join public.orders o on o.ticket_type_id = tt.id and o.kind = 'ticket'
group by tt.event_id, tt.id;

create or replace function public.check_in_ticket(p_order_id uuid, p_checked_in boolean)
returns timestamptz
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  stamp timestamptz := case when p_checked_in then now() else null end;
begin
  if not is_staff() then raise exception 'Not allowed'; end if;
  update public.orders
     set checked_in_at = stamp
   where id = p_order_id and kind = 'ticket' and status = 'paid';
  if not found then raise exception 'ticket_not_found'; end if;
  return stamp;
end;
$$;

revoke all on function public.check_in_ticket(uuid, boolean) from public, anon;
grant execute on function public.check_in_ticket(uuid, boolean) to authenticated, service_role;

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

  total := (tt.price_kes * qty)::integer;
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
