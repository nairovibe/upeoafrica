alter table public.products
  add column if not exists gallery text[] not null default '{}';
