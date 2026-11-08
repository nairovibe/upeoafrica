alter table public.products
  add column if not exists currency text not null default 'KES';

alter table public.products
  drop constraint if exists products_currency_check;

alter table public.products
  add constraint products_currency_check check (currency in ('KES', 'USD'));

alter table public.events
  add column if not exists currency text not null default 'KES';

alter table public.events
  drop constraint if exists events_currency_check;

alter table public.events
  add constraint events_currency_check check (currency in ('KES', 'USD'));

alter table public.orders
  add column if not exists currency text not null default 'KES';

alter table public.orders
  drop constraint if exists orders_currency_check;

alter table public.orders
  add constraint orders_currency_check check (currency in ('KES', 'USD'));
