-- Payment methods for invoices. Secrets live in a table with no client access.

create table if not exists public.billing_methods (
  id text primary key,
  enabled boolean not null default false,
  public_config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.billing_secrets (
  method_id text primary key references public.billing_methods (id) on delete cascade,
  ciphertext text not null,
  updated_at timestamptz not null default now()
);

alter table public.billing_methods enable row level security;
alter table public.billing_secrets enable row level security;

revoke all on public.billing_methods from anon, authenticated;
revoke all on public.billing_secrets from anon, authenticated;
grant select on public.billing_methods to authenticated;

drop policy if exists billing_methods_owner_select on public.billing_methods;
create policy billing_methods_owner_select on public.billing_methods
  for select to authenticated
  using (public.is_owner());

insert into public.billing_methods (id) values ('mpesa'), ('card'), ('airtel'), ('paypal'), ('bank')
on conflict (id) do nothing;
