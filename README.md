# Pasar-Nusa

**Pedagang Ecer, Pelayanan Sultan.**

Pasar-Nusa is a multi-commodity marketplace foundation designed to grow into seller operations (ERP/CRM), B2B procurement, and cooperative administration.

## Implemented foundation
- Responsive Indonesian storefront and product catalog.
- Email sign-up/sign-in through Supabase Auth.
- Seller onboarding, draft product creation, and stock update RPC.
- Cart and atomic checkout RPC with server-authoritative price snapshots, stock reservation, idempotency, and audit logging.
- Seller order acceptance/rejection and fulfillment; buyer order view and cancellation while pending.
- Admin moderation RPCs for store/product activation.
- PostgreSQL RLS and least-privilege table/function grants.
- GitHub Actions CI for type check, lint, and production build.

## Important operational constraints
- The platform does not silently substitute sellers or products.
- Checkout revalidates active product/store state and stock on the server.
- Inventory and order state cannot be changed directly by browser clients.
- Exact inventory quantities are not exposed through direct public table reads.
- Payments, internal wallet/escrow, autonomous AI actions, and broad courier integrations are not enabled.
- Admin role assignment is a trusted, one-time operation; users cannot grant themselves administrator privileges.
- A seller's store and products remain hidden until approved by an administrator.

## Stack
- Next.js App Router + TypeScript (current maintained major version)
- Supabase PostgreSQL + Auth
- GitHub Actions CI

## Local development
1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` using the **publishable/anon** values from the intended Supabase project. Never use a service-role or secret key in a browser environment.
4. Run `npm install`, then `npm run dev`.
5. Run `npm run typecheck`, `npm run lint`, and `npm run build`.

## Database
Migrations are stored in `supabase/migrations` and were applied to project `nkigwyxbcshavhjmbuey`:
- `0001_core_schema`
- `0002_profile_bootstrap_and_safe_stock`
- `0003_transactional_marketplace_operations`
- `0004_admin_moderation`
- `0005_function_execute_privileges`
- `0006_least_privilege_table_grants`
- `0007_checkout_validation_hardening`
- `0008_avoid_recursive_order_rls`

After the first trusted owner account has signed up and its email has been verified, a project owner must promote that specific account to `platform_admin` in the Supabase SQL editor. Verify the email and UUID before running anything like:

```sql
-- First inspect the exact account; do not guess the UUID.
select id, email from auth.users where email = 'OWNER_EMAIL_TO_VERIFY';

-- Only after verifying the exact UUID belongs to the intended platform owner:
update public.profiles
set role = 'platform_admin', updated_at = now()
where id = 'VERIFIED_AUTH_USER_UUID';
```

Do not expose the SQL editor, database credentials, or service-role keys to end users. Admin roles are never accepted from signup metadata.

## Deployment architecture and status

- The repository remains private and GitHub Actions validates type checking, lint, and the production build.
- Supabase project `nkigwyxbcshavhjmbuey` provides PostgreSQL, Auth, RLS, and transactional RPCs.
- Render is intentionally not part of the deployment path.
- The current frontend uses Next.js App Router and includes a dynamic order-detail route. GitHub Pages is static hosting and, for a private repository, may require a paid GitHub plan; it must not be treated as a guaranteed free deployment target.
- Supabase provides backend services and Edge Functions, but it is not a drop-in Node.js/Next.js web host. Deploying this existing application publicly therefore requires either (a) a compatible frontend host, or (b) a deliberate frontend rewrite/export with routing and all user journeys retested. Do not enable static export without resolving the dynamic order route and confirming the build.
- Do not publish the private repository, create a public mirror, or expose service-role keys to bypass hosting limitations.
- Real payments, wallet/escrow, autonomous AI actions, and broad courier integrations remain disabled.

### Safe deployment checklist

1. Confirm the chosen host supports the actual Next.js runtime and the account's current free-plan limits.
2. Configure only `NEXT_PUBLIC_SUPABASE_URL` and the public anon/publishable key as frontend environment variables.
3. Confirm Supabase Auth Site URL and redirect URLs match the final HTTPS domain.
4. Run typecheck, lint, production build, and deployment smoke tests.
5. Verify signup/signin, product listing, seller onboarding, admin moderation, atomic checkout, order access controls, and cancellation before calling the site live.
