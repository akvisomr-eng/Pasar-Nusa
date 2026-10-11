-- 0009: narrowly scoped owner bootstrap for the verified platform account.
begin;

create or replace function public.bootstrap_platform_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_updated integer;
begin
  if v_actor is null or v_email <> 'akvisomr@gmail.com' then
    return false;
  end if;

  update public.profiles
     set role = 'platform_admin', updated_at = now()
   where id = v_actor;
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

revoke all on function public.bootstrap_platform_admin() from public, anon;
grant execute on function public.bootstrap_platform_admin() to authenticated;

commit;