import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const sql = postgres(DATABASE_URL);

async function main() {
  try {
    // Check employees table
    const employees = await sql`SELECT id, email, full_name, role, branch, is_active FROM employees`;
    console.log("=== EMPLOYEES ===");
    console.log(`Count: ${employees.length}`);
    employees.forEach(e => console.log(`  ${e.email} | ${e.full_name} | ${e.role} | ${e.branch} | active:${e.is_active}`));

    // Check password_hash column exists
    const empCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'employees'
    `;
    console.log("\n=== EMPLOYEES COLUMNS ===");
    empCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    // Check row counts for all tables
    const tables = [
      'campaigns', 'leads', 'opportunities', 'contracts', 'products',
      'accounts', 'contacts', 'quotations', 'invoices', 'services',
      'activities', 'revenue_alerts', 'industries', 'branches'
    ];
    
    console.log("\n=== ROW COUNTS ===");
    for (const table of tables) {
      const result = await sql`SELECT count(*) as cnt FROM ${sql(table)}`;
      console.log(`  ${table}: ${result[0].cnt}`);
    }

    // Check RLS policies
    console.log("\n=== RLS STATUS ===");
    const rlsStatus = await sql`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    rlsStatus.forEach(r => console.log(`  ${r.tablename}: RLS ${r.rowsecurity ? 'ENABLED' : 'DISABLED'}`));

    // Check RLS policies detail
    console.log("\n=== RLS POLICIES ===");
    const policies = await sql`
      SELECT schemaname, tablename, policyname, permissive, cmd, qual 
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    if (policies.length === 0) {
      console.log("  No RLS policies found!");
    } else {
      policies.forEach(p => console.log(`  ${p.tablename}: ${p.policyname} (${p.cmd}) - ${p.permissive}`));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

main();
