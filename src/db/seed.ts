import { sql } from 'drizzle-orm';
import { db } from './index.ts';
import {
  branches,
  users,
  leads,
  products,
  sales_deals,
  invoices,
  lease_payments,
  marketing_campaigns,
  financial_disbursements,
  audits,
} from './schema.ts';

/**
 * Seeds the Neon database with realistic sample data so every dashboard
 * (CEO / Sales / Cashier / Accountant / etc.) renders live numbers.
 * Safe to re-run: it truncates all tables first.
 */
async function seed() {
  console.log('Clearing existing data...');
  // Order matters because of FK constraints. RESTART IDENTITY resets serials.
  await db.execute(sql`
    TRUNCATE TABLE
      audits,
      financial_disbursements,
      lease_payments,
      invoices,
      sales_deals,
      leads,
      marketing_campaigns,
      products,
      users,
      branches
    RESTART IDENTITY CASCADE;
  `);


  console.log('Seeding branches...');
  const branchRows = await db
    .insert(branches)
    .values([
      { branch_name: 'Lusaka Downtown', location_details: 'Cairo Road, Lusaka' },
      { branch_name: 'Kitwe Central', location_details: 'Obote Avenue, Kitwe' },
      { branch_name: 'Livingstone Hub', location_details: 'Mosi-oa-Tunya Rd, Livingstone' },
    ])
    .returning();

  const [lusaka, kitwe, livingstone] = branchRows;

  console.log('Seeding users...');
  const userRows = await db
    .insert(users)
    .values([
      // CEO has no branch (global)
      { branch_id: null, role: 'CEO', name: 'Grace Mwale', email: 'ceo@starlink.zm', base_salary: '25000' },

      // Lusaka
      { branch_id: lusaka.branch_id, role: 'Manager', name: 'Peter Banda', email: 'pbanda@starlink.zm', base_salary: '12000' },
      { branch_id: lusaka.branch_id, role: 'Sales', name: 'Joseph Phiri', email: 'jphiri@starlink.zm', base_salary: '4000' },
      { branch_id: lusaka.branch_id, role: 'Sales', name: 'Mary Tembo', email: 'mtembo@starlink.zm', base_salary: '4000' },
      { branch_id: lusaka.branch_id, role: 'Cashier', name: 'Linda Zulu', email: 'lzulu@starlink.zm', base_salary: '3500' },
      { branch_id: lusaka.branch_id, role: 'Accountant', name: 'Sam Daka', email: 'sdaka@starlink.zm', base_salary: '8000' },
      { branch_id: lusaka.branch_id, role: 'HR', name: 'Ruth Chanda', email: 'rchanda@starlink.zm', base_salary: '7000' },
      { branch_id: lusaka.branch_id, role: 'Marketing', name: 'Brian Mulenga', email: 'bmulenga@starlink.zm', base_salary: '6000' },
      { branch_id: lusaka.branch_id, role: 'Analyst', name: 'Chipo Sakala', email: 'csakala@starlink.zm', base_salary: '6500' },

      // Kitwe
      { branch_id: kitwe.branch_id, role: 'Manager', name: 'Agnes Lungu', email: 'alungu@starlink.zm', base_salary: '12000' },
      { branch_id: kitwe.branch_id, role: 'Sales', name: 'David Mwansa', email: 'dmwansa@starlink.zm', base_salary: '4000' },
      { branch_id: kitwe.branch_id, role: 'Cashier', name: 'Esther Kunda', email: 'ekunda@starlink.zm', base_salary: '3500' },

      // Livingstone
      { branch_id: livingstone.branch_id, role: 'Manager', name: 'Felix Nyirenda', email: 'fnyirenda@starlink.zm', base_salary: '12000' },
      { branch_id: livingstone.branch_id, role: 'Sales', name: 'Patricia Mbewe', email: 'pmbewe@starlink.zm', base_salary: '4000' },
      { branch_id: livingstone.branch_id, role: 'Cashier', name: 'Gift Chileshe', email: 'gchileshe@starlink.zm', base_salary: '3500' },
    ])
    .returning();

  const byEmail = (email: string) => userRows.find((u) => u.email === email)!;

  console.log('Seeding products...');
  await db.insert(products).values([
    { product_name: 'Starlink Standard Kit', is_leasable: true, price: '599' },
    { product_name: 'Starlink Gen 2 Kit', is_leasable: true, price: '899' },
    { product_name: 'Starlink Mini', is_leasable: false, price: '450' },
    { product_name: 'Mounting & Install', is_leasable: false, price: '120' },
  ]);

  console.log('Seeding marketing campaigns...');
  await db.insert(marketing_campaigns).values([
    { branch_id: lusaka.branch_id, type: 'Radio', name: 'Hot FM Morning Drive', start_date: new Date('2026-05-01') },
    { branch_id: lusaka.branch_id, type: 'Banner', name: 'Cairo Road Billboard', start_date: new Date('2026-05-15') },
    { branch_id: kitwe.branch_id, type: 'Outreach', name: 'Copperbelt Farmers Expo', start_date: new Date('2026-06-01') },
    { branch_id: livingstone.branch_id, type: 'Radio', name: 'Tourism Week Spots', start_date: new Date('2026-06-10') },
  ]);

  console.log('Seeding leads...');
  const leadRows = await db
    .insert(leads)
    .values([
      {
        branch_id: lusaka.branch_id,
        creator_agent_id: byEmail('jphiri@starlink.zm').user_id,
        phone_number: '+260971234561',
        email_address: 'john.doe1@example.com',
        client_name: 'John Doe',
        ai_summary_edited: 'Interested in Gen 2 Kit. Needs installation at farm outside Lusaka.',
      },
      {
        branch_id: lusaka.branch_id,
        creator_agent_id: byEmail('mtembo@starlink.zm').user_id,
        phone_number: '+260971234562',
        email_address: 'jane.k@example.com',
        client_name: 'Jane Kabwe',
        ai_summary_edited: 'Small business owner, wants reliable uptime. Leaning toward lease.',
        conversion_timestamp: new Date('2026-06-20'),
      },
      {
        branch_id: lusaka.branch_id,
        creator_agent_id: byEmail('jphiri@starlink.zm').user_id,
        phone_number: '+260971234563',
        email_address: 'mike.s@example.com',
        client_name: 'Mike Soko',
        ai_summary_edited: 'Full pay, ready to buy Standard Kit immediately.',
        conversion_timestamp: new Date('2026-06-22'),
      },
      {
        branch_id: kitwe.branch_id,
        creator_agent_id: byEmail('dmwansa@starlink.zm').user_id,
        phone_number: '+260971234564',
        email_address: 'grace.m@example.com',
        client_name: 'Grace Mumba',
        ai_summary_edited: 'Lodge owner in Kitwe, multiple units potential.',
        conversion_timestamp: new Date('2026-06-18'),
      },
      {
        branch_id: livingstone.branch_id,
        creator_agent_id: byEmail('pmbewe@starlink.zm').user_id,
        phone_number: '+260971234565',
        email_address: 'tom.b@example.com',
        client_name: 'Tom Bwalya',
        ai_summary_edited: 'Tour operator, needs connectivity at remote camp.',
        conversion_timestamp: new Date('2026-06-19'),
      },
    ])
    .returning();

  console.log('Seeding sales deals + invoices + lease payments...');
  // Helper to add a deal with its invoice
  type DealSpec = {
    lead: typeof leadRows[number];
    closerEmail: string;
    cashierEmail: string;
    paymentType: 'Full_Pay' | 'Lease';
    status: 'Pending' | 'Closed_Approved' | 'Shortage';
    amount: string;
    isSplit?: boolean;
    leaseMonthsPaid?: number;
    leaseMonthsTotal?: number;
  };

  const dealSpecs: DealSpec[] = [
    {
      lead: leadRows[2], // Mike Soko - full pay
      closerEmail: 'jphiri@starlink.zm',
      cashierEmail: 'lzulu@starlink.zm',
      paymentType: 'Full_Pay',
      status: 'Closed_Approved',
      amount: '599',
    },
    {
      lead: leadRows[1], // Jane Kabwe - lease
      closerEmail: 'mtembo@starlink.zm',
      cashierEmail: 'lzulu@starlink.zm',
      paymentType: 'Lease',
      status: 'Closed_Approved',
      amount: '899',
      leaseMonthsPaid: 2,
      leaseMonthsTotal: 6,
    },
    {
      lead: leadRows[3], // Grace Mumba - lease (Kitwe)
      closerEmail: 'dmwansa@starlink.zm',
      cashierEmail: 'ekunda@starlink.zm',
      paymentType: 'Lease',
      status: 'Closed_Approved',
      amount: '899',
      isSplit: true,
      leaseMonthsPaid: 1,
      leaseMonthsTotal: 6,
    },
    {
      lead: leadRows[4], // Tom Bwalya - full pay (Livingstone)
      closerEmail: 'pmbewe@starlink.zm',
      cashierEmail: 'gchileshe@starlink.zm',
      paymentType: 'Full_Pay',
      status: 'Closed_Approved',
      amount: '450',
    },
  ];

  for (const spec of dealSpecs) {
    const [deal] = await db
      .insert(sales_deals)
      .values({
        lead_id: spec.lead.lead_id,
        branch_id: spec.lead.branch_id,
        closer_agent_id: byEmail(spec.closerEmail).user_id,
        cashier_id: byEmail(spec.cashierEmail).user_id,
        is_split_commission: spec.isSplit ?? false,
        payment_status: spec.status,
      })
      .returning();

    const [invoice] = await db
      .insert(invoices)
      .values({
        deal_id: deal.deal_id,
        payment_type: spec.paymentType,
        total_amount: spec.amount,
      })
      .returning();

    if (spec.paymentType === 'Lease' && spec.leaseMonthsTotal) {
      const monthly = (Number(spec.amount) / spec.leaseMonthsTotal).toFixed(2);
      const paymentValues = [];
      for (let m = 1; m <= spec.leaseMonthsTotal; m++) {
        const paid = m <= (spec.leaseMonthsPaid ?? 0);
        paymentValues.push({
          invoice_id: invoice.invoice_id,
          payment_month: m,
          status: (paid ? 'Paid' : 'Pending') as 'Paid' | 'Pending',
          due_date: new Date(2026, 5 + m, 1),
          payment_cleared_timestamp: paid ? new Date(2026, 5 + m, 3) : null,
          // monthly amount tracked via invoice total / months; column not in schema so we keep due cadence
        });
      }
      // Note: monthly amount derived from invoice; lease_payments schema tracks status/dates.
      void monthly;
      await db.insert(lease_payments).values(paymentValues);
    }
  }

  console.log('Seeding financial disbursements...');
  await db.insert(financial_disbursements).values([
    {
      accountant_id: byEmail('sdaka@starlink.zm').user_id,
      manager_id: byEmail('pbanda@starlink.zm').user_id,
      payee_user_id: byEmail('jphiri@starlink.zm').user_id,
      amount: '5250',
      status: 'Released',
      approval_timestamp: new Date('2026-06-25'),
      release_timestamp: new Date('2026-06-26'),
    },
    {
      accountant_id: byEmail('sdaka@starlink.zm').user_id,
      manager_id: byEmail('pbanda@starlink.zm').user_id,
      payee_user_id: byEmail('mtembo@starlink.zm').user_id,
      amount: '4800',
      status: 'Manager_Approved',
      approval_timestamp: new Date('2026-06-28'),
    },
    {
      accountant_id: byEmail('sdaka@starlink.zm').user_id,
      payee_user_id: byEmail('lzulu@starlink.zm').user_id,
      amount: '3500',
      status: 'Requested',
    },
  ]);

  console.log('Seeding audit log...');
  await db.insert(audits).values([
    { action_type: 'DEAL_CLOSED', user_involved: byEmail('jphiri@starlink.zm').user_id, description: 'Closed full-pay deal for Mike Soko' },
    { action_type: 'DISBURSEMENT_RELEASED', user_involved: byEmail('sdaka@starlink.zm').user_id, description: 'Released payroll to Joseph Phiri' },
    { action_type: 'LEASE_PAYMENT', user_involved: byEmail('mtembo@starlink.zm').user_id, description: 'Jane Kabwe cleared month 2 lease payment' },
  ]);

  console.log('Seed complete.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
