alter table public.experts
  add column if not exists email text,
  add column if not exists linkedin_url text,
  add column if not exists x_url text,
  add column if not exists facebook_url text,
  add column if not exists instagram_url text,
  add column if not exists github_url text;
