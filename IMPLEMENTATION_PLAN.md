# HMR Automation - Multi-User Implementation Plan

## Overview
This document outlines the implementation of user-specific data isolation, onboarding flow, and subscription system for the HMR Automation platform.

## Current Issues
- All users see the same dashboard and patients (shared data)
- No user-specific data isolation
- No onboarding flow for new users
- No subscription/payment system
- No usage limits or tracking

## Implementation Strategy

### Phase 1: Database Schema Updates
1. **Add pharmacist_id to all data tables**
   - Update patients table: `ADD COLUMN pharmacist_id TEXT`
   - Update interview_responses table: `ADD COLUMN pharmacist_id TEXT`
   - Update medications table: `ADD COLUMN pharmacist_id TEXT`
   - Update all other relevant tables

2. **Create subscription tables**
   - `subscriptions` table for user subscription data
   - `usage_tracking` table for HMR usage limits
   - `payment_history` table for transaction records

3. **Update prepared statements**
   - Modify all queries to filter by pharmacist_id
   - Add new statements for subscription management

### Phase 2: API Layer Updates
1. **Authentication middleware**
   - Extract user ID from auth context
   - Pass pharmacist_id to all database operations

2. **Data isolation enforcement**
   - Update all API endpoints to filter by pharmacist_id
   - Ensure no cross-user data leakage

3. **Subscription validation**
   - Check user subscription status
   - Enforce usage limits for HMR creation

### Phase 3: User Interface Updates
1. **Dashboard personalization**
   - Show user-specific data only
   - Add welcome message with user name

2. **Onboarding flow**
   - First-time user tutorial
   - Feature introduction
   - Quick start guide

3. **Subscription management**
   - Subscription status display
   - Usage tracking UI
   - Payment/upgrade options

### Phase 4: Subscription & Payment System
1. **Stripe integration**
   - Payment processing
   - Subscription management
   - Webhook handling

2. **Subscription plans**
   - $100/month - 30 HMRs
   - $250/month - Unlimited HMRs
   - 14-day free trial with card required

3. **Usage tracking**
   - HMR creation limits
   - Usage analytics
   - Billing cycle management

## Database Schema Changes

### 1. User Data Isolation
```sql
-- Add pharmacist_id to existing tables
ALTER TABLE patients ADD COLUMN pharmacist_id TEXT;
ALTER TABLE interview_responses ADD COLUMN pharmacist_id TEXT;
ALTER TABLE medications ADD COLUMN pharmacist_id TEXT;
ALTER TABLE medication_compliance ADD COLUMN pharmacist_id TEXT;
ALTER TABLE clinical_recommendations ADD COLUMN pharmacist_id TEXT;
ALTER TABLE reviews ADD COLUMN pharmacist_id TEXT;
ALTER TABLE recommendations ADD COLUMN pharmacist_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_patients_pharmacist_id ON patients(pharmacist_id);
CREATE INDEX idx_interview_responses_pharmacist_id ON interview_responses(pharmacist_id);
CREATE INDEX idx_medications_pharmacist_id ON medications(pharmacist_id);
```

### 2. Subscription Management
```sql
-- Subscription plans and user subscriptions
CREATE TABLE subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  hmr_limit INTEGER, -- NULL for unlimited
  features TEXT, -- JSON array of features
  stripe_price_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pharmacist_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL, -- active, canceled, past_due, trialing
  current_period_start DATETIME,
  current_period_end DATETIME,
  trial_ends_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
);

-- Usage tracking for HMR limits
CREATE TABLE usage_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pharmacist_id TEXT NOT NULL,
  month_year TEXT NOT NULL, -- Format: "2024-01"
  hmr_count INTEGER DEFAULT 0,
  last_hmr_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pharmacist_id, month_year)
);

-- Payment history
CREATE TABLE payment_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pharmacist_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'aud',
  status TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User onboarding status
CREATE TABLE user_onboarding (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pharmacist_id TEXT NOT NULL UNIQUE,
  completed_welcome BOOLEAN DEFAULT FALSE,
  completed_tutorial BOOLEAN DEFAULT FALSE,
  completed_first_patient BOOLEAN DEFAULT FALSE,
  completed_first_hmr BOOLEAN DEFAULT FALSE,
  onboarding_completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints to Create/Update

### Authentication & User Management
- `GET /api/user/profile` - Get current user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/subscription` - Get subscription status
- `POST /api/user/subscription/upgrade` - Upgrade subscription

