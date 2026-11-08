alter table public.products
  add column if not exists price_tiers jsonb not null default '[]'::jsonb;

alter table public.orders
  add column if not exists tier_label text;
