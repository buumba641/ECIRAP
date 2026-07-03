import postgres from 'postgres';
import crypto from 'crypto';

const sql = postgres('postgresql://postgres.gdexsxevehjmhcurhlrz:1234%40Infratel@aws-0-eu-west-1.pooler.supabase.com:5432/postgres');

const roles = ['ceo', 'manager', 'hr', 'analyst', 'marketing', 'cashier', 'sales', 'accountant'];
const password = '1234';

async function main() {
  await sql`DELETE FROM auth.users WHERE email LIKE '%@ecirap.com'`;

  for (const role of roles) {
    const email = `${role}@ecirap.com`;
    const id = crypto.randomUUID();
    
    console.log(`Inserting ${email}...`);
    try {
      await sql`
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, 
          email_confirmed_at, recovery_sent_at, last_sign_in_at, 
          raw_app_meta_data, raw_user_meta_data, is_super_admin, 
          created_at, updated_at, phone, phone_confirmed_at, 
          confirmation_token, email_change, email_change_token_new, 
          email_change_confirm_status, banned_until, reauthentication_token, 
          reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous
        ) VALUES (
          ${id}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', ${email}, crypt(${password}, gen_salt('bf')),
          now(), NULL, NULL,
          '{"provider":"email","providers":["email"]}', '{}', false,
          now(), now(), NULL, NULL,
          '', '', '', 
          0, NULL, '', 
          NULL, false, NULL, false
        )
      `;
      
      const roleCapitalized = role.charAt(0).toUpperCase() + role.slice(1);
      const fullName = `Buumba (${roleCapitalized})`;
      
      await sql`
        UPDATE profiles 
        SET full_name = ${fullName}, role = ${roleCapitalized}, branch = 'Lusaka HQ' 
        WHERE id = (SELECT id FROM auth.users WHERE email = ${email})
      `;
      console.log(`Successfully created and updated ${email}`);
    } catch (e) {
      console.error(`Error with ${email}:`, e);
    }
  }
  
  console.log("Done!");
  process.exit(0);
}

main();
