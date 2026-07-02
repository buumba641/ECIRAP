export type Campaign = {
  id: string
  name: string
  type: string
  channel: string | null
  budget: number
  start_date: string | null
  end_date: string | null
  status: string
  objective: string | null
  region: string | null
  branch: string | null
  created_at: string
}

export type Lead = {
  id: string
  campaign_id: string | null
  account_id: string | null
  name: string
  company: string | null
  email: string | null
  phone: string | null
  source: string | null
  status: string
  score: number
  owner: string | null
  created_at: string
}

export type Opportunity = {
  id: string
  lead_id: string | null
  campaign_id: string | null
  account_id: string | null
  name: string
  value: number
  stage: string
  probability: number
  grade: string
  owner: string | null
  expected_close_date: string | null
  created_at: string
}

export type Contract = {
  id: string
  opportunity_id: string | null
  campaign_id: string | null
  account_id: string | null
  name: string
  amount: number
  status: string
  signed_date: string | null
  start_date: string | null
  end_date: string | null
  renewal_date: string | null
  created_at: string
}

export type Product = {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  sku: string | null
  in_stock: boolean
  created_at: string
}

// ─── New entity types ────────────────────────────────────────

export type Industry = {
  id: string
  name: string
  created_at: string
}

export type Branch = {
  id: string
  name: string
  province: string
  created_at: string
}

export type Account = {
  id: string
  name: string
  industry_id: string | null
  tier: "Platinum" | "Gold" | "Silver" | "Bronze"
  health_score: number
  annual_revenue: number
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  province: string | null
  branch_id: string | null
  owner_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  industry_name?: string
  branch_name?: string
  owner_name?: string
  contact_count?: number
  opportunity_count?: number
  contract_count?: number
}

export type Contact = {
  id: string
  account_id: string | null
  first_name: string
  last_name: string
  job_title: string | null
  role: "Decision Maker" | "Influencer" | "Technical" | "End User" | "Champion"
  email: string | null
  phone: string | null
  is_primary: boolean
  notes: string | null
  created_at: string
}

export type Quotation = {
  id: string
  opportunity_id: string | null
  account_id: string | null
  name: string
  total_amount: number
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
  valid_until: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  // Joined
  account_name?: string
  opportunity_name?: string
}

export type QuotationItem = {
  id: string
  quotation_id: string
  product_id: string | null
  service_id: string | null
  description: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
}

export type Invoice = {
  id: string
  contract_id: string | null
  account_id: string | null
  invoice_number: string | null
  amount: number
  paid_amount: number
  status: "Pending" | "Partial" | "Paid" | "Overdue" | "Cancelled"
  due_date: string | null
  paid_date: string | null
  notes: string | null
  created_at: string
  // Joined
  account_name?: string
  contract_name?: string
}

export type Service = {
  id: string
  name: string
  description: string | null
  category: "Bandwidth" | "SLA" | "Managed Service" | "Installation" | "Support"
  monthly_price: number
  setup_fee: number
  is_active: boolean
  created_at: string
}

export type Activity = {
  id: string
  account_id: string | null
  contact_id: string | null
  type: "Call" | "Email" | "Meeting" | "Note" | "Task" | "Follow-up"
  subject: string
  description: string | null
  outcome: string | null
  scheduled_at: string | null
  completed_at: string | null
  owner_id: string | null
  created_at: string
  // Joined
  contact_name?: string
  owner_name?: string
}

export type RevenueAlert = {
  id: string
  type: string
  severity: "Low" | "Medium" | "High" | "Critical"
  title: string
  description: string | null
  entity_type: string | null
  entity_id: string | null
  resolved: boolean
  resolved_at: string | null
  created_at: string
}

export type Profile = {
  id: string
  full_name: string
  role: string
  branch: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}
