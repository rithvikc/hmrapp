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

    // Default to professional plan if no subscription found
    let subscriptionData = subscription;
    if (!subscription) {
      // Create a professional subscription for users without one (instead of trial)
      const { data: newSubscription, error: createError } = await supabase
        .from('user_subscriptions')
        .insert([{
          pharmacist_id: pharmacist.id,
          plan_id: 'professional',
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }])
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
        .single();

      if (createError) {
        console.error('Error creating professional subscription:', createError);
        return NextResponse.json({ error: 'Error creating subscription' }, { status: 500 });
      }

      subscriptionData = newSubscription;
    }

    return NextResponse.json({
      subscription: {
        ...subscriptionData,
        plan_name: subscriptionData.subscription_plans?.name || 'Professional',
      },
      usage: {
        current_month: currentMonth,
        hmr_count: usage?.hmr_count || 0,
        limit: subscriptionData.subscription_plans?.hmr_limit || 30,
        can_create: !subscriptionData.subscription_plans?.hmr_limit || 
                   (usage?.hmr_count || 0) < subscriptionData.subscription_plans.hmr_limit
      },
      available_plans: allPlans || []
    });

  } catch (error) {
    console.error('Error in subscription current API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 