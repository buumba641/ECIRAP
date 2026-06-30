import { createClient } from "@/lib/supabase/server"
import type { Campaign, Lead, Opportunity, Contract, Product } from "@/lib/types"

const OPEN_STAGES = ["Qualified", "Negotiation"]
const WON_STAGE = "Closed Won"

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: true })
  return (data as Campaign[]) ?? []
}

export async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
  return (data as Lead[]) ?? []
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .order("value", { ascending: false })
  return (data as Opportunity[]) ?? []
}

export async function getContracts(): Promise<Contract[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("contracts")
    .select("*")
    .order("signed_date", { ascending: false })
  return (data as Contract[]) ?? []
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
  return (data as Product[]) ?? []
}

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
