-- Add covering indexes for foreign keys reported by Supabase performance advisors.
-- These indexes improve joins/deletes on operational and audit tables without changing data.
create index if not exists audit_logs_actor_id_idx on public.audit_logs (actor_id);
create index if not exists categories_parent_id_idx on public.categories (parent_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);
