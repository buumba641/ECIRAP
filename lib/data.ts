import { createClient } from "@/lib/supabase/server"
import type { Campaign, Lead, Opportunity, Contract } from "@/lib/types"

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
  leads: Lead[] = [],
) {
  return campaigns
    .map((c) => {
      const campContracts = contracts.filter((ct) => ct.campaign_id === c.id)
      const revenue = campContracts.reduce((s, ct) => s + Number(ct.amount), 0)
      const budget = Number(c.budget)
      const campLeads = leads.filter((l) => l.campaign_id === c.id)
      const leadCount = campLeads.length
      const convertedLeads = campLeads.filter(l => l.status === "Converted").length
      const costPerLead = leadCount > 0 ? budget / leadCount : 0
      const costPerCustomer = convertedLeads > 0 ? budget / convertedLeads : 0
      
      // Calculate a simple effectiveness score (0-100)
      let score = 0
      if (budget > 0) {
        const roiScore = Math.min((revenue / budget) * 20, 40) // up to 40 pts for ROI
        const conversionScore = leadCount > 0 ? (convertedLeads / leadCount) * 40 : 0 // up to 40 pts for conversion
        const volumeScore = Math.min((leadCount / (c.target_leads || 100)) * 20, 20) // up to 20 pts for volume
        score = Math.round(roiScore + conversionScore + volumeScore)
      }

      return {
        id: c.id,
        name: c.name,
        type: c.type,
        channel: c.channel ?? c.type,
        budget,
        revenue,
        leads: leadCount,
        convertedLeads,
        costPerLead,
        costPerCustomer,
        roi: budget ? revenue / budget : 0,
        net: revenue - budget,
        score,
        province: c.province,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
}

/** Time-based revenue analysis for a single campaign */
export function campaignRevenueTimeline(campaignId: string, contracts: Contract[]) {
  const campContracts = contracts.filter(c => c.campaign_id === campaignId && c.signed_date)
  
  const map = new Map<string, number>()
  for (const ct of campContracts) {
    const month = new Date(ct.signed_date!).toISOString().slice(0, 7) // YYYY-MM
    map.set(month, (map.get(month) ?? 0) + Number(ct.amount))
  }
  
  return Array.from(map.entries())
    .map(([month, revenue]) => ({ month, revenue }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

export function campaignCustomerLTV(campaignId: string, contracts: Contract[], leads: Lead[]) {
  const campContracts = contracts.filter(c => c.campaign_id === campaignId)
  const campLeads = leads.filter(l => l.campaign_id === campaignId && l.status === "Converted")
  
  const revenue = campContracts.reduce((s, ct) => s + Number(ct.amount), 0)
  const customers = campLeads.length
  
  return {
    ltv: customers > 0 ? revenue / customers : 0,
    customers,
    revenue
  }
}

export function revenueByProvince(campaigns: Campaign[], contracts: Contract[]) {
  const map = new Map<string, number>()
  for (const ct of contracts) {
    const camp = campaigns.find((c) => c.id === ct.campaign_id)
    const prov = camp?.province ?? "Unassigned"
    map.set(prov, (map.get(prov) ?? 0) + Number(ct.amount))
  }
  return Array.from(map.entries())
    .map(([province, revenue]) => ({ province, revenue }))
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
