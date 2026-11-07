create table public.experts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  title text not null default '',
  discipline text not null default 'engineering' check (discipline = any (array['leadership','engineering','design','marketing'])),
  bio text not null default '',
  photo_path text,
  sort_order integer not null default 0,
  published boolean not null default false,
  locale text not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create trigger experts_updated_at
  before update on public.experts
  for each row execute function public.set_updated_at();

alter table public.experts enable row level security;

create policy experts_select_public
  on public.experts for select
  to anon, authenticated
  using (published = true);

create policy experts_select_staff
  on public.experts for select
  to authenticated
  using (is_staff());

create policy experts_write_editors
  on public.experts for all
  to authenticated
  using (can_edit())
  with check (can_edit());

grant select on public.experts to anon;
grant select, insert, update, delete on public.experts to authenticated, service_role;

update public.site_settings
set cal_com_embed_url = 'https://cal.com/upeoafricatechnologies'
where id = 1 and (cal_com_embed_url is null or btrim(cal_com_embed_url) = '');
