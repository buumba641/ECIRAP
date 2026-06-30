import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['Sales', 'HR', 'Analyst', 'Cashier', 'Marketing', 'Accountant', 'Manager', 'CEO']);
export const paymentTypeEnum = pgEnum('payment_type', ['Full_Pay', 'Lease']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['Pending', 'Closed_Approved', 'Shortage']);
export const leaseStatusEnum = pgEnum('lease_status', ['Pending', 'Paid']);
export const disbursementStatusEnum = pgEnum('disbursement_status', ['Requested', 'Manager_Approved', 'Released']);

export const branches = pgTable('branches', {
  branch_id: serial('branch_id').primaryKey(),
  branch_name: text('branch_name').notNull(),
  location_details: text('location_details'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  user_id: serial('user_id').primaryKey(),
  branch_id: integer('branch_id').references(() => branches.branch_id),
  role: userRoleEnum('role').notNull(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  base_salary: numeric('base_salary').default('0').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const leads = pgTable('leads', {
  lead_id: serial('lead_id').primaryKey(),
  branch_id: integer('branch_id').references(() => branches.branch_id).notNull(),
  creator_agent_id: integer('creator_agent_id').references(() => users.user_id).notNull(),
  phone_number: text('phone_number').unique().notNull(),
  email_address: text('email_address').unique(),
  client_name: text('client_name').notNull(),
  ai_summary_raw: text('ai_summary_raw'),
  ai_summary_edited: text('ai_summary_edited'),
  conversion_timestamp: timestamp('conversion_timestamp'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const products = pgTable('products', {
  product_id: serial('product_id').primaryKey(),
  product_name: text('product_name').notNull(),
  is_leasable: boolean('is_leasable').default(false).notNull(),
  price: numeric('price').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const sales_deals = pgTable('sales_deals', {
  deal_id: serial('deal_id').primaryKey(),
  lead_id: integer('lead_id').references(() => leads.lead_id).notNull(),
  branch_id: integer('branch_id').references(() => branches.branch_id).notNull(),
  closer_agent_id: integer('closer_agent_id').references(() => users.user_id).notNull(),
  cashier_id: integer('cashier_id').references(() => users.user_id),
  is_split_commission: boolean('is_split_commission').default(false).notNull(),
  payment_status: invoiceStatusEnum('payment_status').default('Pending').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  invoice_id: serial('invoice_id').primaryKey(),
  deal_id: integer('deal_id').references(() => sales_deals.deal_id).notNull(),
  payment_type: paymentTypeEnum('payment_type').notNull(),
  total_amount: numeric('total_amount').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const lease_payments = pgTable('lease_payments', {
  payment_id: serial('payment_id').primaryKey(),
  invoice_id: integer('invoice_id').references(() => invoices.invoice_id).notNull(),
  payment_month: integer('payment_month').notNull(), // 1, 2, 3...
  status: leaseStatusEnum('status').default('Pending').notNull(),
  due_date: timestamp('due_date').notNull(),
  payment_cleared_timestamp: timestamp('payment_cleared_timestamp'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const marketing_campaigns = pgTable('marketing_campaigns', {
  campaign_id: serial('campaign_id').primaryKey(),
  branch_id: integer('branch_id').references(() => branches.branch_id).notNull(),
  type: text('type').notNull(), // Radio, Outreach, Banner
  name: text('name').notNull(),
  start_date: timestamp('start_date'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const financial_disbursements = pgTable('financial_disbursements', {
  disbursement_id: serial('disbursement_id').primaryKey(),
  accountant_id: integer('accountant_id').references(() => users.user_id).notNull(),
  manager_id: integer('manager_id').references(() => users.user_id),
  payee_user_id: integer('payee_user_id').references(() => users.user_id),
  amount: numeric('amount').notNull(),
  status: disbursementStatusEnum('status').default('Requested').notNull(),
  request_timestamp: timestamp('request_timestamp').defaultNow().notNull(),
  approval_timestamp: timestamp('approval_timestamp'),
  release_timestamp: timestamp('release_timestamp'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const audits = pgTable('audits', {
  audit_id: serial('audit_id').primaryKey(),
  action_type: text('action_type').notNull(),
  user_involved: integer('user_involved').references(() => users.user_id),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
