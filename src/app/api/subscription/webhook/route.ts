import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
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

  if (!pharmacistId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  const supabase = createClient();

  // Create or update subscription record
  const subscriptionData = {
    pharmacist_id: pharmacistId,
    plan_id: planId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: session.subscription as string,
    status: 'active',
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
  };

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, { onConflict: 'pharmacist_id' });

  if (error) {
    console.error('Error creating subscription record:', error);
  } else {
    console.log('Subscription record created for pharmacist:', pharmacistId);
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
    current_period_start: new Date((subscription as any).current_period_start * 1000),
    current_period_end: new Date((subscription as any).current_period_end * 1000),
    trial_ends_at: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
  };

  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, { onConflict: 'pharmacist_id' });

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log('Subscription updated for pharmacist:', pharmacistId);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  const supabase = createClient();

  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000),
      current_period_end: new Date((subscription as any).current_period_end * 1000),
      trial_ends_at: (subscription as any).trial_end ? new Date((subscription as any).trial_end * 1000) : null,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
  } else {
    console.log('Subscription updated:', subscription.id);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  const supabase = createClient();

  const { error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error canceling subscription:', error);
  } else {
    console.log('Subscription canceled:', subscription.id);
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id);
  
  if ((invoice as any).subscription) {
    const supabase = createClient();

    const { error } = await supabase
      .from('user_subscriptions')
      .update({ status: 'active' })
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
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', (invoice as any).subscription as string);

    if (error) {
      console.error('Error updating subscription status:', error);
    } else {
      console.log('Subscription marked past due:', (invoice as any).subscription);
    }
  }
} 