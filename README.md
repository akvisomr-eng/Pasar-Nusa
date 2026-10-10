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
- Next.js App Router + TypeScript
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

## Deployment status
The GitHub repository is private. The database foundation is applied and verified, and the CI production build has passed on commit `30958c5`. Public hosting is not yet confirmed: Render could not fetch this private repository because its GitHub connection does not currently have access. Grant the Render GitHub App access to `akvisomr-eng/Pasar-Nusa` (or connect the repository through the hosting provider) before attempting a public deployment. Set the two public Supabase environment variables in the hosting dashboard, run production smoke tests, and verify the deployed URL before calling the marketplace live.
