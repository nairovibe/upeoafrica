alter table public.media
  add column if not exists title text not null default '',
  add column if not exists caption text not null default '',
  add column if not exists description text not null default '';
