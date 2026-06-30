"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ─── Leads ───────────────────────────────────────────────

export async function createLead(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").insert({
    name: formData.get("name") as string,
    company: (formData.get("company") as string) || null,
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    source: (formData.get("source") as string) || null,
    campaign_id: (formData.get("campaign_id") as string) || null,
    owner: (formData.get("owner") as string) || null,
    status: "New",
    score: Number(formData.get("score")) || 50,
  })
  if (error) return { error: error.message }
  revalidatePath("/leads")
  revalidatePath("/")
  return { success: true }
}

export async function updateLeadStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/leads")
  revalidatePath("/")
  return { success: true }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("leads").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/leads")
  revalidatePath("/")
  return { success: true }
}

// ─── Campaigns ───────────────────────────────────────────

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("campaigns").insert({
    name: formData.get("name") as string,
    type: (formData.get("type") as string) || "Digital",
    channel: (formData.get("channel") as string) || null,
    budget: Number(formData.get("budget")) || 0,
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    status: "Active",
    objective: (formData.get("objective") as string) || null,
    region: (formData.get("region") as string) || null,
    branch: (formData.get("branch") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/campaigns")
  revalidatePath("/")
  return { success: true }
}

export async function deleteCampaign(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("campaigns").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/campaigns")
  revalidatePath("/")
  return { success: true }
}

// ─── Opportunities ───────────────────────────────────────

export async function createOpportunity(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("opportunities").insert({
    name: formData.get("name") as string,
    value: Number(formData.get("value")) || 0,
    stage: "Qualified",
    probability: Number(formData.get("probability")) || 50,
    grade: (formData.get("grade") as string) || "Silver",
    owner: (formData.get("owner") as string) || null,
    campaign_id: (formData.get("campaign_id") as string) || null,
    lead_id: (formData.get("lead_id") as string) || null,
    expected_close_date: (formData.get("expected_close_date") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  revalidatePath("/")
  return { success: true }
}

export async function updateOpportunityStage(id: string, stage: string) {
  const supabase = await createClient()
  const updates: Record<string, unknown> = { stage }
  if (stage === "Qualified") updates.probability = 30
  if (stage === "Negotiation") updates.probability = 65
  if (stage === "Closed Won") updates.probability = 100
  const { error } = await supabase.from("opportunities").update(updates).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  revalidatePath("/")
  return { success: true }
}

export async function deleteOpportunity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("opportunities").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  revalidatePath("/")
  return { success: true }
}

// ─── Contracts ───────────────────────────────────────────

export async function createContract(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("contracts").insert({
    name: formData.get("name") as string,
    amount: Number(formData.get("amount")) || 0,
    status: "Signed",
    opportunity_id: (formData.get("opportunity_id") as string) || null,
    campaign_id: (formData.get("campaign_id") as string) || null,
    signed_date: new Date().toISOString(),
  })
  if (error) return { error: error.message }
  revalidatePath("/pipeline")
  revalidatePath("/revenue")
  revalidatePath("/")
  return { success: true }
}

export async function deleteContract(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("contracts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/revenue")
  revalidatePath("/")
  return { success: true }
}

// ─── Products ────────────────────────────────────────────

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").insert({
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category: (formData.get("category") as string) || "Router",
    price: Number(formData.get("price")) || 0,
    sku: (formData.get("sku") as string) || null,
    in_stock: formData.get("in_stock") === "true",
  })
  if (error) return { error: error.message }
  revalidatePath("/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/products")
  return { success: true }
}
