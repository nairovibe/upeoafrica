create or replace function public.keep_one_owner()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if old.role = 'owner' and (tg_op = 'DELETE' or new.role <> 'owner') then
    if not exists (select 1 from public.profiles where role = 'owner' and id <> old.id) then
      raise exception 'The desk needs at least one owner.';
    end if;
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

revoke all on function public.keep_one_owner() from public, anon, authenticated;

drop trigger if exists profiles_keep_one_owner on public.profiles;
create trigger profiles_keep_one_owner
before update of role or delete on public.profiles
for each row execute function public.keep_one_owner();
