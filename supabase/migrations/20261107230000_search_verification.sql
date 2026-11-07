alter table public.site_settings
  add column if not exists google_site_verification text,
  add column if not exists bing_site_verification text,
  add column if not exists baidu_site_verification text,
  add column if not exists yandex_site_verification text,
  add column if not exists facebook_domain_verification text,
  add column if not exists meta_pixel_id text,
  add column if not exists google_ads_id text,
  add column if not exists thank_you_note text;

update public.site_settings
set google_site_verification = 'WvISEi4b4smIm2spDJfIUWGCecyCqRq-WS5bdXAyj_M'
where id = 1
  and (google_site_verification is null or google_site_verification = '');
