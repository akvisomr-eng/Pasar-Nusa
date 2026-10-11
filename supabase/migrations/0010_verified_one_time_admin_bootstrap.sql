-- 0010: make the first-owner bootstrap verified and one-time.
begin;

create or replace function public.bootstrap_platform_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_email text;
  v_confirmed_at timestamptz;
  v_updated integer;
begin
  if v_actor is null then
    return false;
  end if;

  -- Verify against auth.users, not a caller-controlled JWT metadata field.
  select lower(u.email), u.email_confirmed_at
    into v_email, v_confirmed_at
    from auth.users u
   where u.id = v_actor;

  if v_email <> 'akvisomr@gmail.com' or v_confirmed_at is null then
    return false;
  end if;

  -- Permit only the initial bootstrap, or a no-op recheck by the existing admin.
  if exists (
    select 1 from public.profiles p
     where p.role = 'platform_admin' and p.id <> v_actor
  ) then
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