-- Pasar-Nusa foundational schema. Review and apply only to the verified project.
-- No payments, wallet, escrow, or autonomous AI actions are enabled in this migration.
begin;

create extension if not exists pgcrypto;

create type public.member_role as enum ('buyer', 'seller', 'cooperative_admin', 'platform_admin');
create type public.product_status as enum ('draft', 'active', 'paused', 'archived');
create type public.order_status as enum ('pending_seller', 'accepted', 'rejected', 'cancelled', 'fulfilled', 'disputed');
create type public.order_item_status as enum ('pending_seller', 'accepted', 'rejected', 'fulfilled', 'cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 120),
  phone text,
  role public.member_role not null default 'buyer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null default '',
  status text not null default 'pending' check (status in ('pending','active','paused','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  name text not null check (char_length(name) between 2 and 180),
  slug text not null,
  description text not null default '',
  brand text,
  unit_label text not null default 'pcs',
  price_idr bigint not null check (price_idr >= 0),
  status public.product_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(store_id, slug)
);

create table public.inventory (
  product_id uuid primary key references public.products(id) on delete restrict,
  on_hand integer not null default 0 check (on_hand >= 0),
  reserved integer not null default 0 check (reserved >= 0 and reserved <= on_hand),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending_seller',
  currency char(3) not null default 'IDR' check (currency = 'IDR'),
  subtotal_idr bigint not null check (subtotal_idr >= 0),
  buyer_note text not null default '',
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(buyer_id, idempotency_key)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  store_id uuid not null references public.stores(id) on delete restrict,
  product_name_snapshot text not null,
  brand_snapshot text,
  unit_snapshot text not null,
  unit_price_idr bigint not null check (unit_price_idr >= 0),
  quantity integer not null check (quantity > 0),
  line_total_idr bigint generated always as (unit_price_idr * quantity) stored,
  status public.order_item_status not null default 'pending_seller',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index stores_owner_idx on public.stores(owner_id);
create index products_store_status_idx on public.products(store_id, status);
create index products_category_idx on public.products(category_id);
create index orders_buyer_created_idx on public.orders(buyer_id, created_at desc);
create index order_items_store_status_idx on public.order_items(store_id, status);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);

-- Inventory reservations will be implemented only together with a complete order transaction RPC.
-- Clients cannot write inventory directly; no standalone reservation endpoint is exposed.

-- All exposed tables have RLS enabled.
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles read own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles create own buyer profile" on public.profiles for insert to authenticated with check (id = (select auth.uid()) and role = 'buyer');
create policy "active stores are public" on public.stores for select to anon, authenticated using (status = 'active' or owner_id = (select auth.uid()));
create policy "seller creates own store" on public.stores for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'pending');
-- Store edits/status transitions are intentionally disabled until a guarded server-side workflow is implemented.
create policy "active categories are public" on public.categories for select to anon, authenticated using (is_active = true);
create policy "active products are public" on public.products for select to anon, authenticated using (
  status = 'active' and exists (select 1 from public.stores s where s.id = store_id and s.status = 'active')
  or exists (select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid()))
);
create policy "seller creates own draft products" on public.products for insert to authenticated with check (
  exists (select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid()) and s.status in ('pending','active'))
  and status = 'draft'
);
-- Product edits/status transitions are intentionally disabled until a guarded server-side workflow is implemented.
create policy "inventory public for active products" on public.inventory for select to anon, authenticated using (
  exists (select 1 from public.products p join public.stores s on s.id = p.store_id where p.id = product_id and p.status = 'active' and s.status = 'active')
);
create policy "buyer reads own orders" on public.orders for select to authenticated using (buyer_id = (select auth.uid()));
create policy "buyer creates own pending order" on public.orders for insert to authenticated with check (buyer_id = (select auth.uid()) and status = 'pending_seller');
create policy "seller and buyer read order items" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = (select auth.uid()))
  or exists (select 1 from public.stores s where s.id = store_id and s.owner_id = (select auth.uid()))
);
-- No direct client writes to order items, inventory, or audit logs.
create policy "actor reads own audit entries" on public.audit_logs for select to authenticated using (actor_id = (select auth.uid()));

-- Table privileges are deliberately narrow; RLS remains the final row-level gate.
revoke all on public.inventory from anon, authenticated;
grant select on public.inventory to anon, authenticated;
revoke insert, update, delete on public.orders from authenticated;
grant select, insert on public.orders to authenticated;
revoke insert, update, delete on public.order_items from anon, authenticated;
grant select on public.order_items to authenticated;
revoke insert, update, delete on public.audit_logs from anon, authenticated;
grant select on public.audit_logs to authenticated;

commit;