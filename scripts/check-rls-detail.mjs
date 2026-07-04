import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const sql = postgres(DATABASE_URL);

async function main() {
  try {
    // Get full RLS policy details including the actual conditions
    const policies = await sql`
      SELECT 
        schemaname, 
        tablename, 
        policyname, 
        permissive, 
        roles,
        cmd, 
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname
    `;
    
    console.log("=== DETAILED RLS POLICIES ===\n");
    for (const p of policies) {
      console.log(`TABLE: ${p.tablename}`);
      console.log(`  Policy: ${p.policyname}`);
      console.log(`  Command: ${p.cmd}`);
      console.log(`  Roles: ${p.roles}`);
      console.log(`  Permissive: ${p.permissive}`);
      console.log(`  USING (qual): ${p.qual || 'NULL'}`);
      console.log(`  WITH CHECK: ${p.with_check || 'NULL'}`);
      console.log('');
    }

    // Now test: can the anon key actually SELECT from employees?
    // We simulate what the Supabase client does
    console.log("=== TESTING ANON ACCESS ===\n");
    
    // Test a simple query on each key table via the direct connection
    // (this bypasses RLS since we're using postgres role)
    // The real question is whether the anon role has access
    
    const anonPerms = await sql`
      SELECT 
        grantee, table_name, privilege_type
      FROM information_schema.table_privileges 
      WHERE table_schema = 'public' 
        AND grantee IN ('anon', 'authenticated', 'service_role')
      ORDER BY table_name, grantee, privilege_type
    `;
    
    console.log("=== TABLE GRANTS ===\n");
    let currentTable = '';
    for (const p of anonPerms) {
      if (p.table_name !== currentTable) {
        currentTable = p.table_name;
        console.log(`\n${p.table_name}:`);
      }
      console.log(`  ${p.grantee}: ${p.privilege_type}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

main();
