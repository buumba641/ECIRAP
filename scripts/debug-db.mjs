import postgres from 'postgres';

const DATABASE_URL = 'postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const sql = postgres(DATABASE_URL);

async function main() {
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("Tables in public schema:");
    tables.forEach(t => console.log(t.table_name));

    // For campaigns, leads, etc, let's see their columns
    for (const tableName of ['campaigns', 'leads', 'opportunities', 'contracts', 'products', 'accounts']) {
      const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${tableName}
      `;
      if (cols.length > 0) {
        console.log(`\nColumns for ${tableName}:`);
        cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

main();
