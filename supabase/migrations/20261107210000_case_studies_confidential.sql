alter table public.case_studies
  add column if not exists confidential boolean not null default false;

comment on column public.case_studies.confidential is
  'When true, the public site lists the project without the client name, testimonial, or live preview.';
