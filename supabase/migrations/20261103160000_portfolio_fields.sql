alter table public.case_studies
  add column if not exists project_year integer check (project_year between 2000 and 2100),
  add column if not exists project_url text,
  add column if not exists role text,
  add column if not exists tech_stack text[] not null default '{}',
  add column if not exists testimonial_quote text,
  add column if not exists testimonial_author text,
  add column if not exists testimonial_title text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists meta_title text,
  add column if not exists meta_description text;

create index if not exists case_studies_public_idx
  on public.case_studies (featured desc, sort_order, published_at desc)
  where published_at is not null;
