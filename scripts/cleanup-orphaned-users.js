const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function cleanupOrphanedUsers() {
  console.log('🧹 Starting cleanup of orphaned auth users...\n');

  // Create Supabase client with service role key for admin operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`📊 Found ${authUsers.users.length} auth users`);

    // Get all pharmacist records
    const { data: pharmacists, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('user_id');
    if (pharmacistError) {
      console.error('❌ Error fetching pharmacists:', pharmacistError);
      return;
    }

    console.log(`📊 Found ${pharmacists.length} pharmacist records`);

    // Find orphaned users (auth users without pharmacist records)
    const pharmacistUserIds = new Set(pharmacists.map(p => p.user_id));
    const orphanedUsers = authUsers.users.filter(user => !pharmacistUserIds.has(user.id));

    console.log(`\n🔍 Found ${orphanedUsers.length} orphaned auth users`);

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found. Database is clean!');
      return;
    }

    // Show orphaned users
    console.log('\n📋 Orphaned users:');
    orphanedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id}) - Created: ${new Date(user.created_at).toLocaleDateString()}`);
    });

    // Ask for confirmation if running interactively
    if (process.argv.includes('--confirm') || process.argv.includes('-y')) {
      console.log('\n🗑️  Auto-confirmed. Deleting orphaned users...');
      await deleteOrphanedUsers(supabase, orphanedUsers);
    } else {
      console.log('\n⚠️  To delete these orphaned users, run this script with --confirm flag:');
      console.log('   node scripts/cleanup-orphaned-users.js --confirm');
      console.log('\n💡 This will permanently delete the auth user accounts that have no corresponding pharmacist records.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function deleteOrphanedUsers(supabase, orphanedUsers) {
  let deletedCount = 0;
  let failedCount = 0;

  for (const user of orphanedUsers) {
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) {
        console.log(`❌ Failed to delete ${user.email}: ${error.message}`);
        failedCount++;
      } else {
        console.log(`✅ Deleted orphaned user: ${user.email}`);
        deletedCount++;
      }
    } catch (error) {
      console.log(`❌ Exception deleting ${user.email}: ${error.message}`);
      failedCount++;
    }
  }

  console.log(`\n📊 Cleanup Summary:`);
  console.log(`   ✅ Successfully deleted: ${deletedCount} users`);
  console.log(`   ❌ Failed to delete: ${failedCount} users`);
  console.log(`   🎉 Cleanup complete!`);
}

// Check environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure these are set in your .env.local file');
  process.exit(1);
}

// Run the cleanup
cleanupOrphanedUsers(); 