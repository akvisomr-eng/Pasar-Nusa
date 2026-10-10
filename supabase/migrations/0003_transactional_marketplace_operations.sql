-- 0003: transactional marketplace operations.
-- No payment capture, wallet, escrow, or automatic seller substitution.
begin;

create or replace function public.ensure_product_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inventory(product_id, on_hand, reserved)
  values (new.id, 0, 0)
  on conflict (product_id) do nothing;
  return new;
end;
$$;

drop trigger if exists products_create_inventory on public.products;
create trigger products_create_inventory
  after insert on public.products
  for each row execute procedure public.ensure_product_inventory();

create or replace function public.set_inventory_on_hand(p_product_id uuid, p_on_hand integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_updated integer;
begin
  if v_actor is null or p_on_hand is null or p_on_hand < 0 then
    raise exception 'invalid inventory request' using errcode = '22023';
  end if;

  update public.inventory i
     set on_hand = p_on_hand, updated_at = now()
    from public.products p
    join public.stores s on s.id = p.store_id
   where i.product_id = p_product_id
     and p.id = i.product_id
     and s.owner_id = v_actor
     and p.status in ('draft', 'active', 'paused')
     and p_on_hand >= i.reserved;
  get diagnostics v_updated = row_count;
  if v_updated = 1 then
    insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
    values (v_actor, 'inventory.set_on_hand', 'product', p_product_id, jsonb_build_object('on_hand', p_on_hand));
  end if;
  return v_updated = 1;
end;
$$;
revoke all on function public.set_inventory_on_hand(uuid, integer) from public;
grant execute on function public.set_inventory_on_hand(uuid, integer) to authenticated;

create or replace function public.checkout_order(
  p_items jsonb,
  p_buyer_note text,
  p_idempotency_key text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_buyer uuid := auth.uid();
  v_existing uuid;
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_name text;
  v_brand text;
  v_unit text;
  v_price bigint;
  v_store_id uuid;
  v_store_status text;
  v_product_status public.product_status;
  v_on_hand integer;
  v_reserved integer;
  v_subtotal bigint := 0;
  v_order_id uuid;
  v_seen uuid[] := array[]::uuid[];
begin
  if v_buyer is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
    raise exception 'cart must contain between 1 and 20 lines' using errcode = '22023';
  end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) < 8 or char_length(p_idempotency_key) > 120 then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if char_length(coalesce(p_buyer_note, '')) > 1000 then
    raise exception 'buyer note too long' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_buyer::text || ':' || p_idempotency_key, 0));
  select o.id into v_existing from public.orders o
   where o.buyer_id = v_buyer and o.idempotency_key = p_idempotency_key;
  if v_existing is not null then return v_existing; end if;

  -- Lock product and inventory rows in deterministic order to prevent overselling/deadlocks.
  for v_item in
    select x.value from jsonb_array_elements(p_items) as x(value)
    order by x.value ->> 'product_id'
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_product_id is null or v_quantity is null or v_quantity < 1 or v_quantity > 10000 then
      raise exception 'invalid product or quantity' using errcode = '22023';
    end if;
    if v_product_id = any(v_seen) then
      raise exception 'duplicate product lines are not allowed' using errcode = '22023';
    end if;
    v_seen := array_append(v_seen, v_product_id);

    select p.name, p.brand, p.unit_label, p.price_idr, p.store_id, s.status, p.status, i.on_hand, i.reserved
      into v_name, v_brand, v_unit, v_price, v_store_id, v_store_status, v_product_status, v_on_hand, v_reserved
      from public.products p
      join public.stores s on s.id = p.store_id
      join public.inventory i on i.product_id = p.id
     where p.id = v_product_id
     for update of p, i;
    if not found or v_product_status <> 'active' or v_store_status <> 'active' then
      raise exception 'product is not available' using errcode = 'P0001';
    end if;
    if v_on_hand - v_reserved < v_quantity then
      raise exception 'insufficient stock for product %', v_product_id using errcode = 'P0001';
    end if;
    if v_price < 0 or (v_price::numeric * v_quantity::numeric) > 9000000000000000000::numeric then
      raise exception 'invalid price or quantity total' using errcode = '22003';
    end if;
    v_subtotal := v_subtotal + (v_price * v_quantity);
  end loop;

  insert into public.orders(buyer_id, status, subtotal_idr, buyer_note, idempotency_key)
  values (v_buyer, 'pending_seller', v_subtotal, coalesce(p_buyer_note, ''), p_idempotency_key)
  returning id into v_order_id;

  for v_item in
    select x.value from jsonb_array_elements(p_items) as x(value)
    order by x.value ->> 'product_id'
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;
    select p.name, p.brand, p.unit_label, p.price_idr, p.store_id
      into v_name, v_brand, v_unit, v_price, v_store_id
      from public.products p where p.id = v_product_id;
    update public.inventory
       set reserved = reserved + v_quantity, updated_at = now()
     where product_id = v_product_id;
    insert into public.order_items(order_id, product_id, store_id, product_name_snapshot, brand_snapshot, unit_snapshot, unit_price_idr, quantity)
    values (v_order_id, v_product_id, v_store_id, v_name, v_brand, v_unit, v_price, v_quantity);
  end loop;

  insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
  values (v_buyer, 'order.checkout', 'order', v_order_id, jsonb_build_object('line_count', jsonb_array_length(p_items), 'subtotal_idr', v_subtotal));
  return v_order_id;
end;
$$;
revoke all on function public.checkout_order(jsonb, text, text) from public;
grant execute on function public.checkout_order(jsonb, text, text) to authenticated;

