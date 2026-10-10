-- 0004: guarded seller moderation controls.
begin;

create policy "platform admins read all stores" on public.stores for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'platform_admin')
);
create policy "platform admins read all products" on public.products for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'platform_admin')
);

create or replace function public.admin_set_store_status(p_store_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_updated integer;
begin
  if v_actor is null or not exists (
    select 1 from public.profiles p where p.id = v_actor and p.role = 'platform_admin'
  ) then
    raise exception 'platform admin permission required' using errcode = '42501';
  end if;
  if p_status not in ('active','paused','rejected') then
    raise exception 'invalid store status transition' using errcode = '22023';
  end if;
  update public.stores set status = p_status, updated_at = now() where id = p_store_id and status in ('pending','active','paused');
  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
    values (v_actor, 'store.status_change', 'store', p_store_id, jsonb_build_object('status', p_status));
  end if;
  return v_updated = 1;
end;
$$;
revoke all on function public.admin_set_store_status(uuid, text) from public;
grant execute on function public.admin_set_store_status(uuid, text) to authenticated;

create or replace function public.admin_set_product_status(p_product_id uuid, p_status text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_updated integer;
begin
  if v_actor is null or not exists (
    select 1 from public.profiles p where p.id = v_actor and p.role = 'platform_admin'
  ) then
    raise exception 'platform admin permission required' using errcode = '42501';
  end if;
  if p_status not in ('active','paused','archived','draft') then
    raise exception 'invalid product status transition' using errcode = '22023';
  end if;
  if p_status = 'active' and not exists (
    select 1 from public.products p
    join public.stores s on s.id = p.store_id
    join public.inventory i on i.product_id = p.id
    where p.id = p_product_id and s.status = 'active' and i.on_hand > i.reserved
  ) then
    raise exception 'store must be active and stock must be available' using errcode = 'P0001';
  end if;
  update public.products set status = p_status, updated_at = now() where id = p_product_id;
  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
    values (v_actor, 'product.status_change', 'product', p_product_id, jsonb_build_object('status', p_status));
  end if;
  return v_updated = 1;
end;
$$;
revoke all on function public.admin_set_product_status(uuid, text) from public;
grant execute on function public.admin_set_product_status(uuid, text) to authenticated;

commit;