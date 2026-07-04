import postgres from 'postgres';

const sql = postgres('postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres');

const policies = await sql`SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename`;
for (const p of policies) {
  console.log(p.tablename + ' | ' + p.policyname + ' | ' + p.cmd);
  console.log('  USING: ' + (p.qual || 'NULL'));
  console.log('  CHECK: ' + (p.with_check || 'NULL'));
  console.log('');
}
await sql.end();
