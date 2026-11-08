-- Soft trash for the content desks, plus the signed-in person's photo and login sessions.

alter table public.experts add column if not exists deleted_at timestamptz;
alter table public.case_studies add column if not exists deleted_at timestamptz;
alter table public.clients add column if not exists deleted_at timestamptz;
alter table public.partners add column if not exists deleted_at timestamptz;
alter table public.videos add column if not exists deleted_at timestamptz;
alter table public.products add column if not exists deleted_at timestamptz;
alter table public.events add column if not exists deleted_at timestamptz;

create index if not exists experts_deleted_at_idx on public.experts (deleted_at);
create index if not exists case_studies_deleted_at_idx on public.case_studies (deleted_at);
create index if not exists clients_deleted_at_idx on public.clients (deleted_at);
create index if not exists partners_deleted_at_idx on public.partners (deleted_at);
create index if not exists videos_deleted_at_idx on public.videos (deleted_at);
create index if not exists products_deleted_at_idx on public.products (deleted_at);
create index if not exists events_deleted_at_idx on public.events (deleted_at);

alter table public.profiles add column if not exists avatar_path text;
alter table public.articles add column if not exists author_id uuid references public.profiles (id) on delete set null;
alter table public.articles add column if not exists author_photo_path text;

create table if not exists public.staff_session_places (
  session_id uuid primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  place text not null,
  device text not null default '',
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.staff_session_places enable row level security;

drop policy if exists staff_session_places_select on public.staff_session_places;
create policy staff_session_places_select on public.staff_session_places
  for select to authenticated using (user_id = auth.uid());

drop policy if exists staff_session_places_insert on public.staff_session_places;
create policy staff_session_places_insert on public.staff_session_places
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists staff_session_places_update on public.staff_session_places;
create policy staff_session_places_update on public.staff_session_places
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update on public.staff_session_places to authenticated;

-- Public reads hide the trash. Staff keep a separate policy, or the same policy still lets staff through.
drop policy if exists experts_select_public on public.experts;
create policy experts_select_public on public.experts
  for select to anon, authenticated
  using (published = true and deleted_at is null);

drop policy if exists clients_select_public on public.clients;
create policy clients_select_public on public.clients
  for select to anon, authenticated
  using (deleted_at is null);

drop policy if exists clients_select_staff on public.clients;
create policy clients_select_staff on public.clients
  for select to authenticated
  using (is_staff());

drop policy if exists partners_select_public on public.partners;
create policy partners_select_public on public.partners
  for select to anon, authenticated
  using (deleted_at is null);

drop policy if exists partners_select_staff on public.partners;
create policy partners_select_staff on public.partners
  for select to authenticated
  using (is_staff());

drop policy if exists case_studies_select_public on public.case_studies;
create policy case_studies_select_public on public.case_studies
  for select to anon, authenticated
  using ((published_at is not null and deleted_at is null) or is_staff());

drop policy if exists products_select_public on public.products;
create policy products_select_public on public.products
  for select to anon, authenticated
  using ((published = true and deleted_at is null) or is_staff());

drop policy if exists events_select_public on public.events;
create policy events_select_public on public.events
  for select to anon, authenticated
  using ((published_at is not null and deleted_at is null) or is_staff());

drop policy if exists videos_select_public on public.videos;
create policy videos_select_public on public.videos
  for select to anon, authenticated
  using ((published_at is not null and deleted_at is null) or is_staff());

create or replace function public.my_login_sessions()
returns table (
  id uuid,
  user_agent text,
  ip text,
  created_at timestamptz,
  updated_at timestamptz,
  place text,
  device text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.user_agent, host(s.ip), s.created_at, s.updated_at, p.place, p.device
  from auth.sessions s
  left join public.staff_session_places p on p.session_id = s.id and p.user_id = s.user_id
  where s.user_id = auth.uid()
  order by s.updated_at desc;
$$;

create or replace function public.revoke_my_session(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or target is null then
    return;
  end if;
  delete from auth.sessions where id = target and user_id = auth.uid();
  delete from public.staff_session_places where session_id = target and user_id = auth.uid();
end;
$$;

revoke all on function public.my_login_sessions() from public;
revoke all on function public.revoke_my_session(uuid) from public;
grant execute on function public.my_login_sessions() to authenticated;
grant execute on function public.revoke_my_session(uuid) to authenticated;
