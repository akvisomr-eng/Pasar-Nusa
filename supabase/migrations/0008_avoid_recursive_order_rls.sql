-- 0008: avoid recursive RLS evaluation between orders and order_items.
begin;

create or replace function public.can_view_order_as_seller(p_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
      from public.order_items oi
      join public.stores s on s.id = oi.store_id
     where oi.order_id = p_order_id
       and s.owner_id = auth.uid()
  );
$$;
revoke all on function public.can_view_order_as_seller(uuid) from public, anon, authenticated;
grant execute on function public.can_view_order_as_seller(uuid) to authenticated;

drop policy if exists "seller reads orders for own store items" on public.orders;
create policy "seller reads orders for own store items" on public.orders
for select to authenticated
using (public.can_view_order_as_seller(id));

commit;