### Subscription & Payment
- `POST /api/subscription/create-checkout-session` - Create Stripe checkout
- `POST /api/subscription/create-portal-session` - Billing portal
- `POST /api/webhooks/stripe` - Handle Stripe webhooks
- `GET /api/subscription/plans` - Get available plans

### Usage Tracking
- `GET /api/usage/current` - Get current month usage
- `POST /api/usage/increment` - Increment HMR count
- `GET /api/usage/history` - Get usage history

### Onboarding
- `GET /api/onboarding/status` - Get onboarding progress
- `PUT /api/onboarding/complete-step` - Mark step as complete

## User Experience Flow

### 1. New User Journey
1. Sign up with email/password + professional details
2. **NEW**: Redirect to subscription selection page
3. Choose plan and enter payment details via Stripe
4. Redirect to dashboard with onboarding overlay
5. Complete tutorial steps:
   - Welcome to LAL MedReviews
   - Create your first patient
   - Start your first HMR
   - Explore dashboard features

### 2. Subscription Selection Page
```
┌─────────────────────────────────────────┐
│           Choose Your Plan              │
├─────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    │
│  │ Starter     │    │ Professional│    │
│  │ $100/month  │    │ $250/month  │    │
│  │ 30 HMRs     │    │ Unlimited   │    │
│  │ [Choose]    │    │ [Choose]    │    │
│  └─────────────┘    └─────────────┘    │
│                                         │
│     Start with 14-day free trial        │
│     (Credit card required)              │
└─────────────────────────────────────────┘
```

### 3. Dashboard Personalization
- Show user's name: "Welcome back, Dr. Smith"
- Display subscription status and usage
- Show only user's patients and HMRs
- Onboarding checklist for new users

## Technical Implementation Details

### Authentication Context Updates
```typescript
interface AuthContextType {
  user: User | null
  pharmacist: any | null
  subscription: SubscriptionData | null
  usage: UsageData | null
  onboarding: OnboardingStatus | null
  loading: boolean
  // ... existing methods
}
```

### Database Query Updates
All queries must include pharmacist_id filter:
```sql
-- Before
SELECT * FROM patients ORDER BY created_at DESC

-- After  
SELECT * FROM patients WHERE pharmacist_id = ? ORDER BY created_at DESC
```

### Usage Limit Enforcement
Before creating HMR:
1. Check user's subscription plan
2. Check current month usage
3. Enforce limits or show upgrade prompt

## Security Considerations
1. **Row Level Security**: All queries must filter by pharmacist_id
2. **API Authorization**: Verify user owns requested resources
3. **Payment Security**: Use Stripe for PCI compliance
4. **Data Encryption**: Sensitive patient data encryption

## Migration Strategy
1. **Data Migration**: 
   - Add pharmacist_id columns with default values
   - Update existing data with appropriate pharmacist_id
   - Create migration script for existing users

2. **Backwards Compatibility**:
   - Maintain existing API until migration complete
   - Graceful degradation for missing pharmacist_id

3. **Testing Strategy**:
   - Unit tests for data isolation
   - Integration tests for subscription flow
   - E2E tests for complete user journey

## Success Metrics
- Zero cross-user data leakage
- Successful payment processing (>95% success rate)
- User onboarding completion (>80%)
- Subscription conversion (target 60% trial-to-paid)

## Rollout Plan
1. **Development**: Implement features in staging
2. **Testing**: Comprehensive testing with test data
3. **Soft Launch**: Release to limited beta users
4. **Full Launch**: Deploy to all users with migration

## Next Steps
1. Implement database schema changes
2. Update authentication and authorization
3. Create subscription management system
4. Build onboarding flow
5. Integrate Stripe payment processing
6. Add usage tracking and limits
7. Update all UI components
8. Comprehensive testing and deployment 