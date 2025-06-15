# Pricing → Signup → Stripe Logic Implementation

## Overview

This document outlines the complete implementation of the pricing → signup → Stripe payment flow that allows users to:

1. Select a pricing plan from the pricing page
2. Be redirected to signup with the selected plan tracked
3. Complete account creation
4. Be automatically redirected to Stripe checkout for payment
5. Have their subscription properly associated with their account

## Implementation Flow

### 1. Pricing Page Plan Selection

**File**: `src/app/pricing/page.tsx`

**Key Changes**:
- Added `handlePlanSelect()` function that stores the selected plan in `sessionStorage`
- Replaced static signup links with dynamic buttons that track plan selection
- Added `useRouter` for programmatic navigation
- Plan selection redirects to `/signup?plan={planId}`

**Code Example**:
```typescript
const handlePlanSelect = (planId: string) => {
  // Store the selected plan in sessionStorage for persistence across navigation
  sessionStorage.setItem('selectedPlan', planId);
  
  // Redirect to signup with plan parameter
  router.push(`/signup?plan=${planId}`);
};
```

### 2. Enhanced Signup Page

**File**: `src/app/signup/page.tsx`

**Key Changes**:
- Added plan detection from URL parameters and sessionStorage
- Display selected plan information to the user
- Modified signup flow to redirect to Stripe after successful account creation
- Added plan information to user metadata during signup
- Enhanced UI to show payment continuation for paid plans

**Key Features**:
- Detects plan from `?plan=` URL parameter or sessionStorage
- Fetches and displays plan details (name, price, features)
- Shows "Create Account & Continue to Payment" for paid plans
- Handles both email confirmation and direct signup flows
- Stores selected plan in user metadata for persistence

### 3. Email Confirmation with Plan Handling

**File**: `src/app/auth/confirm/page.tsx`

**Key Changes**:
- Added plan detection after email confirmation
- Automatic redirect to Stripe checkout if a plan was selected
- Fallback to dashboard if no plan or enterprise plan selected

**Flow**:
1. User confirms email
2. System checks for selected plan in user metadata or sessionStorage
3. If paid plan selected, redirects to Stripe checkout
4. If no plan or enterprise plan, redirects to dashboard

### 4. Enhanced Stripe Checkout Session Creation

**File**: `src/app/api/subscription/create-checkout-session/route.ts`

**Key Changes**:
- Store selected plan in user metadata for tracking
- Create subscription record with 'pending' status
- Enhanced metadata in Stripe customer and session objects
- Better error handling and fallbacks

**Key Features**:
- Updates user metadata with selected plan and timestamp
- Creates/updates subscription record before payment
- Adds comprehensive metadata to Stripe objects for webhook processing
- Handles both new and existing customers

### 5. Improved Webhook Processing

**File**: `src/app/api/subscription/webhook/route.ts`

**Key Changes**:
- Enhanced checkout session completion handling
- Proper subscription record creation with accurate dates
- User metadata updates after successful payment
- Usage tracking initialization
- Better error handling and logging

**Key Features**:
- Retrieves actual subscription dates from Stripe
- Updates user metadata with subscription status
- Initializes usage tracking for the new subscription
- Handles all subscription lifecycle events

## Data Flow

### 1. Plan Selection Storage
```
Pricing Page → sessionStorage.setItem('selectedPlan', planId)
            → URL parameter (?plan=planId)
```

### 2. Signup Process
```
Signup Page → Detects plan from URL/sessionStorage
           → Displays plan information
           → Stores plan in user metadata during signup
           → Redirects to Stripe or dashboard based on plan
```

### 3. Email Confirmation Flow
```
Email Confirmation → Checks user metadata for selected plan
                  → Redirects to Stripe checkout if paid plan
                  → Redirects to dashboard if no plan/enterprise
```

### 4. Payment Processing
```
Stripe Checkout → Webhook processes payment
               → Updates subscription record
               → Updates user metadata
               → Initializes usage tracking
```

## Database Schema Updates

The implementation uses existing tables:

### user_subscriptions
- `pharmacist_id`: Links to pharmacist record
- `plan_id`: Selected subscription plan
- `stripe_customer_id`: Stripe customer ID
- `stripe_subscription_id`: Stripe subscription ID
- `status`: Subscription status (pending, active, cancelled, etc.)
- `current_period_start/end`: Subscription period dates

### usage_tracking
- Initialized when subscription is created
- Tracks monthly HMR usage against plan limits

## User Experience Flow

1. **Plan Selection**: User clicks "Get Started" on any pricing plan
2. **Signup Redirect**: Redirected to signup page with plan pre-selected
3. **Plan Display**: Selected plan is prominently displayed during signup
4. **Account Creation**: User completes signup form
5. **Email Confirmation** (if required): User confirms email
6. **Payment Redirect**: Automatically redirected to Stripe checkout
7. **Payment Completion**: User completes payment
8. **Dashboard Access**: Redirected to dashboard with active subscription

## Error Handling

### Plan Selection Persistence
- Plan stored in both URL parameters and sessionStorage
- Fallback mechanisms if one method fails
- Plan information retrieved from database for display

### Payment Flow Fallbacks
- If Stripe checkout fails, user redirected to dashboard
- Subscription record created before payment for tracking
- Webhook handles payment success/failure appropriately

### Session Management
- Plan selection persists across page refreshes
- SessionStorage cleared after successful payment processing
- User metadata maintains plan selection history

## Testing Considerations

### Manual Testing Flow
1. Visit `/pricing` page
2. Click "Get Started" on any plan
3. Verify redirect to `/signup?plan={planId}`
4. Complete signup process
5. Verify plan display and payment redirect
6. Test with Stripe test cards
7. Verify subscription creation in database

### Edge Cases Covered
- User navigates away and returns
- Email confirmation required vs. immediate signup
- Stripe checkout cancellation
- Payment failure handling
- Enterprise plan (contact sales) handling

## Security Considerations

- Plan selection validated server-side
- User authentication required for checkout session creation
- Webhook signature verification for payment processing
- Sensitive data stored securely in user metadata
- Plan pricing fetched from database, not client-side

## Future Enhancements

1. **Plan Comparison**: Add plan comparison modal on signup page
2. **Promo Codes**: Enhanced promo code handling in checkout
3. **Plan Upgrades**: Seamless plan upgrade flow from dashboard
4. **Trial Extensions**: Automatic trial extension for qualified users
5. **Analytics**: Track conversion rates from plan selection to payment

## Configuration Requirements

### Environment Variables
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Webhook endpoint secret

### Database Setup
- Subscription plans configured in `subscription_plans` table
- Stripe price IDs associated with plans
- Webhook endpoint configured in Stripe dashboard

This implementation provides a seamless user experience from plan selection to active subscription, with robust error handling and comprehensive tracking throughout the process. 