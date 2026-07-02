import { createClient, safeQuery } from "@/lib/supabase/server"
import type {
  Campaign, Lead, Opportunity, Contract, Product,
  Account, Contact, Quotation, Invoice, Service,
  Activity, RevenueAlert, Industry, Branch, Profile,
} from "@/lib/types"

const OPEN_STAGES = ["Qualified", "Negotiation"]
const WON_STAGE = "Closed Won"

// ─── Campaigns ───────────────────────────────────────────────

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()
  const data = await safeQuery<Campaign[]>(() =>
    supabase.from("campaigns").select("*").order("created_at", { ascending: true }),
  )
  return data ?? []
}

// ─── Leads ───────────────────────────────────────────────────

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient()
  const data = await safeQuery<Lead[]>(() =>
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
  )
  return data ?? []
}

// ─── Opportunities ───────────────────────────────────────────

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient()
  const data = await safeQuery<Opportunity[]>(() =>
    supabase.from("opportunities").select("*").order("value", { ascending: false }),
  )
  return data ?? []
}

// ─── Contracts ───────────────────────────────────────────────

export async function getContracts(): Promise<Contract[]> {
  const supabase = await createClient()
  const data = await safeQuery<Contract[]>(() =>
    supabase.from("contracts").select("*").order("signed_date", { ascending: false }),
  )
  return data ?? []
}

// ─── Products ────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const data = await safeQuery<Product[]>(() =>
    supabase.from("products").select("*").order("category", { ascending: true }),
  )
  return data ?? []
}

// ─── Accounts ────────────────────────────────────────────────

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient()
  const data = await safeQuery<Account[]>(() =>
    supabase.from("accounts").select("*").order("name", { ascending: true }),
  )
  return data ?? []
}

export async function getAccountById(id: string): Promise<Account | null> {
  const supabase = await createClient()
  const data = await safeQuery<Account>(() =>
    supabase.from("accounts").select("*").eq("id", id).single(),
  )
  return data ?? null
}

// ─── Contacts ────────────────────────────────────────────────

export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient()
  const data = await safeQuery<Contact[]>(() =>
    supabase.from("contacts").select("*").order("created_at", { ascending: false }),
  )
  return data ?? []
}

export async function getContactsByAccount(accountId: string): Promise<Contact[]> {
  const supabase = await createClient()
  const data = await safeQuery<Contact[]>(() =>
    supabase.from("contacts").select("*").eq("account_id", accountId).order("is_primary", { ascending: false }),
  )
  return data ?? []
}

// ─── Quotations ──────────────────────────────────────────────

export async function getQuotations(): Promise<Quotation[]> {
  const supabase = await createClient()
  const data = await safeQuery<Quotation[]>(() =>
    supabase.from("quotations").select("*").order("created_at", { ascending: false }),
  )
  return data ?? []
}

export async function getQuotationsByAccount(accountId: string): Promise<Quotation[]> {
  const supabase = await createClient()
  const data = await safeQuery<Quotation[]>(() =>
    supabase.from("quotations").select("*").eq("account_id", accountId).order("created_at", { ascending: false }),
  )
  return data ?? []
}

// ─── Invoices ────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient()
  const data = await safeQuery<Invoice[]>(() =>
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
  )
  return data ?? []
}

export async function getInvoicesByAccount(accountId: string): Promise<Invoice[]> {
  const supabase = await createClient()
  const data = await safeQuery<Invoice[]>(() =>
    supabase.from("invoices").select("*").eq("account_id", accountId).order("created_at", { ascending: false }),
  )
  return data ?? []
}

// ─── Services ────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const supabase = await createClient()
  const data = await safeQuery<Service[]>(() =>
    supabase.from("services").select("*").order("category", { ascending: true }),
  )
  return data ?? []
}

// ─── Activities ──────────────────────────────────────────────

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient()
  const data = await safeQuery<Activity[]>(() =>
    supabase.from("activities").select("*").order("created_at", { ascending: false }),
  )
  return data ?? []
}

export async function getActivitiesByAccount(accountId: string): Promise<Activity[]> {
  const supabase = await createClient()
  const data = await safeQuery<Activity[]>(() =>
    supabase.from("activities").select("*").eq("account_id", accountId).order("created_at", { ascending: false }),
  )
  return data ?? []
}

// ─── Revenue Alerts ──────────────────────────────────────────

export async function getRevenueAlerts(): Promise<RevenueAlert[]> {
  const supabase = await createClient()
  const data = await safeQuery<RevenueAlert[]>(() =>
    supabase.from("revenue_alerts").select("*").order("created_at", { ascending: false }),
  )
  return data ?? []
}

// ─── Reference Data ──────────────────────────────────────────

