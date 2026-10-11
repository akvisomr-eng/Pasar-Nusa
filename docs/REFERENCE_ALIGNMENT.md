# Pasar-Nusa — Reference Alignment

Status: archive inspected; first UI adaptation implemented on branch `feat/admin-dashboard-ux`.

## Reference archive inspected

The Library archive `Ecommerce-Website-With-Admin-Panel-Of-ERP-CRM-main.zip` contains an ASP.NET MVC admin application, an ASP.NET MVC customer storefront, SQL Server schema/data scripts, and an additional mobile/web folder. The primary admin application is under `E-Commerce-Website/Admin Side/IMS-Project/IMS-Project`; the customer storefront is under `E-Commerce-Website/Client Side/ClientSide-Kahreedo.pk/Kahreedo`.

The admin dashboard view (`Views/Dashboard/Index.cshtml`) presents order lifecycle counts (new, dispatched, shipped, delivered), sales history, top products, orders per day, and sales by country. `DashboardController.cs` queries the latest 10 orders and provides chart data endpoints. The source contains controller/view groups for categories, customers, customer requests and quotations, orders, payments, products, purchases/purchase orders, suppliers, supplier quotations, goods receipt notes, tax, units of measure, employee/login, profile, and settings. The SQL Server script `Database/khareedo.sql` contains 34 table definitions, including customers, products, orders/order details, payments, suppliers, purchase returns, sales returns, quotation/request tables, shipping, reviews, wishlist, tax, and units of measure.

## Decisions for Pasar-Nusa

The archive guides workflow coverage and information hierarchy, not a blind code or schema transplant. Its SQL Server / ASP.NET MVC implementation is not compatible with the current stack and includes legacy dependencies and domain assumptions that need review. Pasar-Nusa stays on Next.js App Router + TypeScript, Supabase PostgreSQL/Auth/RLS/RPC, and GitHub Actions.

| Reference area | Existing Pasar-Nusa equivalent | Decision |
|---|---|---|
| Storefront / product discovery | `src/app/page.tsx`, `src/app/katalog/page.tsx` | Adapt for Indonesian commodities, clear units, source/store trust, and responsive discovery |
| Customer login | `src/app/masuk/page.tsx` | Keep Supabase Auth; verify real redirects and email confirmation |
| Cart / checkout | `src/app/keranjang/page.tsx` and transactional RPC migrations | Keep server-authoritative prices, stock reservation and idempotency; end-to-end testing required |
| Seller operations | `src/app/seller/page.tsx` | Extend toward inventory, fulfillment, repeat buyers, and B2B offers only after schema/security design |
| Admin dashboard / moderation | `src/app/admin/page.tsx` | Initial responsive dashboard adaptation includes operational KPIs, quick links, search-filtered review queues, and secure RPC moderation |
| Order lifecycle / sales reporting | `src/app/pesanan`, current order RPCs | Future step: admin-only aggregate metrics and order workflow; no invented payment or revenue figures |
| Customers / CRM | No complete CRM module confirmed | Define buyer/seller relationship, inquiries, support and consent requirements before schema changes |
| Supplier / purchasing / goods receipt | No complete procurement module confirmed | Adapt to commodity sourcing and seller-side stock lots only after requirements mapping |
| Returns / payments / accounting | No complete equivalent confirmed | Defer until refund, payment provider, reconciliation, and audit policies are specified |
| Quotations / B2B | Not complete | Design request-for-quotation and supplier response workflow as a separate, permissioned milestone |

## Current implementation and release guardrails

- The admin UX adaptation and catalog discovery improvements are merged into `main`; GitHub Actions validates type check, lint, production build, static export, embedded JavaScript syntax, and the Supabase endpoint.
- The Supabase Edge Function `pasar-nusa-web` is active at version 10 with a responsive admin panel and live catalog search/sorting. Its existing public-page setting (`verify_jwt=false`) is retained because the endpoint serves the public HTML shell. Authenticated data access and moderation continue to rely on Supabase Auth/RLS/RPC.
- Existing Supabase authorization remains authoritative. Admin UI reads the authenticated profile role and performs store/product moderation through existing RPCs; no browser-side role elevation or service-role key.
- Dashboard totals are derived from the currently visible status groups queried from Supabase. They are not revenue, GMV, order, customer, or payment metrics.
- Preserve the private repository and current Supabase project. Do not introduce Cloudflare, Render, paid trials, or new hosting dependencies.
- Public preview is served by the existing Supabase Edge Function. It is an MVP preview, not a fully verified commercial launch.
- Do not claim parity with the legacy ERP/CRM. Implement features incrementally, with migrations, RLS/RPC review, tests, and release gates.
