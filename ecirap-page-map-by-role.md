# ECIRAP — Page Map by Role (Simple Model)

No permission layers, no ownership scoping logic to reason about — just this: **every module is one page/component, and a role's nav list determines whether that page exists for them at all.** This is already how `app-sidebar.tsx` and `top-bar.tsx` work today (they filter the `allNav` array by `item.roles.includes(userRole)`), and `middleware.ts` backs it up at the route level. Nothing new to build for the *mechanism* — this doc is about deciding the actual page list per role and what goes on each page.

---

## Design reference (patterns only, from the 3 images)

| Pattern | Where it came from | Where it fits in ECIRAP | Existing component |
|---|---|---|---|
| Sidebar, icon + label, active highlight, role-filtered | Images 2 & 3 | Already built | `app-sidebar.tsx` |
| KPI card: icon badge, big number, trend delta, sparkline | Image 1 | Already built | `kpi-card.tsx` |
| Table row: avatar + name/email, status badge, amount, timestamp | Image 2 | Already built | `table.tsx` + per-page markup |
| "Today / This period" quick-stat split | Image 2 | New — good fit for Sales' own-revenue page | build on `KpiCard` |
| Recent activity feed, relative timestamps | Image 2 | New — good fit for Sales' customer feedback log | new small component |
| Color-zoned chart background (good/poor zone) | Image 3 | New — exactly what Marketing's before/during/after view needs | extend `charts.tsx` |
| Click a data point → side panel shows that period's detail | Image 3 | New — same Marketing page, drill into a specific campaign/location | new panel component |

---

## Pages, role by role

### HR
| Page | Contents |
|---|---|
| **Employees** | Table: add, edit, delete. *(This is the existing `/admin/users` page — already built, already correct for this role.)* |

---

### Marketing
| Page | Contents |
|---|---|
| **Revenue Overview** | Company-wide revenue table/chart, filterable by date range and by location/region/branch. |
| **Campaigns & Location Analysis** | Campaign list (existing `/campaigns` page) → click into one → shows the location(s) tied to that campaign, a color-zoned chart of revenue **before / during / after** the campaign ran at that location, and a breakdown of **which sales rep or team generated the revenue there in that window** — so Marketing can tell whether a lift came from the ad or from whoever happened to be working that territory. |

**Schema dependency:** this page needs a `campaign_locations` table (or geo/location fields on `leads`) that doesn't exist yet — `campaigns.region` today is just a text field, not something a lead or a sale can be joined against precisely. This was flagged in the earlier architecture doc; it's a real prerequisite for this specific page, not optional polish.

---

### Sales
| Page | Contents |
|---|---|
| **My Customers** | Contacts + feedback/activity log, scoped to their own accounts — this is the structured replacement for a paper notebook you mentioned earlier. |
| **Quotations & Invoices** | Generate a quotation; converting it to an invoice is what marks the deal closed. |
| **My Revenue** | Their own revenue dashboard — KPI cards + trend, "today / this period" split (Image 2 pattern). |

---

### Team Lead
| Page | Contents |
|---|---|
| **Team Performance** | Sales personnel data aggregated across their team, filterable by rep, location, and time period, with a comparison view to see who's performing better. |

**Data dependency:** `revenueByOwner()` already exists in `lib/data.ts` and gets you most of the way there for the "compare reps" view — it just needs a team-membership filter (which reps report to this lead) layered on top, plus the same location join Marketing's page needs.

---

### CEO
| Page | Contents |
|---|---|
| **Executive Dashboard** | The rollup — same hero + KPI-card pattern as Image 1. This is already what the existing `/` dashboard page does: company-wide revenue, pipeline, campaign performance, assurance alerts, all in one view. |
| **Accounts** | Full account list, 360° view per account. |
| **Campaigns & Location Analysis** | Same page Marketing gets, unscoped. |
| **Leads / Pipeline** | Same pages Sales and Team Lead get, unscoped — every rep, every deal. |
| **Quotations & Invoices** | Same page Accountant gets. |
| **Revenue & ROI** | Company-wide, same page Accountant/Analyst get. |
| **Assurance** | Leakage alerts, same page Analyst/Manager get. |
| **Products & Services** | Catalog + inventory. |
| **Employees** | Same page HR gets. |
| **Payroll & Disbursements** | Same page Accountant gets. |
| **Payment Approvals** | Same page Manager gets. |

