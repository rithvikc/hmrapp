const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users?.find(u => u.email === 'admin@myhmr.ai');
    
    let authData;
    if (existingUser) {
      console.log('Admin user already exists:', existingUser.id);
      authData = { user: existingUser };
    } else {
      // Create the admin user in Supabase Auth
      const result = await supabase.auth.admin.createUser({
        email: 'admin@myhmr.ai',
        password: 'AdminPass123!',
        email_confirm: true,
        user_metadata: {
          role: 'admin',
          name: 'Admin User',
          registration_number: 'MRN-ADMIN-001'
        }
      });

      if (result.error) {
        console.error('Error creating auth user:', result.error);
        return;
      }
      
      authData = result.data;
      console.log('Auth user created successfully:', authData.user.id);
    }

    // Check if pharmacist record exists
    const { data: existingPharmacist } = await supabase
      .from('pharmacists')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    let pharmacistData;
    if (existingPharmacist) {
      console.log('Pharmacist record already exists:', existingPharmacist.id);
      pharmacistData = existingPharmacist;
    } else {
      // Create the pharmacist record
      const result = await supabase
        .from('pharmacists')
        .insert([{
          user_id: authData.user.id,
          name: 'Admin User',
          email: 'admin@myhmr.ai',
          registration_number: 'MRN-ADMIN-001',
          phone: '+61 400 000 000',
          practice_name: 'myHMR Administration',
          practice_address: 'Sydney, NSW, Australia'
        }])
        .select()
        .single();

      if (result.error) {
        console.error('Error creating pharmacist record:', result.error);
        return;
      }
      
      pharmacistData = result.data;
      console.log('Pharmacist record created successfully:', pharmacistData.id);
    }

    // Check if subscription exists
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('pharmacist_id', pharmacistData.id)
      .single();

    if (existingSubscription) {
      console.log('Subscription already exists for this pharmacist');
    } else {
      // Create a professional subscription for the admin
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .insert([{
          pharmacist_id: pharmacistData.id,
          plan_id: 'professional',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        }])
        .select()
        .single();

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError);
        return;
      }

      console.log('Professional subscription created successfully');
    }

    console.log('='.repeat(50));
    console.log('ADMIN LOGIN CREDENTIALS:');
    console.log('Email: admin@myhmr.ai');
    console.log('Password: AdminPass123!');
    console.log('Plan: Professional (30 reports/month)');
    console.log('User ID:', authData.user.id);
    console.log('Pharmacist ID:', pharmacistData.id);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser(); 