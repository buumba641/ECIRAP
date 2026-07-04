import postgres from 'postgres';
import bcrypt from 'bcryptjs';

// Uses the direct database connection (no service_role key needed)
const DATABASE_URL = 'postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres';
const sql = postgres(DATABASE_URL);

const employees = [
  { email: 'ceo@ecirap.com',       fullName: 'Mulenga Kapwepwe',  role: 'CEO',        branch: 'Lusaka HQ' },
  { email: 'manager@ecirap.com',    fullName: 'Chilufya Mwamba',   role: 'Manager',    branch: 'Lusaka HQ' },
  { email: 'hr@ecirap.com',         fullName: 'Namwinga Bwalya',   role: 'HR',         branch: 'Lusaka HQ' },
  { email: 'analyst@ecirap.com',    fullName: 'Kondwani Phiri',    role: 'Analyst',    branch: 'Lusaka HQ' },
  { email: 'marketing@ecirap.com',  fullName: 'Mutale Chanda',     role: 'Marketing',  branch: 'Lusaka HQ' },
  { email: 'cashier@ecirap.com',    fullName: 'Bupe Lungu',        role: 'Cashier',    branch: 'Lusaka HQ' },
  { email: 'sales@ecirap.com',      fullName: 'Dalitso Banda',     role: 'Sales',      branch: 'Lusaka HQ' },
  { email: 'accountant@ecirap.com', fullName: 'Chisomo Tembo',     role: 'Accountant', branch: 'Lusaka HQ' },
];

const PASSWORD = '1234';

async function main() {
  console.log('Setting up employees table and seeding accounts...\n');

  // 1. Create the employees table if it doesn't exist
  console.log('Creating employees table...');
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS employees (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE NOT NULL,
      password_hash text NOT NULL,
      full_name text NOT NULL DEFAULT '',
      role text NOT NULL DEFAULT 'Sales'
        CHECK (role IN ('CEO', 'Manager', 'HR', 'Analyst', 'Marketing', 'Cashier', 'Sales', 'Accountant')),
      branch text NOT NULL DEFAULT 'Lusaka HQ',
      avatar_url text,
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (email);
  `);
  console.log('  ✓ Table ready\n');

  // 2. Clear existing @ecirap.com employees
  console.log('Clearing existing @ecirap.com employees...');
  const deleted = await sql`DELETE FROM employees WHERE email LIKE '%@ecirap.com' RETURNING email`;
  console.log(`  ✓ Removed ${deleted.length} existing employees\n`);

  // 3. Hash the password once (same for all seed users)
  console.log('Hashing password...');
  const hash = await bcrypt.hash(PASSWORD, 10);
  console.log(`  ✓ Password hashed\n`);

  // 4. Insert all employees
  console.log('Creating employee accounts:');
  for (const emp of employees) {
    await sql`
      INSERT INTO employees (email, password_hash, full_name, role, branch)
      VALUES (${emp.email}, ${hash}, ${emp.fullName}, ${emp.role}, ${emp.branch})
    `;
    console.log(`  ✓ ${emp.email} → ${emp.role}`);
  }

  // 5. Set up RLS policies (idempotent)
  console.log('\nConfiguring RLS policies...');
  await sql.unsafe(`
    ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow read on employees" ON employees;
    CREATE POLICY "Allow read on employees" ON employees FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Allow insert on employees" ON employees;
    CREATE POLICY "Allow insert on employees" ON employees FOR INSERT WITH CHECK (true);
    DROP POLICY IF EXISTS "Allow update on employees" ON employees;
    CREATE POLICY "Allow update on employees" ON employees FOR UPDATE USING (true);
    DROP POLICY IF EXISTS "Allow delete on employees" ON employees;
    CREATE POLICY "Allow delete on employees" ON employees FOR DELETE USING (true);
  `);
  console.log('  ✓ RLS policies configured');

  console.log('\n✅ All done! 8 employee accounts created.');
  console.log('   Password for all accounts: "1234"');
  console.log('   Users can now log in at /login');

  await sql.end();
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
