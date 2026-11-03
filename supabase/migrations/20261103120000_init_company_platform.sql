-- Company platform schema, rebuilt from the previous Supabase project.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_staff()
returns boolean
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  return exists (select 1 from public.profiles where id = auth.uid());
end;
$$;

create or replace function public.is_owner()
returns boolean
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  return coalesce((select role from public.profiles where id = auth.uid()) = 'owner', false);
end;
$$;

create or replace function public.can_edit()
returns boolean
language plpgsql
stable
security definer
set search_path to 'public'
as $$
begin
  return coalesce((select role from public.profiles where id = auth.uid()) in ('owner', 'editor'), false);
end;
$$;

create or replace function public.staff_role()
returns text
language plpgsql
stable
security definer
set search_path to 'public'
as $$
declare r text;
begin
  select role into r from public.profiles where id = auth.uid();
  return r;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  assigned_role text;
  email_host text;
begin
  email_host := lower(split_part(coalesce(new.email, ''), '@', 2));

  if email_host not in ('upeoafricatechnologies.co.ke', 'averissystems.com') then
    raise exception 'This desk is reserved for people who already work here.';
  end if;

  if (select count(*) from public.profiles) = 0 then
    assigned_role := 'owner';
  else
    assigned_role := 'editor';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email, 'staff'), '@', 1)),
    assigned_role
  );
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'editor' check (role = any (array['owner', 'editor', 'sales'])),
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.site_settings (
  id integer primary key default 1 check (id = 1),
  cal_com_embed_url text,
  gtm_id text,
  social_publish_webhook_url text,
  google_review_url text,
  linkedin_url text,
  x_url text,
  github_url text,
  locale text not null default 'en',
  updated_at timestamptz not null default now(),
  legal_name text,
  trading_name text,
  phone text,
  public_email text,
  address_line text,
  logo_path text,
  invoice_prefix text not null default 'UAT',
  invoice_next_number integer not null default 1,
  kra_pin text,
  vat_percent numeric,
  payment_note text,
  autoresponder_enabled boolean not null default true,
  autoresponder_hours integer not null default 24,
  autoresponder_subject text,
  autoresponder_body text
);

create or replace function public.next_invoice_number()
returns text
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  prefix text;
  n integer;
  year text;
begin
  if not is_staff() then
    raise exception 'Not allowed';
  end if;
  year := to_char(timezone('Africa/Nairobi', now()), 'YYYY');
  select coalesce(nullif(invoice_prefix, ''), 'UAT'), coalesce(invoice_next_number, 1)
    into prefix, n
  from public.site_settings where id = 1 for update;
  update public.site_settings set invoice_next_number = n + 1 where id = 1;
  return prefix || '-' || year || '-' || lpad(n::text, 4, '0');
end;
$$;

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source = any (array['contact_form', 'inquiry'])),
  name text not null,
  email text not null,
  phone text,
  company text,
  services text[] not null default '{}',
  stage text,
  timeline text,
  budget text,
  message text,
  status text not null default 'new' check (status = any (array['new', 'contacted', 'qualified', 'won', 'lost'])),
  notes text,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index leads_created_at_idx on public.leads (created_at desc);
create index leads_status_idx on public.leads (status);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_path text,
  url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  billing_email text,
  phone text,
  kra_pin text
);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_path text,
  url text,
  relationship text not null default 'other' check (relationship = any (array['official_dev_partner', 'technology', 'other'])),
  blurb text not null default '',
  featured boolean not null default false,
  sort_order integer not null default 0,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  client_id uuid references public.clients (id) on delete set null,
  summary text not null default '',
  body text not null default '',
  industry text,
  services text[] not null default '{}',
  outcomes text[] not null default '{}',
  cover_path text,
  gallery text[] not null default '{}',
  video_url text,
  featured boolean not null default false,
  published_at timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  body text not null default '',
  cover_path text,
  tags text[] not null default '{}',
  audience text not null default 'general' check (audience = any (array['founders', 'general'])),
  published_at timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  type text not null check (type = any (array['plugin', 'download', 'saas'])),
  price_kes integer not null default 0,
  description text not null default '',
  version text,
  file_path text,
  changelog text,
  cover_path text,
  published boolean not null default false,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  body text not null default '',
  venue text,
  mode text not null default 'in_person' check (mode = any (array['in_person', 'online', 'hybrid'])),
  starts_at timestamptz not null,
  ends_at timestamptz,
  cover_path text,
  capacity integer,
  published_at timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  price_kes numeric not null default 0,
  quota integer,
  sort_order integer not null default 0
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text not null check (provider = any (array['youtube', 'vimeo', 'file'])),
  url text,
  storage_path text,
  case_study_id uuid references public.case_studies (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  published_at timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  phone text,
  product_id uuid references public.products (id),
  amount_kes integer not null,
  provider text not null default 'intasend',
  provider_ref text,
  status text not null default 'pending' check (status = any (array['pending', 'paid', 'failed'])),
  download_expires_at timestamptz,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  kind text not null default 'product',
  event_id uuid references public.events (id) on delete set null,
  ticket_type_id uuid references public.ticket_types (id) on delete set null,
  attendee_name text
);

