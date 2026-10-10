# Pasar-Nusa — Reference Alignment

Status: working alignment record; not a claim that the original reference archive has been fully audited.

## Agreed source of reference

The primary reference is `Ecommerce-Website-With-Admin-Panel-Of-ERP-CRM-main.zip`, previously identified as an e-commerce project with SQL database assets and an administrative panel built with .NET MVC. Pasar-Nusa must use it to guide product flows, admin/operations UX, and relevant ERP/CRM business capabilities.

The archive is a reference for product and workflow decisions. Its implementation must not be copied blindly into the current stack: Pasar-Nusa currently uses Next.js App Router, TypeScript, Supabase PostgreSQL/Auth/RLS/RPC. Reuse or migrate individual modules only after examining the original source and validating fit.

## Current implementation found in the repository

| Area | Current evidence | Alignment status |
|---|---|---|
| Public storefront | `src/app/page.tsx` | Present; detailed comparison with reference pending |
| Product catalog | `src/app/katalog/page.tsx` | Present; reads active products from Supabase |
| Cart and checkout | `src/app/keranjang/page.tsx`, order RPC migrations | Foundation present; must be end-to-end tested |
| Authentication | `src/app/masuk/page.tsx`, Supabase Auth | Present; redirects and real email flow need testing |
| Seller operations | `src/app/seller/page.tsx` | Store registration, product draft, stock and order actions present |
| Platform administration | `src/app/admin/page.tsx` | Store/product moderation present |
| Orders | `src/app/pesanan/page.tsx`, `src/app/pesanan/[id]/order-detail.tsx` | Buyer order views present; direct-link/static-host behavior requires testing |
| Database/security | `supabase/migrations/0001` through `0008` | Core marketplace schema, RPC workflows, RLS and restricted grants present |
| ERP/CRM breadth | No complete module inventory established yet | Must compare with original archive before declaring parity |
| B2B/cooperative workflows | Product direction is documented; complete workflow parity not established | Needs requirements mapping before implementation |
| Reports, customer management, purchasing, suppliers, returns, accounting | Not confirmed as implemented from current evidence | Inspect source archive; include only where the original project and Pasar-Nusa requirements justify them |

## Required next steps

1. Inspect the actual archive: inventory its folders, project files, SQL scripts, entities, routes/controllers, views, and admin functions.
2. Build a file/module-level comparison matrix: original module, business purpose, current Pasar-Nusa equivalent, missing behavior, security/data implications, and decision (reuse/adapt/defer).
3. Preserve the existing private GitHub repository and Supabase project unless evidence justifies a change.
4. Do not expose service-role/secret keys, make the repository public, or introduce paid services/trials. Rp0 remains the deployment constraint.
5. Do not describe the system as production-ready or live until core buyer, seller, admin, authorization, and order flows pass end-to-end tests.

## Evidence limitation

The source archive is not present in the current Pasar-Nusa repository tree, and this record does not claim to have opened its original files in this session. The detailed module comparison must be based on the actual archive contents, not guesses from its filename.