create policy "seller reads orders for own store items" on public.orders for select to authenticated using (
  exists (
    select 1 from public.order_items oi
    join public.stores s on s.id = oi.store_id
    where oi.order_id = orders.id and s.owner_id = (select auth.uid())
  )
);

create or replace function public.seller_decide_order_item(p_item_id uuid, p_accept boolean)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_order_id uuid;
  v_product_id uuid;
  v_store_id uuid;
  v_quantity integer;
  v_status public.order_item_status;
  v_updated integer;
begin
  if v_actor is null or p_accept is null then
    raise exception 'invalid seller decision' using errcode = '22023';
  end if;
  select oi.order_id, oi.product_id, oi.store_id, oi.quantity, oi.status
    into v_order_id, v_product_id, v_store_id, v_quantity, v_status
    from public.order_items oi
    join public.stores s on s.id = oi.store_id
   where oi.id = p_item_id and s.owner_id = v_actor
   for update of oi;
  if not found or v_status <> 'pending_seller' then
    raise exception 'item not found or no longer pending' using errcode = 'P0001';
  end if;

  if p_accept then
    update public.order_items set status = 'accepted' where id = p_item_id;
  else
    update public.inventory set reserved = reserved - v_quantity, updated_at = now()
      where product_id = v_product_id and reserved >= v_quantity;
    get diagnostics v_updated = row_count;
    if v_updated <> 1 then raise exception 'inventory reservation invariant failed'; end if;
    update public.order_items set status = 'rejected' where id = p_item_id;
  end if;

  update public.orders o
     set status = case
       when exists (select 1 from public.order_items x where x.order_id = v_order_id and x.status = 'pending_seller') then 'pending_seller'::public.order_status
       when exists (select 1 from public.order_items x where x.order_id = v_order_id and x.status = 'accepted') then 'accepted'::public.order_status
       when exists (select 1 from public.order_items x where x.order_id = v_order_id and x.status = 'fulfilled') then 'fulfilled'::public.order_status
       else 'rejected'::public.order_status
     end,
     updated_at = now()
   where o.id = v_order_id;

  insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
  values (v_actor, case when p_accept then 'order_item.accept' else 'order_item.reject' end, 'order_item', p_item_id,
          jsonb_build_object('order_id', v_order_id, 'quantity', v_quantity));
  return true;
end;
$$;
revoke all on function public.seller_decide_order_item(uuid, boolean) from public;
grant execute on function public.seller_decide_order_item(uuid, boolean) to authenticated;

create or replace function public.complete_order_item(p_item_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_order_id uuid;
  v_product_id uuid;
  v_store_id uuid;
  v_quantity integer;
  v_status public.order_item_status;
  v_updated integer;
begin
  if v_actor is null then raise exception 'authentication required' using errcode = '28000'; end if;
  select oi.order_id, oi.product_id, oi.store_id, oi.quantity, oi.status
    into v_order_id, v_product_id, v_store_id, v_quantity, v_status
    from public.order_items oi
    join public.stores s on s.id = oi.store_id
   where oi.id = p_item_id and s.owner_id = v_actor
   for update of oi;
  if not found or v_status <> 'accepted' then
    raise exception 'item not found or not accepted' using errcode = 'P0001';
  end if;
  update public.inventory
     set on_hand = on_hand - v_quantity, reserved = reserved - v_quantity, updated_at = now()
   where product_id = v_product_id and on_hand >= v_quantity and reserved >= v_quantity;
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then raise exception 'inventory invariant failed'; end if;
  update public.order_items set status = 'fulfilled' where id = p_item_id;
  update public.orders o
     set status = case
       when exists (select 1 from public.order_items x where x.order_id = v_order_id and x.status in ('pending_seller','accepted')) then 'accepted'::public.order_status
       when exists (select 1 from public.order_items x where x.order_id = v_order_id and x.status = 'fulfilled') then 'fulfilled'::public.order_status
       else 'rejected'::public.order_status
     end,
     updated_at = now()
   where o.id = v_order_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
  values (v_actor, 'order_item.fulfill', 'order_item', p_item_id, jsonb_build_object('order_id', v_order_id, 'quantity', v_quantity));
  return true;
end;
$$;
revoke all on function public.complete_order_item(uuid) from public;
grant execute on function public.complete_order_item(uuid) to authenticated;

create or replace function public.cancel_order_by_buyer(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_status public.order_status;
  v_item record;
begin
  if v_actor is null then raise exception 'authentication required' using errcode = '28000'; end if;
  select status into v_status from public.orders where id = p_order_id and buyer_id = v_actor for update;
  if not found or v_status <> 'pending_seller' then
    raise exception 'order not found or can no longer be cancelled' using errcode = 'P0001';
  end if;
  for v_item in select id, product_id, quantity, status from public.order_items where order_id = p_order_id for update
  loop
    if v_item.status in ('pending_seller','accepted') then
      update public.inventory set reserved = reserved - v_item.quantity, updated_at = now()
        where product_id = v_item.product_id and reserved >= v_item.quantity;
      if not found then raise exception 'inventory reservation invariant failed'; end if;
      update public.order_items set status = 'cancelled' where id = v_item.id;
    end if;
  end loop;
  update public.orders set status = 'cancelled', updated_at = now() where id = p_order_id;
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, details)
  values (v_actor, 'order.cancel', 'order', p_order_id, '{}'::jsonb);
  return true;
end;
$$;
revoke all on function public.cancel_order_by_buyer(uuid) from public;
grant execute on function public.cancel_order_by_buyer(uuid) to authenticated;

commit;