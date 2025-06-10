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

    // Get the pharmacist record
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (pharmacistError || !pharmacist) {
      return NextResponse.json({ error: 'Pharmacist record not found' }, { status: 404 });
    }

    // Update subscription to cancel at period end
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('pharmacist_id', pharmacist.id)
      .select()
      .single();

    if (subscriptionError) {
      console.error('Error canceling subscription:', subscriptionError);
      return NextResponse.json({ error: 'Error canceling subscription' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully',
      subscription
    });

  } catch (error) {
    console.error('Error in subscription cancel API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 