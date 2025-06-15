import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuthenticatedUserWithPharmacist } from '@/lib/auth-helpers';
import { createClient } from '@/lib/supabase';

// Initialize Stripe with proper error handling
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Stripe secret key not configured');
  }
  return new Stripe(secretKey);
};

export async function POST(request: NextRequest) {
  try {
    // Check for Stripe configuration first
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment processing not configured' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    
    const { user, pharmacist } = await getAuthenticatedUserWithPharmacist(request);
    
    if (!user || !pharmacist) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { plan_id, success_url, cancel_url } = body;

    // Validate plan_id
    if (!plan_id || !['professional', 'business'].includes(plan_id)) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Get plan details from database
    const supabase = createClient();
    
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      console.error('Plan fetch error:', planError);
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Store the selected plan in user metadata for tracking
    try {
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: {
          ...user.user_metadata,
          selected_plan: plan_id,
          plan_selection_timestamp: new Date().toISOString()
        }
      });
    } catch (metadataError) {
      console.error('Error updating user metadata:', metadataError);
      // Continue with checkout even if metadata update fails
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId: string;
    
    // Check if customer already exists
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('pharmacist_id', pharmacist.id)
      .single();

    if (existingSubscription?.stripe_customer_id) {
      stripeCustomerId = existingSubscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        name: pharmacist.name,
        metadata: {
          pharmacist_id: pharmacist.id,
          user_id: user.id,
          selected_plan: plan_id,
        },
      });
      stripeCustomerId = customer.id;
    }

    // Create Stripe Price if not exists
    let stripePriceId = plan.stripe_price_id;
    
    if (!stripePriceId) {
      const stripePrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: plan.price_monthly,
        recurring: {
          interval: 'month',
        },
        product_data: {
          name: plan.name,
        },
        metadata: {
          plan_id: plan.id,
        },
      });
      
      stripePriceId = stripePrice.id;
      
      // Update plan with Stripe price ID
      await supabase
        .from('subscription_plans')
        .update({ stripe_price_id: stripePriceId })
        .eq('id', plan_id);
    }

    // Create or update subscription record to track the selected plan
    const subscriptionData = {
      pharmacist_id: pharmacist.id,
      plan_id: plan_id,
      stripe_customer_id: stripeCustomerId,
      status: 'pending', // Will be updated to 'active' by webhook
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, { onConflict: 'pharmacist_id' });

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      subscription_data: {
        metadata: {
          pharmacist_id: pharmacist.id,
          plan_id: plan_id,
        },
        trial_period_days: plan_id === 'professional' ? 14 : undefined, // 14-day trial for Professional
      },
      metadata: {
        pharmacist_id: pharmacist.id,
        plan_id: plan_id,
        user_id: user.id,
      },
    });

    console.log('Checkout session created:', session.id, 'for pharmacist:', pharmacist.id, 'plan:', plan_id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 