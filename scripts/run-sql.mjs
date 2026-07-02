import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = 'postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';

const sql = postgres(DATABASE_URL);

async function main() {
  const scripts = [
    'setup-tables.sql',
    'setup-auth.sql',
    'setup-full-schema.sql',
    'seed-data.sql'
  ];

  try {
    console.log("Dropping existing tables to avoid conflicts...");
    // Get all tables in public schema
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `;
    
    // Drop all of them cascade
    for (const t of tables) {
      console.log(`Dropping table ${t.table_name}...`);
      await sql.unsafe(`DROP TABLE IF EXISTS public."${t.table_name}" CASCADE;`);
    }

    // Now run the scripts
    for (const file of scripts) {
      console.log(`Running ${file}...`);
      const filePath = path.join(__dirname, file);
      const query = fs.readFileSync(filePath, 'utf8');
      
      await sql.unsafe(query);
      console.log(`Successfully executed ${file}\n`);
    }
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error executing scripts:', error);
  } finally {
    await sql.end();
  }
}

main();
