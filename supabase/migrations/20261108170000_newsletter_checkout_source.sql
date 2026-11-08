alter table public.newsletter_subscribers drop constraint if exists newsletter_subscribers_source_check;
alter table public.newsletter_subscribers
  add constraint newsletter_subscribers_source_check
  check (source = any (array['footer', 'console', 'checkout']));
