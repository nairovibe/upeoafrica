alter table public.newsletter_subscribers
  add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists newsletter_subscribers_unsubscribe_token_idx
  on public.newsletter_subscribers (unsubscribe_token);

create table if not exists public.newsletter_campaigns (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind = any (array['article', 'event', 'note'])),
  subject text not null,
  intro text not null default '',
  link_url text,
  link_label text,
  sent_count integer not null default 0,
  failed_count integer not null default 0,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.newsletter_campaigns enable row level security;

create policy newsletter_campaigns_select_staff
  on public.newsletter_campaigns for select
  to authenticated
  using (is_staff());

create policy newsletter_campaigns_insert_editors
  on public.newsletter_campaigns for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = any (array['owner', 'editor'])
    )
  );

grant select, insert on public.newsletter_campaigns to authenticated, service_role;
