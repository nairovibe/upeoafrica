drop policy if exists articles_select_public on public.articles;
create policy articles_select_public on public.articles for select to anon, authenticated
  using ((published_at is not null and published_at <= now()) or is_staff());
