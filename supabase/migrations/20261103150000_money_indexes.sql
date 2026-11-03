create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_product_idx on public.orders (product_id) where product_id is not null;
create index if not exists payments_order_idx on public.payments (order_id) where order_id is not null;
create index if not exists payments_invoice_idx on public.payments (invoice_id) where invoice_id is not null;
