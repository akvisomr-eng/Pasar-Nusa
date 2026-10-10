-- 0006: remove broad default table grants and regrant only required operations.
begin;

revoke all on table public.profiles, public.stores, public.categories, public.products,
  public.inventory, public.orders, public.order_items, public.audit_logs from anon, authenticated;

-- Public storefront reads are limited to rows allowed by RLS.
grant select on table public.stores, public.categories, public.products to anon;
grant select, insert on table public.profiles to authenticated;
grant select, insert on table public.stores, public.products to authenticated;
grant select on table public.categories, public.orders, public.order_items, public.audit_logs to authenticated;

-- No direct client writes to orders, order items, inventory, audit logs, or categories.
-- Checkout and seller inventory/order transitions must use the guarded RPC functions.

commit;