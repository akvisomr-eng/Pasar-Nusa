-- 0007: harden checkout input validation and keep IDR totals safely representable in JS.
begin;

alter table public.products
  add constraint products_price_idr_safe_check check (price_idr <= 9007199254740991);
alter table public.orders
  add constraint orders_subtotal_idr_safe_check check (subtotal_idr <= 9007199254740991);
alter table public.order_items
  add constraint order_items_unit_price_idr_safe_check check (unit_price_idr <= 9007199254740991);

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
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'cart must be a JSON array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 20 then
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
     for update of p, i, s;
    if not found or v_product_status <> 'active' or v_store_status <> 'active' then
      raise exception 'product is not available' using errcode = 'P0001';
    end if;
    if v_on_hand - v_reserved < v_quantity then
      raise exception 'insufficient stock for product %', v_product_id using errcode = 'P0001';
    end if;
    if v_price < 0 or (v_price::numeric * v_quantity::numeric) > 9007199254740991::numeric
       or (v_subtotal::numeric + v_price::numeric * v_quantity::numeric) > 9000000000000000000::numeric then
      raise exception 'invalid price or order total' using errcode = '22003';
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
revoke all on function public.checkout_order(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.checkout_order(jsonb, text, text) to authenticated;

commit;