export async function getIndustries(): Promise<Industry[]> {
  const supabase = await createClient()
  const data = await safeQuery<Industry[]>(() =>
    supabase.from("industries").select("*").order("name", { ascending: true }),
  )
  return data ?? []
}

export async function getBranches(): Promise<Branch[]> {
  const supabase = await createClient()
  const data = await safeQuery<Branch[]>(() =>
    supabase.from("branches").select("*").order("name", { ascending: true }),
  )
  return data ?? []
}

export async function getProfiles(): Promise<Profile[]> {
  const supabase = await createClient()
  const data = await safeQuery<Profile[]>(() =>
    supabase.from("profiles").select("*").order("full_name", { ascending: true }),
  )
  return data ?? []
}

// ─── Composite Data Fetchers ─────────────────────────────────

export type EnterpriseData = {
  campaigns: Campaign[]
  leads: Lead[]
  opportunities: Opportunity[]
  contracts: Contract[]
}

export async function getEnterpriseData(): Promise<EnterpriseData> {
  const [campaigns, leads, opportunities, contracts] = await Promise.all([
    getCampaigns(),
    getLeads(),
    getOpportunities(),
    getContracts(),
  ])
  return { campaigns, leads, opportunities, contracts }
}

export type FullEnterpriseData = EnterpriseData & {
  accounts: Account[]
  quotations: Quotation[]
  invoices: Invoice[]
}

export async function getFullEnterpriseData(): Promise<FullEnterpriseData> {
  const [campaigns, leads, opportunities, contracts, accounts, quotations, invoices] =
    await Promise.all([
      getCampaigns(),
      getLeads(),
      getOpportunities(),
      getContracts(),
      getAccounts(),
      getQuotations(),
      getInvoices(),
    ])
  return { campaigns, leads, opportunities, contracts, accounts, quotations, invoices }
}

/** All data needed for the account 360° view */
export async function getAccountData(accountId: string) {
  const [
    account,
    contacts,
    opportunities,
    contracts,
    quotations,
    invoices,
    activities,
  ] = await Promise.all([
    getAccountById(accountId),
    getContactsByAccount(accountId),
    getOpportunitiesByAccount(accountId),
    getContractsByAccount(accountId),
    getQuotationsByAccount(accountId),
    getInvoicesByAccount(accountId),
    getActivitiesByAccount(accountId),
  ])
  return { account, contacts, opportunities, contracts, quotations, invoices, activities }
}

async function getOpportunitiesByAccount(accountId: string): Promise<Opportunity[]> {
  const supabase = await createClient()
  const data = await safeQuery<Opportunity[]>(() =>
    supabase.from("opportunities").select("*").eq("account_id", accountId).order("value", { ascending: false }),
  )
  return data ?? []
}

async function getContractsByAccount(accountId: string): Promise<Contract[]> {
  const supabase = await createClient()
  const data = await safeQuery<Contract[]>(() =>
    supabase.from("contracts").select("*").eq("account_id", accountId).order("signed_date", { ascending: false }),
  )
  return data ?? []
}

/* ---------- Derived metrics ---------- */

export function totalRevenue(contracts: Contract[]): number {
  return contracts.reduce((sum, c) => sum + Number(c.amount), 0)
}

export function totalBudget(campaigns: Campaign[]): number {
  return campaigns.reduce((sum, c) => sum + Number(c.budget), 0)
}

export function weightedPipeline(opps: Opportunity[]): number {
  return opps
    .filter((o) => OPEN_STAGES.includes(o.stage))
    .reduce((sum, o) => sum + (Number(o.value) * o.probability) / 100, 0)
}

export function openPipelineValue(opps: Opportunity[]): number {
  return opps
    .filter((o) => OPEN_STAGES.includes(o.stage))
    .reduce((sum, o) => sum + Number(o.value), 0)
}

export function wonOpps(opps: Opportunity[]): Opportunity[] {
  return opps.filter((o) => o.stage === WON_STAGE)
}

export function winRate(opps: Opportunity[]): number {
  if (opps.length === 0) return 0
  return (wonOpps(opps).length / opps.length) * 100
}

export function conversionRate(leads: Lead[]): number {
  if (leads.length === 0) return 0
  const converted = leads.filter((l) => l.status === "Converted").length
  return (converted / leads.length) * 100
}

