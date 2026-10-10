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

## Deployment architecture and status — Rp0 first

The project's non-negotiable starting constraint is **Rp0**. Do not introduce a paid plan, paid trial, or new third-party hosting dependency without explicit approval. Do not assume that a service's free tier will remain sufficient forever.

- Keep this GitHub repository private.
- Keep the existing Supabase project `nkigwyxbcshavhjmbuey` as the database/Auth/RLS/RPC backend unless a measured technical reason justifies changing it.
- Render, Cloudflare, AppDeploy, and other managed frontend hosting platforms are not part of the default plan.
- Never make the repository public or expose service-role/secret keys to work around hosting limitations.
- Current CI validates type checking, lint, and the Next.js production build. A successful CI build does **not** mean the site is deployed or publicly reachable.
- The frontend currently uses Next.js App Router and has a dynamic order-detail route. GitHub Pages cannot run the Next.js server runtime. Supabase backend services are not a drop-in Node.js/Next.js host.
- Before changing the app, investigate whether a fully static client-side export can preserve all required flows, including dynamic order links, authentication redirects, catalog, seller tools, admin moderation, checkout, and order access control. Do not enable static export until these are adapted and tested.
- If static output is feasible, evaluate hosting those files using resources already available in the existing GitHub/Supabase accounts, verifying real plan limits and routing behavior first. Do not assume Supabase Storage is a complete website host without testing path routing, headers, MIME types, cache behavior, and SPA fallbacks.
- If no safe public-hosting route exists at Rp0, continue local development and CI, and document that public deployment is blocked. Do not silently introduce a paid dependency. Self-hosting can be evaluated later if suitable hardware and internet connectivity are available, with any domain, power, network, and security costs stated honestly.
- Real payments, wallet/escrow, autonomous AI actions, and broad courier integrations remain disabled.

### Rp0-first release checklist

1. Keep the repository private and CI green.
2. Audit every route and browser/server dependency before considering static export.
3. Verify the actual free-plan limits of resources already in use; no surprise subscriptions or paid trials.
4. Configure only Supabase public URL and publishable/anon key in browser code. Never put a service-role or secret key in frontend bundles.
5. Verify Supabase Auth redirect behavior on the candidate URL.
6. Test signup/signin, product listing, seller onboarding, admin moderation, atomic checkout, order access controls, and cancellation.
7. Call the system live only after deployment and end-to-end smoke tests succeed.
