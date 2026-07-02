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
    account_id: (formData.get("account_id") as string) || null,
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
    account_id: (formData.get("account_id") as string) || null,
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
    account_id: (formData.get("account_id") as string) || null,
    signed_date: (formData.get("signed_date") as string) || new Date().toISOString(),
    start_date: (formData.get("start_date") as string) || null,
    end_date: (formData.get("end_date") as string) || null,
    renewal_date: (formData.get("renewal_date") as string) || null,
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

// ─── Accounts ────────────────────────────────────────────

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("accounts").insert({
    name: formData.get("name") as string,
    industry_id: (formData.get("industry_id") as string) || null,
    tier: (formData.get("tier") as string) || "Silver",
    health_score: Number(formData.get("health_score")) || 70,
    annual_revenue: Number(formData.get("annual_revenue")) || 0,
    website: (formData.get("website") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    province: (formData.get("province") as string) || null,
    branch_id: (formData.get("branch_id") as string) || null,
    notes: (formData.get("notes") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/accounts")
  revalidatePath("/")
  return { success: true }
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("accounts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/accounts")
  revalidatePath("/")
  return { success: true }
}

// ─── Contacts ────────────────────────────────────────────

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("contacts").insert({
    account_id: (formData.get("account_id") as string) || null,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    job_title: (formData.get("job_title") as string) || null,
    role: (formData.get("role") as string) || "Technical",
    email: (formData.get("email") as string) || null,
    phone: (formData.get("phone") as string) || null,
    is_primary: formData.get("is_primary") === "true",
    notes: (formData.get("notes") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/accounts")
  return { success: true }
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("contacts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/accounts")
  return { success: true }
}

// ─── Quotations ──────────────────────────────────────────

export async function createQuotation(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("quotations").insert({
    name: formData.get("name") as string,
    opportunity_id: (formData.get("opportunity_id") as string) || null,
    account_id: (formData.get("account_id") as string) || null,
    total_amount: Number(formData.get("total_amount")) || 0,
    status: "Draft",
    valid_until: (formData.get("valid_until") as string) || null,
    notes: (formData.get("notes") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/quotations")
  revalidatePath("/pipeline")
  return { success: true }
}

export async function updateQuotationStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("quotations").update({ status }).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/quotations")
  return { success: true }
}

export async function deleteQuotation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("quotations").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/quotations")
  return { success: true }
}

// ─── Invoices ────────────────────────────────────────────

export async function createInvoice(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("invoices").insert({
    contract_id: (formData.get("contract_id") as string) || null,
    account_id: (formData.get("account_id") as string) || null,
    invoice_number: (formData.get("invoice_number") as string) || null,
    amount: Number(formData.get("amount")) || 0,
    paid_amount: 0,
    status: "Pending",
    due_date: (formData.get("due_date") as string) || null,
    notes: (formData.get("notes") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/invoices")
  revalidatePath("/revenue")
  return { success: true }
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createClient()
  const updates: Record<string, unknown> = { status }
  if (status === "Paid") updates.paid_date = new Date().toISOString()
  const { error } = await supabase.from("invoices").update(updates).eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/invoices")
  revalidatePath("/revenue")
  return { success: true }
}

export async function deleteInvoice(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("invoices").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/invoices")
  revalidatePath("/revenue")
  return { success: true }
}

// ─── Services ────────────────────────────────────────────

export async function createService(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").insert({
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || null,
    category: (formData.get("category") as string) || "Bandwidth",
    monthly_price: Number(formData.get("monthly_price")) || 0,
    setup_fee: Number(formData.get("setup_fee")) || 0,
    is_active: formData.get("is_active") !== "false",
  })
  if (error) return { error: error.message }
  revalidatePath("/products")
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("services").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/products")
  return { success: true }
}

// ─── Activities ──────────────────────────────────────────

export async function createActivity(formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from("activities").insert({
    account_id: (formData.get("account_id") as string) || null,
    contact_id: (formData.get("contact_id") as string) || null,
    type: (formData.get("type") as string) || "Note",
    subject: formData.get("subject") as string,
    description: (formData.get("description") as string) || null,
    outcome: (formData.get("outcome") as string) || null,
    scheduled_at: (formData.get("scheduled_at") as string) || null,
  })
  if (error) return { error: error.message }
  revalidatePath("/accounts")
  return { success: true }
}

export async function deleteActivity(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("activities").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/accounts")
  return { success: true }
}

// ─── Revenue Alerts ──────────────────────────────────────

export async function resolveAlert(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("revenue_alerts")
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/assurance")
  return { success: true }
}
