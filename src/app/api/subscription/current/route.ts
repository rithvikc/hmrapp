import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Get subscription details with plan information
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (
          id,
          name,
          price_monthly,
          hmr_limit,
          features,
          sort_order
        )
      `)
      .eq('pharmacist_id', pharmacist.id)
      .single();

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json({ error: 'Error fetching subscription' }, { status: 500 });
    }

    // Get current usage for this month
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('hmr_count')
      .eq('pharmacist_id', pharmacist.id)
      .eq('month_year', currentMonth)
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Error fetching usage:', usageError);
    }

    // Get all available plans for plan comparison/upgrading
    const { data: allPlans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (plansError) {
      console.error('Error fetching plans:', plansError);
    }

    // If no subscription found, return null subscription data
    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        usage: {
          current_month: currentMonth,
          hmr_count: usage?.hmr_count || 0,
          limit: 0,
          can_create: false
        },
        available_plans: allPlans || []
      });
    }

    // Check if subscription is active
    const isActiveSubscription = ['active', 'trialing'].includes(subscription.status);
    const planLimit = subscription.subscription_plans?.hmr_limit;
    const currentUsage = usage?.hmr_count || 0;
    const canCreate = isActiveSubscription && (!planLimit || currentUsage < planLimit);

    return NextResponse.json({
      subscription: {
        ...subscription,
        plan_name: subscription.subscription_plans?.name || 'Unknown Plan',
      },
      usage: {
        current_month: currentMonth,
        hmr_count: currentUsage,
        limit: planLimit || 0,
        can_create: canCreate
      },
      available_plans: allPlans || []
    });

  } catch (error) {
    console.error('Error in subscription current API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 