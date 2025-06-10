import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  hmr_limit: number | null;
  features: string | string[];
  stripe_price_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const supabase = createClient();
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) {
      console.error('Error fetching subscription plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription plans' },
        { status: 500 }
      );
    }
    
    // Parse features JSON for each plan
    const formattedPlans = (plans as SubscriptionPlan[]).map(plan => ({
      ...plan,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features
    }));
    
    return NextResponse.json({
      plans: formattedPlans
    });
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
} 