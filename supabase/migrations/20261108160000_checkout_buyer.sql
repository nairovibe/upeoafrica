alter table public.orders
  add column if not exists website_url text,
  add column if not exists list_amount integer,
  add column if not exists fx_rate numeric,
  add column if not exists batch_id uuid;

create index if not exists orders_batch_id_idx on public.orders (batch_id);