Essentially: every page on this sheet, unscoped, plus the two pages (Employees, Approvals) nobody else combines.

---

### Manager
| Page | Contents |
|---|---|
| **Executive Dashboard** | Same rollup CEO sees — read only. |
| **Accounts / Campaigns / Leads / Pipeline / Quotations & Invoices / Revenue / Assurance / Products & Services** | Read-only versions of every page above — full visibility, no edit/delete controls rendered on any of them. |
| **Payment Approvals** | The one page Manager can actually write to: a queue of pending payment releases and high-value quotations waiting on sign-off — approve or reject each. |

**Schema dependency:** needs the `approval_status` / `approved_by` fields flagged in the earlier architecture doc — there's no "pending approval" state anywhere in the schema today, just direct status fields.

---

### Accountant
| Page | Contents |
|---|---|
| **Quotations** | Read/write — involved once a quote is accepted and needs to become a contract or invoice. |
| **Invoices** | Full CRUD — issue, mark paid/partial/overdue. |
| **Revenue & ROI** | Full financial reporting, same page as the existing `/revenue` page. |
| **Payroll & Disbursements** | Release worker payments, track salary/disbursement history — "manages all payments of workers" from your description. |
| **Cash Handover Reconciliation** | The counter-signature side of the Cashier's cash submission — both parties see the same submitted count and both sign off before it's marked reconciled. |

**Schema dependency:** Payroll needs a payroll/disbursement table that doesn't exist yet (`employees` has no salary or payment-history field). Cash Handover needs the `cash_handovers` table from the earlier doc.

---

### Cashier
| Page | Contents |
|---|---|
| **Invoices** | Record payment against an invoice, mark paid/partial — this is the point-of-transaction view, not invoice creation from scratch (that's Sales' or Accountant's job). |
| **Products / Inventory** | Stock in/out tracking — "kind of like how a store operates," per your description. |
| **Cash Handover** | Submit a cash count at end of shift/day; sits pending until Accountant or Manager counter-signs. |

Same schema dependency as Accountant's Cash Handover page — one table, two roles' views into it.

---

### Analyst
| Page | Contents |
|---|---|
| **Campaigns** | Read-only. |
| **Leads / Pipeline** | Read-only, unscoped (all reps, for cross-department analysis). |
| **Quotations & Invoices** | Read-only. |
| **Revenue & ROI** | Read-only. |
| **Assurance** | Read-only — likely Analyst's most-used page, since leakage analysis is squarely "analyze the business" territory. |
| **Products & Services** | Read-only. |

No Accounts page, no Employees page — both explicitly off-limits per your spec. Nothing on this list gets a create/edit/delete control; every table Analyst sees renders read-only.

---

### IT
| Page | Contents |
|---|---|
| **System Health** | Uptime, error rates, job queue status — infrastructure telemetry only, not on the business-data sidebar at all. |
| **Change Requests** | IT submits a proposed config/deployment change here; it sits pending until CEO approves it — the "permission first" part of your description. |

No business data pages at all — this role never touches accounts, revenue, leads, or employees.

---

## Open questions for the next pass

1. For Marketing's location-linked campaign page — do locations map to your existing `province`/`branch` fields, or do you want actual coordinates (for something like a map view)?
2. Should "My Revenue" for Sales and "Team Performance" for Team Lead share one underlying revenue-by-owner page component with a different data scope, or be built as two separate pages? (Reuse would save real build time given how similar the two views are.)
3. Payroll needs a schema addition (salary field, disbursement history) that doesn't exist anywhere in the current tables — want that scoped now, or is Payroll a later phase?

