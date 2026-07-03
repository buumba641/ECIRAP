import { createClient } from '@supabase/supabase-js';

// Uses the Supabase Admin API (service_role key) to properly create users.
// This ensures passwords are hashed correctly and users can actually log in.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create-users.mjs
//
// Or set it in .env.local and load it manually.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gdexsxevehjmhcurhlrz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required.');
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role (secret)');
  console.error('Run: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/create-users.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const employees = [
  { email: 'ceo@ecirap.com',        fullName: 'Mulenga Kapwepwe',  role: 'CEO',        branch: 'Lusaka HQ' },
  { email: 'manager@ecirap.com',     fullName: 'Chilufya Mwamba',   role: 'Manager',    branch: 'Lusaka HQ' },
  { email: 'hr@ecirap.com',          fullName: 'Namwinga Bwalya',   role: 'HR',         branch: 'Lusaka HQ' },
  { email: 'analyst@ecirap.com',     fullName: 'Kondwani Phiri',    role: 'Analyst',    branch: 'Lusaka HQ' },
  { email: 'marketing@ecirap.com',   fullName: 'Mutale Chanda',     role: 'Marketing',  branch: 'Lusaka HQ' },
  { email: 'cashier@ecirap.com',     fullName: 'Bupe Lungu',        role: 'Cashier',    branch: 'Lusaka HQ' },
  { email: 'sales@ecirap.com',       fullName: 'Dalitso Banda',     role: 'Sales',      branch: 'Lusaka HQ' },
  { email: 'accountant@ecirap.com',  fullName: 'Chisomo Tembo',     role: 'Accountant', branch: 'Lusaka HQ' },
];

const password = '1234';

async function main() {
  console.log('Creating ECIRAP employee accounts via Supabase Admin API...\n');

  // First, delete existing @ecirap.com users
  const { data: existingUsers } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (existingUsers?.users) {
    for (const user of existingUsers.users) {
      if (user.email?.endsWith('@ecirap.com')) {
        console.log(`Deleting existing user: ${user.email}`);
        await supabase.auth.admin.deleteUser(user.id);
      }
    }
  }

  // Create each employee
  for (const emp of employees) {
    console.log(`Creating ${emp.email} (${emp.role})...`);
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: emp.email,
      password: password,
      email_confirm: true, // Skip email verification
      user_metadata: {
        full_name: emp.fullName,
        role: emp.role,
      },
    });

    if (error) {
      console.error(`  ✗ Failed: ${error.message}`);
      continue;
    }

    // Update the profile with branch info (trigger creates the profile)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ branch: emp.branch })
      .eq('id', data.user.id);

    if (profileError) {
      console.error(`  ⚠ Profile update failed: ${profileError.message}`);
    }

    console.log(`  ✓ Created ${emp.email} → ${emp.role}`);
  }

  console.log('\n✅ All accounts created! Password for all: "1234"');
  console.log('Users can now log in at /login');
}

main().catch(console.error);