create index orders_created_at_idx on public.orders (created_at desc);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  client_id uuid references public.clients (id) on delete set null,
  lead_id uuid references public.leads (id) on delete set null,
  bill_name text not null,
  bill_email text not null,
  bill_phone text,
  bill_company text,
  status text not null default 'draft' check (status = any (array['draft', 'sent', 'paid', 'void'])),
  notes text,
  payment_note text,
  subtotal_kes numeric not null default 0,
  vat_percent numeric,
  vat_kes numeric not null default 0,
  total_kes numeric not null default 0,
  sent_at timestamptz,
  paid_at timestamptz,
  provider_ref text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  from_block text,
  bill_to_block text,
  ship_to text,
  issued_on date,
  due_on date,
  po_number text,
  thank_you text,
  discount_kes numeric not null default 0,
  discount_percent numeric,
  shipping_kes numeric not null default 0,
  amount_paid_kes numeric not null default 0
);

comment on column public.invoices.notes is 'Service specifications shown on the invoice document.';
comment on column public.invoices.from_block is 'Editable from/sender address block.';
comment on column public.invoices.bill_to_block is 'Editable bill-to block on the invoice document.';

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  description text not null,
  qty numeric not null default 1,
  unit_kes numeric not null default 0,
  line_kes numeric not null default 0,
  sort_order integer not null default 0
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders (id) on delete cascade,
  provider text not null default 'intasend',
  result text,
  payload jsonb not null default '{}',
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  invoice_id uuid references public.invoices (id) on delete set null
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  bucket text not null default 'public-media',
  alt text not null default '',
  kind text not null check (kind = any (array['image', 'video', 'file'])),
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text not null default '',
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  subject text not null,
  lead_id uuid references public.leads (id) on delete set null,
  order_id uuid references public.orders (id) on delete set null,
  invoice_id uuid references public.invoices (id) on delete set null,
  resend_id text,
  created_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger site_settings_updated_at before update on public.site_settings for each row execute function public.set_updated_at();
create trigger leads_updated_at before update on public.leads for each row execute function public.set_updated_at();
create trigger clients_updated_at before update on public.clients for each row execute function public.set_updated_at();
create trigger partners_updated_at before update on public.partners for each row execute function public.set_updated_at();
create trigger case_studies_updated_at before update on public.case_studies for each row execute function public.set_updated_at();
create trigger articles_updated_at before update on public.articles for each row execute function public.set_updated_at();
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger videos_updated_at before update on public.videos for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
create trigger media_updated_at before update on public.media for each row execute function public.set_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.next_invoice_number() from public, anon;
grant execute on function public.next_invoice_number() to authenticated;
grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.is_owner() to anon, authenticated, service_role;
grant execute on function public.can_edit() to anon, authenticated, service_role;
grant execute on function public.staff_role() to anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.partners enable row level security;
alter table public.case_studies enable row level security;
alter table public.articles enable row level security;
alter table public.products enable row level security;
alter table public.events enable row level security;
alter table public.ticket_types enable row level security;
alter table public.videos enable row level security;
alter table public.orders enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.payments enable row level security;
alter table public.media enable row level security;
alter table public.notifications enable row level security;
alter table public.email_log enable row level security;

grant all privileges on all tables in schema public to anon, authenticated, service_role;

