# Pasar-Nusa

**Pedagang Ecer, Pelayanan Sultan.**

Pasar-Nusa is a multi-commodity marketplace foundation designed to grow into seller operations (ERP/CRM), B2B procurement, and cooperative administration.

## Principles
- No silent seller substitution; price, seller, brand, quantity, and fulfillment terms are explicit.
- Server-authoritative order state, atomic inventory reservation, idempotent mutations, and auditability.
- Supabase Row Level Security (RLS) for every exposed table; service secrets never reach the browser.
- Payments, wallet/escrow, autonomous AI actions, and broad courier integrations remain disabled until independently tested.

## Stack
- Next.js App Router + TypeScript
- Supabase PostgreSQL + Auth (connect the intended project before applying migrations)
- GitHub Actions CI

## Local development
1. Install Node.js 20+ and npm.
2. Copy `.env.example` to `.env.local` and fill in the intended Supabase project values.
3. Run `npm install`, then `npm run dev`.
4. Never commit `.env.local`, tokens, service-role keys, or customer data.

Database migrations live in `supabase/migrations`. Do not apply them to any project until the project ID is verified as `nkigwyxbcshavhjmbuey`.

## Deployment status
The repository is private. Production deployment is not considered complete until the intended Supabase project, deployment provider, required environment variables, migrations, and production smoke tests are verified.
