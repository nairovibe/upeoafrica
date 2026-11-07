alter table public.articles
  add column if not exists deleted_at timestamptz;

create index if not exists articles_active_updated_idx
  on public.articles (updated_at desc)
  where deleted_at is null;

drop policy if exists articles_select_public on public.articles;
create policy articles_select_public on public.articles
  for select to anon, authenticated
  using (
    (deleted_at is null and published_at is not null and published_at <= now())
    or is_staff()
  );