create policy profiles_select_own on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_select_staff on public.profiles for select to authenticated using (is_staff());
create policy profiles_update_owner on public.profiles for update to authenticated using (is_owner()) with check (is_owner());
create policy profiles_update_self on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

create policy settings_select_public on public.site_settings for select to anon, authenticated using (true);
create policy settings_update_owner on public.site_settings for update to authenticated using (is_owner()) with check (is_owner());

create policy leads_insert_public on public.leads for insert to anon, authenticated with check (status = 'new' and notes is null);
create policy leads_select_staff on public.leads for select to authenticated using (is_staff());
create policy leads_update_staff on public.leads for update to authenticated using (is_staff()) with check (is_staff());

create policy clients_select_public on public.clients for select to anon, authenticated using (true);
create policy clients_write_editors on public.clients for all to authenticated using (can_edit()) with check (can_edit());

create policy partners_select_public on public.partners for select to anon, authenticated using (true);
create policy partners_write_editors on public.partners for all to authenticated using (can_edit()) with check (can_edit());

create policy case_studies_select_public on public.case_studies for select to anon, authenticated using (published_at is not null or is_staff());
create policy case_studies_write_editors on public.case_studies for all to authenticated using (can_edit()) with check (can_edit());

create policy articles_select_public on public.articles for select to anon, authenticated using (published_at is not null or is_staff());
create policy articles_write_editors on public.articles for all to authenticated using (can_edit()) with check (can_edit());

create policy products_select_public on public.products for select to anon, authenticated using (published = true or is_staff());
create policy products_write_editors on public.products for all to authenticated using (can_edit()) with check (can_edit());

create policy events_select_public on public.events for select to anon, authenticated using (published_at is not null or is_staff());
create policy events_write_editors on public.events for all to authenticated using (can_edit()) with check (can_edit());

create policy ticket_types_select_public on public.ticket_types for select to anon, authenticated
  using (exists (select 1 from public.events e where e.id = ticket_types.event_id and (e.published_at is not null or is_staff())));
create policy ticket_types_write_editors on public.ticket_types for all to authenticated using (can_edit()) with check (can_edit());

create policy videos_select_public on public.videos for select to anon, authenticated using (published_at is not null or is_staff());
create policy videos_write_editors on public.videos for all to authenticated using (can_edit()) with check (can_edit());

create policy orders_insert_public on public.orders for insert to anon, authenticated with check (status = 'pending');
create policy orders_select_staff on public.orders for select to authenticated using (is_staff());
create policy orders_update_staff on public.orders for update to authenticated using (can_edit()) with check (can_edit());

create policy invoices_staff on public.invoices for all to authenticated using (is_staff()) with check (is_staff());
create policy invoice_items_staff on public.invoice_items for all to authenticated using (is_staff()) with check (is_staff());

create policy payments_insert_staff on public.payments for insert to authenticated with check (is_staff());
create policy payments_select_staff on public.payments for select to authenticated using (is_staff());

create policy media_select_staff on public.media for select to authenticated using (is_staff());
create policy media_write_editors on public.media for all to authenticated using (can_edit()) with check (can_edit());

create policy notifications_staff on public.notifications for all to authenticated using (is_staff()) with check (is_staff());
create policy email_log_staff on public.email_log for all to authenticated using (is_staff()) with check (is_staff());

insert into storage.buckets (id, name, public, file_size_limit)
values
  ('public-media', 'public-media', true, 10485760),
  ('product-files', 'product-files', false, 52428800);

create policy media_bucket_public_read on storage.objects for select to anon, authenticated using (bucket_id = 'public-media');
create policy product_files_staff_read on storage.objects for select to authenticated using (bucket_id = 'product-files' and is_staff());
create policy media_bucket_staff_write on storage.objects for insert to authenticated with check (bucket_id = any (array['public-media', 'product-files']) and can_edit());
create policy media_bucket_staff_update on storage.objects for update to authenticated
  using (bucket_id = any (array['public-media', 'product-files']) and can_edit())
  with check (bucket_id = any (array['public-media', 'product-files']) and can_edit());
create policy media_bucket_staff_delete on storage.objects for delete to authenticated
  using (bucket_id = any (array['public-media', 'product-files']) and can_edit());
