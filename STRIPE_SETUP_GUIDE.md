# 🚀 LAL MedReviews - Complete Stripe Pricing Setup Guide

## Overview
This guide will help you implement the three pricing tiers (Free Trial, Professional $100/month, Business $250/month) with full Stripe integration.

## 📋 Prerequisites
- Stripe account (test mode for development)
- Supabase project set up
- Environment variables configured

## 🎯 1. Stripe Account Setup

### Step 1: Create Stripe Account
1. Visit [https://stripe.com](https://stripe.com)
2. Sign up for a new account
3. Complete verification process
4. Switch to **Test Mode** for development

### Step 2: Get API Keys
1. Go to **Dashboard → Developers → API keys**
2. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...`

### Step 3: Create Products in Stripe Dashboard

#### Professional Plan
1. Go to **Products → Add Product**
2. **Name**: `LAL MedReviews Professional`
3. **Description**: `Professional plan for individual pharmacists - 30 HMR reports per month`
4. **Pricing**: 
   - Type: `Recurring`
   - Price: `$100.00`
   - Billing interval: `Monthly`
5. Save and copy the **Price ID** (starts with `price_`)

#### Business Plan
1. **Products → Add Product**
2. **Name**: `LAL MedReviews Business`  
3. **Description**: `Business plan for pharmacy teams - 100 HMR reports per month`
4. **Pricing**:
   - Type: `Recurring`
   - Price: `$250.00`
   - Billing interval: `Monthly`
5. Save and copy the **Price ID**

## 🔧 2. Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Configuration (if not already set)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🗄️ 3. Database Setup

### Step 1: Run Subscription Tables SQL
Copy and run the entire `create-subscription-tables.sql` file in your **Supabase SQL Editor**:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Create new query
4. Paste the SQL from `create-subscription-tables.sql`
5. Click **Run**

This creates:
- `subscription_plans` table with the 3 tiers
- `user_subscriptions` table for user subscription tracking
- `usage_tracking` table for HMR usage monitoring
- `onboarding_status` table for user onboarding
- Helper functions for usage tracking

### Step 2: Update Stripe Price IDs
After creating products in Stripe, update the database:

```sql
-- Update with your actual Stripe Price IDs
UPDATE subscription_plans 
SET stripe_price_id = 'price_PROFESSIONAL_PLAN_ID' 
WHERE id = 'professional';

UPDATE subscription_plans 
SET stripe_price_id = 'price_BUSINESS_PLAN_ID' 
WHERE id = 'business';
```

## 🎣 4. Webhook Setup

### Step 1: Create Webhook Endpoint
1. **Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/subscription/webhook`
4. **Listen to**: Select these events:
   - `checkout.session.completed`
   - `customer.subscription.created` 
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Step 2: Get Webhook Secret
1. Click on your webhook endpoint
2. Go to **Signing secret**
3. **Reveal** and copy the secret (starts with `whsec_`)
4. Add to `STRIPE_WEBHOOK_SECRET` in `.env.local`

## ⚡ 5. Test the Implementation

### Step 1: Start Development Server
```bash
npm run dev
```

### Step 2: Test Authentication
```bash
# Run authentication tests
npm test auth.test.ts
```

### Step 3: Test Subscription Flow
1. Go to `/subscription` page
2. Try selecting different plans
3. Use Stripe test cards:
   - **Success**: `4242424242424242`
   - **Decline**: `4000000000000002`
   - **3D Secure**: `4000002500003155`

### Step 4: Test Webhooks Locally
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3000/api/subscription/webhook

# Test a webhook
stripe trigger checkout.session.completed
```

## 🏗️ 6. Implementation Features

### ✅ What's Included:

#### Database Structure
- **Three pricing tiers** with proper limits
- **Usage tracking** per month
- **Subscription management** with Stripe integration
- **Onboarding status** tracking

#### API Routes
- `/api/subscription/plans` - Get available plans
- `/api/subscription/create-checkout-session` - Create Stripe checkout
- `/api/subscription/webhook` - Handle Stripe events
- `/api/subscription/start-trial` - Start free trial

#### Frontend Components
- **Pricing page** with three tiers display
- **Subscription management** in dashboard
- **Usage tracking** and limits
- **Trial status** indicators

#### Authentication Tests
- **Sign up** functionality testing
- **Sign in** with email/password
- **Google OAuth** integration
- **Password reset** flow
- **Error handling** for various scenarios
- **Session management** testing

### 🎨 UI Features:
- **Beautiful pricing cards** with distinct styling
- **"Most Popular" badge** on Professional plan
- **Usage progress bars** showing HMR limits
- **Trial countdown** display
- **Subscription status** indicators
- **Upgrade prompts** for trial users

## 🔄 7. Workflow Integration

### HMR Creation Limits
The system automatically:
1. **Checks usage limits** before allowing HMR creation
2. **Increments usage count** when HMR is completed
3. **Shows progress** toward monthly limits
4. **Blocks creation** when limits exceeded
5. **Prompts upgrade** for trial users

### Usage Tracking
- **Monthly reset** of HMR counts
- **Real-time tracking** of usage
- **Visual progress bars** in dashboard
- **Email notifications** (can be added) for limit warnings

## 🚀 8. Deployment Checklist

### Production Environment Variables
```bash
# Switch to live Stripe keys
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Update webhook URL to production domain
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

### Production Webhooks
1. Create new webhook for production domain
2. Use same events as test environment
3. Update webhook secret in production env vars

### Testing in Production
1. **Use small amounts** for initial testing ($1-2)
2. **Test all subscription flows** 
3. **Verify webhook delivery** in Stripe dashboard
4. **Monitor error logs** for any issues

## 🎯 9. Key Features Summary

### Free Trial (Built-in)
- ✅ **3 HMR reports** included
- ✅ **Basic templates** and features
- ✅ **Email support**
- ✅ **PDF export**
- ✅ **Automatic trial tracking**

### Professional Plan ($100/month)
- ✅ **30 HMR reports** per month
- ✅ **Advanced templates**
- ✅ **Priority support**
- ✅ **14-day trial** period
- ✅ **Custom branding** options

### Business Plan ($250/month)
- ✅ **100 HMR reports** per month
- ✅ **All Professional features**
- ✅ **Multi-user management**
- ✅ **Team collaboration**
- ✅ **Advanced analytics**

## 🔍 10. Testing Commands

```bash
# Run all tests
npm test

# Run auth tests specifically  
npm test auth.test.ts

# Run tests in watch mode
npm run test:watch

# Run with UI
npm run test:ui
```

## 📞 Support

If you encounter any issues:

1. **Check Stripe logs** in Dashboard → Developers → Logs
2. **Verify webhook delivery** in Webhooks section
3. **Check Supabase logs** for database issues
4. **Review browser console** for frontend errors
5. **Verify environment variables** are set correctly

---

## 🎉 Congratulations!

You now have a fully functional subscription system with:
- ✅ Three pricing tiers
- ✅ Stripe payment processing
- ✅ Usage tracking and limits
- ✅ Comprehensive testing
- ✅ Production-ready webhook handling
- ✅ Beautiful UI with proper UX

Your LAL MedReviews platform is ready for users to subscribe and start creating HMR reports! 🚀 