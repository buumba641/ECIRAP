// =====================================================
// STARLINK CRM/ERP - TYPE DEFINITIONS
// =====================================================

// Role types
export type UserRole = 
  | 'Sales' 
  | 'Cashier' 
  | 'HR' 
  | 'Marketing' 
  | 'Analyst' 
  | 'Accountant' 
  | 'Manager' 
  | 'CEO';

// User and Branch types
export interface Branch {
  branch_id: string;
  branch_name: string;
  location_details: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  user_id: string;
  branch_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  base_salary: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Product types
export interface Product {
  product_id: string;
  name: string;
  is_leasable: boolean;
  price: number;
  created_at: string;
  updated_at: string;
}

// Lead types
export interface Lead {
  lead_id: string;
  branch_id: string;
  creator_agent_id: string;
  phone_number: string;
  email_address: string;
  client_name: string;
  ai_summary_raw: string | null;
  ai_summary_edited: string | null;
  is_converted: boolean;
  created_at: string;
  updated_at: string;
}

// Invoice types
export type PaymentType = 'Full_Pay' | 'Lease';
export type InvoiceStatus = 'Pending' | 'Closed_Approved' | 'Shortage';

export interface Invoice {
  invoice_id: string;
  lead_id: string;
  branch_id: string;
  closer_agent_id: string;
  payment_type: PaymentType;
  is_split_sale: boolean;
  status: InvoiceStatus;
  conversion_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

// Lease Payment types
export type LeasePaymentStatus = 'Pending' | 'Paid_Received_By_Cashier';

export interface LeasePayment {
  payment_id: string;
  invoice_id: string;
  payment_month: number;
  due_date: string;
  status: LeasePaymentStatus;
  payment_cleared_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

// Commission Ledger types
export interface AgentCommission {
  ledger_id: string;
  user_id: string;
  source_payment_id: string | null;
  invoice_id: string | null;
  commission_amount: number;
  split_applied: boolean;
  created_at: string;
  updated_at: string;
}

// Marketing Campaign types
export type CampaignType = 'Radio' | 'Outreach' | 'Banner' | 'Other';

export interface MarketingCampaign {
  campaign_id: string;
  branch_id: string;
  campaign_name: string;
  type: CampaignType;
  budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// Disbursement types
export type DisbursementStatus = 
  | 'Accountant_Requested' 
  | 'Manager_Approved' 
  | 'Funds_Released';

export interface FinancialDisbursement {
  disbursement_id: string;
  branch_id: string;
  payee_user_id: string;
  amount: number;
  status: DisbursementStatus;
  request_timestamp: string | null;
  approval_timestamp: string | null;
  release_timestamp: string | null;
  created_at: string;
  updated_at: string;
}

// Audit types
export interface Audit {
  audit_id: string;
  action_type: string;
  user_involved: string | null;
  branch_id: string | null;
  details: Record<string, any> | null;
  timestamp: string;
  created_at: string;
}

// Session/Auth types
export interface UserSession {
  user_id: string;
  branch_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

// Role Permissions type
export interface RolePermissions {
  readCRM?: boolean;
  writeCRM?: boolean;
  readFinancial?: boolean;
  writeFinancial?: boolean;
  manageUsers?: boolean;
  approveDisbursement?: boolean;
  requestDisbursement?: boolean;
  logCampaigns?: boolean;
  readRoi?: boolean;
  readGlobal?: boolean;
  filterByBranch?: boolean;
}
