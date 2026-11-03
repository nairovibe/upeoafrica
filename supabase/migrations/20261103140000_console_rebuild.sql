-- Console rebuild: inquiry details, lead activity, blog SEO, event ticketing, desk shortcuts.

-- Inquiries -----------------------------------------------------------------

alter table public.leads
  add column if not exists details jsonb not null default '{}'::jsonb,
  add column if not exists page_url text,
  add column if not exists referrer text,
  add column if not exists utm jsonb not null default '{}'::jsonb,
  add column if not exists assigned_to uuid references public.profiles (id) on delete set null,
  add column if not exists last_contacted_at timestamptz;

alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads
  add constraint leads_source_check
  check (source = any (array['contact_form', 'inquiry', 'founders', 'event']));

create table if not exists public.lead_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  kind text not null check (kind = any (array['note', 'status', 'email', 'call', 'meeting'])),
  body text not null default '',
  created_by uuid references public.profiles (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists lead_activity_lead_idx on public.lead_activity (lead_id, created_at desc);

alter table public.lead_activity enable row level security;
grant all privileges on public.lead_activity to authenticated, service_role;

create policy lead_activity_staff on public.lead_activity for all to authenticated
  using (is_staff()) with check (is_staff());

-- Blog ----------------------------------------------------------------------

alter table public.articles
  add column if not exists meta_title text,
  add column if not exists meta_description text,
  add column if not exists focus_keyword text,
  add column if not exists keywords text[] not null default '{}',
  add column if not exists canonical_url text,
  add column if not exists og_image_path text,
  add column if not exists noindex boolean not null default false,
  add column if not exists category text,
  add column if not exists author_name text,
  add column if not exists reading_minutes integer,
  add column if not exists seo_score integer,
  add column if not exists gallery text[] not null default '{}',
  add column if not exists featured boolean not null default false;

create index if not exists articles_published_idx on public.articles (published_at desc) where published_at is not null;

-- Events and ticketing --------------------------------------------------------

alter table public.events
  add column if not exists category text,
  add column if not exists speakers jsonb not null default '[]'::jsonb,
  add column if not exists agenda jsonb not null default '[]'::jsonb,
  add column if not exists gallery text[] not null default '{}',
  add column if not exists registration_closes_at timestamptz,
  add column if not exists meta_title text,
  add column if not exists meta_description text;

alter table public.ticket_types
  add column if not exists description text not null default '',
  add column if not exists sales_start timestamptz,
  add column if not exists sales_end timestamptz,
  add column if not exists max_per_order integer not null default 10;

alter table public.orders
  add column if not exists quantity integer not null default 1 check (quantity > 0),
  add column if not exists ticket_code text unique,
  add column if not exists checked_in_at timestamptz,
  add column if not exists attendee_company text;

create index if not exists orders_event_idx on public.orders (event_id) where event_id is not null;

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
    where o.ticket_type_id = tt.id and o.status in ('pending', 'paid');
  if tt.quota is not null and held_type + qty > tt.quota then raise exception 'sold_out'; end if;

  select coalesce(sum(o.quantity), 0) into held_event from public.orders o
    where o.event_id = ev.id and o.kind = 'ticket' and o.status in ('pending', 'paid');
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

revoke all on function public.create_ticket_order(uuid, uuid, integer, text, text, text, text) from public;
grant execute on function public.create_ticket_order(uuid, uuid, integer, text, text, text, text) to anon, authenticated, service_role;

create or replace function public.ticket_order_status(p_order_id uuid)
returns table (order_status text, ticket_code text, event_title text, quantity integer)
language sql
stable
security definer
set search_path to 'public'
as $$
  select o.status,
         case when o.status = 'paid' then o.ticket_code else null end,
         e.title,
         o.quantity
  from public.orders o
  left join public.events e on e.id = o.event_id
  where o.id = p_order_id and o.kind = 'ticket';
$$;

revoke all on function public.ticket_order_status(uuid) from public;
grant execute on function public.ticket_order_status(uuid) to anon, authenticated, service_role;

create or replace view public.event_ticket_stats
with (security_invoker = true) as
select
  tt.event_id,
  tt.id as ticket_type_id,
  coalesce(sum(o.quantity) filter (where o.status = 'paid'), 0)::integer as sold,
  coalesce(sum(o.quantity) filter (where o.status = 'pending'), 0)::integer as held,
  coalesce(sum(o.amount_kes) filter (where o.status = 'paid'), 0)::integer as revenue_kes,
  coalesce(sum(o.quantity) filter (where o.checked_in_at is not null), 0)::integer as checked_in
from public.ticket_types tt
left join public.orders o on o.ticket_type_id = tt.id and o.kind = 'ticket'
group by tt.event_id, tt.id;

grant select on public.event_ticket_stats to authenticated, service_role;

-- Desk ----------------------------------------------------------------------

alter table public.profiles
  add column if not exists shortcuts text[] not null default '{}';
