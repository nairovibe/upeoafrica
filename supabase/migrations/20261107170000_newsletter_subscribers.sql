create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'subscribed' check (status = any (array['subscribed', 'unsubscribed'])),
  source text not null default 'footer' check (source = any (array['footer', 'console'])),
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  constraint newsletter_subscribers_email_key unique (email),
  constraint newsletter_subscribers_email_lower check (email = lower(email))
);

create index newsletter_subscribers_status_created_idx
  on public.newsletter_subscribers (status, created_at desc);

alter table public.newsletter_subscribers enable row level security;

create policy newsletter_select_staff
  on public.newsletter_subscribers for select
  to authenticated
  using (is_staff());

create policy newsletter_write_staff
  on public.newsletter_subscribers for all
  to authenticated
  using (is_staff())
  with check (is_staff());

grant select, insert, update, delete on public.newsletter_subscribers to authenticated, service_role;
