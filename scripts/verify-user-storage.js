// Utility script to verify user storage in Supabase
// Run with: node scripts/verify-user-storage.js

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin access

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUserStorage() {
  try {
    console.log('🔍 Checking user storage in Supabase...\n');

    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`📊 Found ${authUsers.users.length} users in auth.users table`);

    // Get all pharmacists
    const { data: pharmacists, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('*');

    if (pharmacistError) {
      console.error('❌ Error fetching pharmacists:', pharmacistError);
      return;
    }

    console.log(`👥 Found ${pharmacists.length} pharmacists in pharmacists table\n`);

    // Check which users have corresponding pharmacist records
    const usersWithoutPharmacists = [];
    
    for (const user of authUsers.users) {
      const pharmacist = pharmacists.find(p => p.user_id === user.id);
      
      if (pharmacist) {
        console.log(`✅ User ${user.email} has pharmacist record (ID: ${pharmacist.id})`);
        console.log(`   Name: ${pharmacist.name}, Registration: ${pharmacist.registration_number}\n`);
      } else {
        console.log(`❌ User ${user.email} is missing pharmacist record`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log(`   Metadata:`, user.user_metadata);
        usersWithoutPharmacists.push(user);
        console.log('');
      }
    }

    if (usersWithoutPharmacists.length > 0) {
      console.log(`\n⚠️  ${usersWithoutPharmacists.length} users are missing pharmacist records`);
      console.log('You can fix this by:');
      console.log('1. Running the database trigger SQL in Supabase');
      console.log('2. Using the createMissingPharmacists() function below');
      console.log('3. Having users sign up again (if they haven\'t confirmed email yet)');
    } else {
      console.log('\n🎉 All users have corresponding pharmacist records!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function createMissingPharmacists() {
  console.log('\n🔧 Creating missing pharmacist records...\n');

  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('❌ Error fetching auth users:', authError);
    return;
  }

  const { data: pharmacists, error: pharmacistError } = await supabase
    .from('pharmacists')
    .select('user_id');
  if (pharmacistError) {
    console.error('❌ Error fetching pharmacists:', pharmacistError);
    return;
  }

  const existingUserIds = new Set(pharmacists.map(p => p.user_id));

  for (const user of authUsers.users) {
    if (!existingUserIds.has(user.id)) {
      const metadata = user.user_metadata || {};
      
      // Create pharmacist record with available data
      const pharmacistData = {
        user_id: user.id,
        email: user.email,
        name: metadata.name || `User ${user.email?.split('@')[0] || 'Unknown'}`,
        registration_number: metadata.registration_number || `TEMP-${user.id.slice(0, 8)}`,
        phone: metadata.phone || null,
        practice_name: metadata.practice || null,
        practice_address: metadata.location || null,
      };

      const { data, error } = await supabase
        .from('pharmacists')
        .insert(pharmacistData)
        .select()
        .single();

      if (error) {
        console.log(`❌ Failed to create pharmacist for ${user.email}:`, error.message);
      } else {
        console.log(`✅ Created pharmacist record for ${user.email} (ID: ${data.id})`);
      }
    }
  }

  console.log('\n✨ Finished creating missing pharmacist records');
}

// Main execution
async function main() {
  const action = process.argv[2];

  if (action === 'create') {
    await createMissingPharmacists();
  } else {
    await verifyUserStorage();
    
    if (process.argv.includes('--fix')) {
      await createMissingPharmacists();
    }
  }
}

main().catch(console.error); 