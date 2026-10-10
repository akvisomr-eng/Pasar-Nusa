-- 0005: explicitly remove default PUBLIC/anon execution from all privileged routines.
begin;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.ensure_product_inventory() from public, anon, authenticated;

revoke all on function public.set_inventory_on_hand(uuid, integer) from public, anon, authenticated;
grant execute on function public.set_inventory_on_hand(uuid, integer) to authenticated;

revoke all on function public.checkout_order(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.checkout_order(jsonb, text, text) to authenticated;

revoke all on function public.seller_decide_order_item(uuid, boolean) from public, anon, authenticated;
grant execute on function public.seller_decide_order_item(uuid, boolean) to authenticated;

revoke all on function public.complete_order_item(uuid) from public, anon, authenticated;
grant execute on function public.complete_order_item(uuid) to authenticated;

revoke all on function public.cancel_order_by_buyer(uuid) from public, anon, authenticated;
grant execute on function public.cancel_order_by_buyer(uuid) to authenticated;

revoke all on function public.admin_set_store_status(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_store_status(uuid, text) to authenticated;

revoke all on function public.admin_set_product_status(uuid, text) from public, anon, authenticated;
grant execute on function public.admin_set_product_status(uuid, text) to authenticated;

commit;