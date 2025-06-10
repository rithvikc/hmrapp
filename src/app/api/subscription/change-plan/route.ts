import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_id } = await request.json();

    if (!plan_id) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
    }

    // Get the pharmacist record
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (pharmacistError || !pharmacist) {
      return NextResponse.json({ error: 'Pharmacist record not found' }, { status: 404 });
    }

    // Verify the plan exists
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single();

    if (planError || !plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Handle Enterprise plan differently
    if (plan_id === 'enterprise') {
      return NextResponse.json({ 
        error: 'Enterprise plan requires custom setup',
        message: 'Please contact sales@myhmr.ai for Enterprise plan setup.',
        contact_sales: true
      }, { status: 400 });
    }

    // Update the user's subscription
    const { data: subscription, error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: plan_id,
        updated_at: new Date().toISOString()
      })
      .eq('pharmacist_id', pharmacist.id)
      .select(`
        *,
        subscription_plans:plan_id (
          id,
          name,
          price_monthly,
          hmr_limit,
          features
        )
      `)
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${plan.name} plan`,
      subscription,
      // For actual Stripe integration, you would create a checkout session here
      checkout_url: plan_id !== 'professional' ? `/api/subscription/create-checkout-session` : null
    });

  } catch (error) {
    console.error('Error in change plan API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 