/** Revenue grouped by an arbitrary campaign attribute. */
export function revenueByCampaign(
  campaigns: Campaign[],
  contracts: Contract[],
) {
  return campaigns
    .map((c) => {
      const revenue = contracts
        .filter((ct) => ct.campaign_id === c.id)
        .reduce((s, ct) => s + Number(ct.amount), 0)
      const budget = Number(c.budget)
      return {
        id: c.id,
        name: c.name,
        channel: c.channel ?? c.type,
        budget,
        revenue,
        roi: budget ? revenue / budget : 0,
        net: revenue - budget,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
}

export function revenueByRegion(campaigns: Campaign[], contracts: Contract[]) {
  const map = new Map<string, number>()
  for (const ct of contracts) {
    const camp = campaigns.find((c) => c.id === ct.campaign_id)
    const region = camp?.region ?? "Unassigned"
    map.set(region, (map.get(region) ?? 0) + Number(ct.amount))
  }
  return Array.from(map.entries())
    .map(([region, revenue]) => ({ region, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function revenueByOwner(opps: Opportunity[]) {
  const map = new Map<string, number>()
  for (const o of wonOpps(opps)) {
    const owner = o.owner ?? "Unassigned"
    map.set(owner, (map.get(owner) ?? 0) + Number(o.value))
  }
  return Array.from(map.entries())
    .map(([owner, revenue]) => ({ owner, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function pipelineByStage(opps: Opportunity[]) {
  const stages = ["Qualified", "Negotiation", "Closed Won"]
  return stages.map((stage) => {
    const list = opps.filter((o) => o.stage === stage)
    return {
      stage,
      count: list.length,
      value: list.reduce((s, o) => s + Number(o.value), 0),
    }
  })
}

export function leadsByStatus(leads: Lead[]) {
  const statuses = ["New", "Qualified", "Converted"]
  return statuses.map((status) => ({
    status,
    count: leads.filter((l) => l.status === status).length,
  }))
}

export function campaignById(campaigns: Campaign[], id: string) {
  return campaigns.find((c) => c.id === id) ?? null
}

/* ---------- Account-related metrics ---------- */

export function accountsByTier(accounts: Account[]) {
  const tiers = ["Platinum", "Gold", "Silver", "Bronze"] as const
  return tiers.map((tier) => ({
    tier,
    count: accounts.filter((a) => a.tier === tier).length,
  }))
}

export function totalAccountRevenue(accounts: Account[]): number {
  return accounts.reduce((sum, a) => sum + Number(a.annual_revenue), 0)
}

export function averageHealthScore(accounts: Account[]): number {
  if (accounts.length === 0) return 0
  return Math.round(
    accounts.reduce((sum, a) => sum + a.health_score, 0) / accounts.length,
  )
}

/* ---------- Invoice metrics ---------- */

export function totalInvoiced(invoices: Invoice[]): number {
  return invoices.reduce((sum, i) => sum + Number(i.amount), 0)
}

export function totalPaid(invoices: Invoice[]): number {
  return invoices.reduce((sum, i) => sum + Number(i.paid_amount), 0)
}

export function overdueInvoices(invoices: Invoice[]): Invoice[] {
  const now = new Date()
  return invoices.filter(
    (i) => i.status === "Pending" && i.due_date && new Date(i.due_date) < now,
  )
}

/* ---------- Revenue assurance detection ---------- */

export function detectLeakage(data: {
  leads: Lead[]
  opportunities: Opportunity[]
  contracts: Contract[]
  invoices: Invoice[]
}) {
  const now = new Date()
  const thirtyDays = 30 * 86400000
  const sixtyDays = 60 * 86400000
  const ninetyDays = 90 * 86400000

  const unassignedLeads = data.leads.filter((l) => !l.owner)
  const stalledLeads = data.leads.filter(
    (l) =>
      l.status === "New" &&
      new Date(l.created_at) < new Date(now.getTime() - 14 * 86400000),
  )

  const stalledOpps = data.opportunities.filter(
    (o) =>
      o.stage === "Qualified" &&
      new Date(o.created_at) < new Date(now.getTime() - thirtyDays),
  )

  const expiring30 = data.contracts.filter(
    (c) =>
      c.end_date &&
      new Date(c.end_date) > now &&
      new Date(c.end_date) < new Date(now.getTime() + thirtyDays),
  )
  const expiring60 = data.contracts.filter(
    (c) =>
      c.end_date &&
      new Date(c.end_date) > now &&
      new Date(c.end_date) < new Date(now.getTime() + sixtyDays),
  )
  const expiring90 = data.contracts.filter(
    (c) =>
      c.end_date &&
      new Date(c.end_date) > now &&
      new Date(c.end_date) < new Date(now.getTime() + ninetyDays),
  )

  const overdueInvs = data.invoices.filter(
    (i) =>
      (i.status === "Pending" || i.status === "Partial") &&
      i.due_date &&
      new Date(i.due_date) < now,
  )

  return {
    unassignedLeads,
    stalledLeads,
    stalledOpps,
    expiring30,
    expiring60,
    expiring90,
    overdueInvoices: overdueInvs,
    totalAtRiskValue:
      stalledOpps.reduce((s, o) => s + Number(o.value), 0) +
      overdueInvs.reduce((s, i) => s + Number(i.amount) - Number(i.paid_amount), 0),
  }
}
