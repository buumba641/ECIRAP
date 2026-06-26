export type Campaign = {
  id: string
  name: string
  type: string
  channel?: string | null
  budget: number
  start_date: string | null
  end_date: string | null
  status: string
  objective: string | null
  region?: string | null
  branch?: string | null
  created_at: string
}

export type Lead = {
  id: string
  campaign_id: string | null
  name: string
  company?: string | null
  email: string | null
  phone: string | null
  source: string | null
  status: string
  score?: number
  owner?: string | null
  created_at: string
}

export type Opportunity = {
  id: string
  lead_id: string | null
  campaign_id: string | null
  name: string
  value: number
  stage: string
  probability: number
  grade?: string
  owner?: string | null
  expected_close_date: string | null
  created_at: string
}

export type Contract = {
  id: string
  opportunity_id: string | null
  campaign_id: string | null
  name: string
  amount: number
  status: string
  signed_date: string | null
  created_at: string
}
