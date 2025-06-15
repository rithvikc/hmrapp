import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
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
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe webhook not configured' },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Processing Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing checkout session completed:', session.id);
  
  const pharmacistId = session.metadata?.pharmacist_id;
  const planId = session.metadata?.plan_id;
  const userId = session.metadata?.user_id;

  if (!pharmacistId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const supabase = createClient();

  try {
    // Get subscription details from Stripe
    let subscriptionId = session.subscription as string;
    let currentPeriodStart = new Date();
    let currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    if (subscriptionId) {
      try {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
        currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
      } catch (stripeError) {
        console.error('Error fetching subscription from Stripe:', stripeError);
      }
    }

    // Create or update subscription record
    const subscriptionData = {
      pharmacist_id: pharmacistId,
      plan_id: planId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      status: 'active',
      current_period_start: currentPeriodStart.toISOString(),
      current_period_end: currentPeriodEnd.toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, { onConflict: 'pharmacist_id' });

    if (upsertError) {
      console.error('Error creating/updating subscription record:', upsertError);
      return;
    }

    console.log('Subscription record created/updated for pharmacist:', pharmacistId, 'plan:', planId);

    // Update user metadata to reflect successful subscription
    if (userId) {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(userId);
        if (user) {
          await supabase.auth.admin.updateUserById(userId, {
            user_metadata: {
              ...user.user_metadata,
              subscription_status: 'active',
              current_plan: planId,
              subscription_created_at: new Date().toISOString()
            }
          });
        }
      } catch (metadataError) {
        console.error('Error updating user metadata after successful payment:', metadataError);
        // Don't fail the webhook if metadata update fails
      }
    }

    // Initialize usage tracking for the new subscription
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .upsert({
        pharmacist_id: pharmacistId,
        month: currentMonth,
        hmr_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'pharmacist_id,month' });

    if (usageError) {
      console.error('Error initializing usage tracking:', usageError);
    }

  } catch (error) {
    console.error('Error in handleCheckoutSessionCompleted:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  const pharmacistId = subscription.metadata?.pharmacist_id;
  const planId = subscription.metadata?.plan_id;

  if (!pharmacistId || !planId) {
    console.error('Missing metadata in subscription:', subscription.id);
    return;
  }

  const supabase = createClient();

  const subscriptionData = {
    pharmacist_id: pharmacistId,
    plan_id: planId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, { onConflict: 'pharmacist_id' });

  if (error) {
    console.error('Error updating subscription record:', error);
  } else {
    console.log('Subscription record updated for pharmacist:', pharmacistId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  const supabase = createClient();

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription status:', error);
  } else {
    console.log('Subscription updated:', subscription.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  const supabase = createClient();

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription status:', error);
  } else {
    console.log('Subscription cancelled:', subscription.id);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id);
  
  if ((invoice as any).subscription) {
    const supabase = createClient();

    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', (invoice as any).subscription as string);

    if (error) {
      console.error('Error updating subscription status:', error);
    } else {
      console.log('Subscription reactivated:', (invoice as any).subscription);
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment failed:', invoice.id);
  
  if ((invoice as any).subscription) {
    const supabase = createClient();

    const { error } = await supabase
      .from('user_subscriptions')
      .update({ 
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', (invoice as any).subscription as string);

    if (error) {
      console.error('Error updating subscription status:', error);
    } else {
      console.log('Subscription marked past due:', (invoice as any).subscription);
    }
  }
} 