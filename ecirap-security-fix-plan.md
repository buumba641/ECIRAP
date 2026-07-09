# ECIRAP — Security Fix: Plan & Architecture

Plan only — no files changed. This covers the two confirmed holes: `actions.ts` has no role checks, and RLS is wide open. They're coupled, so they need to be fixed together, in a specific order, or the fix breaks the app.

---

## Why they're coupled

Right now, `lib/supabase/server.ts` creates one client using `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and every function in `data.ts`, `actions.ts`, and `admin-actions.ts` uses that same client. Because your login system is a custom `jose`-signed JWT cookie — not Supabase Auth — Supabase itself has no idea when a request is "a logged-in ECIRAP employee" versus "anyone on the internet." Both look identical at the database layer: anon key, no session.

That means locking down RLS and fixing the app's own data access **have to happen together**. Lock down RLS first, without giving the app another way in, and the app breaks entirely — every page's data fetch fails. Leave RLS open while only adding app-layer role checks, and the underlying hole (anyone can hit Supabase directly, bypassing the app) is still there.

---

## Architecture — three coordinated pieces

### Piece 1 — Split the Supabase client (anon vs. service role)
- **Browser client** (`lib/supabase/client.ts`) — stays on the anon key. That's correct; it's public by definition. Worth a quick check on whether it's actually used for any direct data query anywhere (it's imported in `app-sidebar.tsx` but the role fetch there goes through `/api/me` instead — possibly dead code).
- **Server client, privileged** — new: a second server-only client using `SUPABASE_SERVICE_ROLE_KEY`. This becomes the *only* way the app itself talks to Supabase for business and employee data. `data.ts`, `actions.ts`, and `admin-actions.ts` all switch to it.
- **Hard rule:** the service-role key must never appear in anything with `"use client"`, never get returned in an API response, never get logged. It's equivalent to a database superuser password.

### Piece 2 — RLS lockdown (the database backstop)
- RLS stays *enabled* (it already is, per your three schema files) — just remove the `for all using (true) with check (true)` policies on every table.
- With RLS on and no matching policy, Postgres denies access by default for `anon` and `authenticated` — that's the actual lockdown, no new policies needed.
- Supabase's `service_role` bypasses RLS automatically, regardless of policy — so once Piece 1 is live, the app keeps working through the privileged client while a raw request using just the public anon key gets nothing back.
- No ownership-scoped policies needed yet — there's no per-user row scoping requirement to enforce at the DB layer right now (that's a separate, larger future item, not part of this fix).

### Piece 3 — Role guards in `actions.ts` (app-layer defense)
- Even after Piece 1 + 2 close the "bypass the app entirely" route, `actions.ts` itself still has zero role check on any of its 29 functions — any logged-in employee, any role, can currently call any mutation.
- Fix: generalize the pattern already correct in `admin-actions.ts` — `verifyAdminAccess()` — into a reusable `requireRole(allowedRoles)` helper in `auth.ts`, and call it at the top of every mutating function.
- The role list per function should mirror `middleware.ts`'s existing `ROUTE_ACCESS` map, so the action-level gate matches the page-level gate you've already approved — not a new policy, just closing the gap between "page is gated" and "the function behind the button is not."

This is Layers 3 and 5 from the earlier RBAC architecture doc, finally made concrete against your real file.

---

## Function-to-role mapping (derived from `middleware.ts`, not invented)

| Entity | Functions | Governing route | Roles (from existing `ROUTE_ACCESS`) |
|---|---|---|---|
| Leads | `createLead`, `updateLeadStatus`, `deleteLead` | `/leads` | CEO, Manager, Sales, Marketing |
| Campaigns | `createCampaign`, `deleteCampaign` | `/campaigns` | CEO, Manager, Marketing, Analyst |
| Opportunities | `createOpportunity`, `updateOpportunityStage`, `deleteOpportunity` | `/pipeline` | CEO, Manager, Sales, Analyst |
| Quotations | `createQuotation`, `updateQuotationStatus`, `deleteQuotation` | `/quotations` | CEO, Manager, Sales, Accountant |
| Invoices | `createInvoice`, `updateInvoiceStatus`, `deleteInvoice` | `/invoices` | CEO, Manager, Accountant |
| Revenue Alerts | `resolveAlert` | `/assurance` | CEO, Manager, Analyst |
| Contracts | `createContract`, `deleteContract` | *no dedicated route* | **Unclear — see below** |
| Products | `createProduct`, `deleteProduct` | `/products` | *Currently unrestricted — see below* |
| Services | `createService`, `deleteService` | tied to `/products` | *Currently unrestricted — see below* |
| Accounts | `createAccount`, `deleteAccount` | `/accounts` | *Currently unrestricted — see below* |
| Contacts | `createContact`, `deleteContact` | tied to `/accounts` | *Currently unrestricted — see below* |
| Activities | `createActivity`, `deleteActivity` | tied to `/accounts` | *Currently unrestricted — see below* |

**Two things this table surfaces that need a decision before this can be built:**

1. **Contracts have no dedicated route in `ROUTE_ACCESS`.** `contract-form.tsx` exists, but none of the `page.tsx` files shared so far actually render `ContractFormButton` — so either it's wired up somewhere not yet shown, or it's currently orphaned UI. Worth confirming which, since I can't infer the right role list from a route that doesn't exist.
2. **Products, Services, Accounts, Contacts, and Activities are all unrestricted today** — `/accounts` and `/products` have no entry in `ROUTE_ACCESS` at all, meaning any authenticated role, including Cashier, can currently create or delete a product, an account, or a contact. That matches the README's note about generic open routes, so it may be intentional — but it's worth a deliberate yes/no rather than the fix silently locking in "wide open" as correct by default.

---

## Build order (why it has to be this order)

1. **Add the service-role client** — additive only, no behavior change yet.
2. **Switch `data.ts`, `actions.ts`, `admin-actions.ts` to use it** — still no behavior change while RLS stays permissive. This step is a prerequisite, not a fix by itself.
3. **Add `requireRole` and wire it into every `actions.ts` function** per the mapping above — this closes the app-layer hole on its own and is safe to ship independently of steps 4–5.
4. **Lock down RLS** (drop the `using (true)` policies) — only safe *after* step 2 confirms nothing in the app still depends on anon-key access. Doing this before step 2 breaks every page's data fetch immediately.
5. **Verify** — a raw request to Supabase's REST API using only the public anon key (e.g. from outside the app) should get nothing back post-lockdown. That's the actual proof the fix worked, not just "the app still loads."

---

## What this fix deliberately does *not* include

Kept out on purpose, to stay scoped to "close the two confirmed holes" rather than merge into the larger redesign already documented elsewhere:

- Ownership scoping (`owner_id`-based row filtering — Sales seeing only their own leads)
- Manager's approval-only model, Analyst's true read-only enforcement
- Audit log
- Resolving the "currently unrestricted" entities above beyond their current (possibly intentional) open state

