# Subscription-Based Access Control Implementation Guide

## Overview

This guide documents the implementation of subscription-based access control for the myHMR application. The system ensures that users can only access features and create HMR reports when they have an active subscription.

## Key Features Implemented

### 1. Subscription Status Checking
- **Real-time subscription validation** across all components
- **Usage limit enforcement** based on subscription plan
- **Automatic feature restriction** when subscription is inactive
- **Graceful degradation** with clear user messaging

### 2. Access Control Points
- **Dashboard features** (New Review, Generate Reports, etc.)
- **Navigation elements** (Sidebar quick actions, top navigation buttons)
- **Patient management** (Starting HMR reviews)
- **Report generation** and analytics features

### 3. User Experience
- **Subscription overlay popup** when access is restricted
- **Visual indicators** (🔒 icons) on disabled features
- **Clear messaging** explaining why features are restricted
- **Direct path to subscription page** for easy upgrading

## Implementation Components

### 1. Subscription Hook (`src/hooks/useSubscription.ts`)

**Purpose**: Centralized subscription state management and access control logic.

**Key Functions**:
```typescript
const {
  subscriptionData,        // Full subscription and usage data
  hasActiveSubscription,   // Boolean: active or trialing status
  canCreateHMR,           // Boolean: can create new HMR reports
  subscriptionStatus,     // Detailed status object
  refreshSubscription     // Function to refresh subscription data
} = useSubscription();
```

**Features**:
- Fetches subscription data from `/api/subscription/current`
- Provides helper functions for access control decisions
- Automatically refreshes when user changes
- Handles loading and error states

### 2. Subscription Overlay (`src/components/SubscriptionOverlay.tsx`)

**Purpose**: Modal popup that blocks access when subscription is required.

**Features**:
- **Customizable messaging** for different scenarios
- **Feature benefits list** to encourage subscription
- **Direct navigation** to subscription page
- **Optional close button** (disabled for required subscriptions)
- **Professional design** with clear call-to-action

**Usage**:
```typescript
<SubscriptionOverlay
  isVisible={showSubscriptionOverlay}
  onClose={() => setShowSubscriptionOverlay(false)}
  title="Subscription Required"
  message="Your subscription is not active..."
  showCloseButton={false}
/>
```

### 3. Enhanced Components

#### MainLayout (`src/components/layout/MainLayout.tsx`)
- **Subscription checking** before allowing protected actions
- **Automatic overlay display** when subscription is inactive
- **Feature restriction** for new reviews, scheduling, and reports

#### Sidebar (`src/components/layout/Sidebar.tsx`)
- **Visual indicators** on disabled quick actions
- **Tooltip messages** explaining restrictions
- **Grayed-out appearance** for inaccessible features

#### TopNavigation (`src/components/layout/TopNavigation.tsx`)
- **Disabled state** for New Review and Schedule buttons
- **Lock icons** and tooltips for restricted features
- **Consistent styling** with other disabled elements

#### Dashboard Components
- **Usage limit warnings** when approaching monthly limits
- **Subscription status banners** for inactive accounts
- **Disabled action buttons** with clear explanations

### 4. API Updates

#### Subscription Current API (`src/app/api/subscription/current/route.ts`)

**Changes Made**:
- **Removed automatic subscription creation** for new users
- **Proper null handling** when no subscription exists
- **Enhanced access control logic** with `can_create` field
- **Accurate usage tracking** and limit enforcement

**Response Structure**:
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "plan_name": "Professional",
    "current_period_end": "2024-01-31T23:59:59Z",
    "subscription_plans": {
      "hmr_limit": 30
    }
  },
  "usage": {
    "current_month": "2024-01",
    "hmr_count": 15,
    "limit": 30,
    "can_create": true
  },
  "available_plans": [...]
}
```

## Access Control Logic

### Subscription Status Hierarchy

1. **No Subscription** (`subscription: null`)
   - All features disabled
   - Overlay shown immediately
   - Redirect to subscription page

2. **Inactive Subscription** (`status: 'canceled'`, `'past_due'`, etc.)
   - All features disabled
   - Clear messaging about payment issues
   - Option to update payment or resubscribe

3. **Active Subscription** (`status: 'active'` or `'trialing'`)
   - Features enabled based on usage limits
   - Usage tracking and warnings
   - Upgrade prompts for limit approaching

### Feature Access Matrix

| Feature | No Subscription | Inactive | Active (Under Limit) | Active (Over Limit) |
|---------|----------------|----------|---------------------|-------------------|
| New HMR Review | ❌ | ❌ | ✅ | ❌ |
| View Patients | ✅ | ✅ | ✅ | ✅ |
| Generate Reports | ❌ | ❌ | ✅ | ❌ |
| Schedule Reviews | ❌ | ❌ | ✅ | ❌ |
| Analytics | ❌ | ❌ | ✅ | ✅ |

### Usage Limit Enforcement

```typescript
const canCreateHMR = () => {
  if (!subscriptionData) return false;
  return hasActiveSubscription() && subscriptionData.usage.can_create;
};
```

**Logic**:
1. Check if subscription exists and is active
2. Compare current usage against plan limit
3. Return boolean for feature access
4. Display appropriate messaging for restrictions

## User Experience Flow

### 1. New User (No Subscription)
1. User logs in and accesses dashboard
2. Subscription overlay appears after 2-second delay
3. All feature buttons show disabled state with lock icons
4. User clicks "Select a Plan" to go to subscription page
5. After subscribing, features become available immediately

### 2. Existing User (Subscription Expired)
1. User attempts to use a feature
2. System detects inactive subscription
3. Overlay appears with payment required message
4. User can update payment or select new plan
5. Features re-enable after successful payment

### 3. Active User (Approaching Limit)
1. User sees usage progress bar in dashboard
2. Warning appears when 75% of limit reached
3. Red warning at 90% of limit
4. Features disabled when limit exceeded
5. Upgrade prompts throughout the experience

## Testing the Implementation

### Manual Testing Scenarios

1. **No Subscription Test**:
   ```sql
   -- Remove user's subscription
   DELETE FROM user_subscriptions WHERE pharmacist_id = 'user_id';
   ```
   - Verify overlay appears
   - Confirm all features are disabled
   - Test navigation to subscription page

2. **Usage Limit Test**:
   ```sql
   -- Set usage to plan limit
   UPDATE usage_tracking 
   SET hmr_count = (SELECT hmr_limit FROM subscription_plans WHERE id = 'professional')
   WHERE pharmacist_id = 'user_id';
   ```
   - Verify "New Review" button is disabled
   - Confirm usage limit messaging appears

3. **Subscription Status Test**:
   ```sql
   -- Set subscription to past_due
   UPDATE user_subscriptions 
   SET status = 'past_due' 
   WHERE pharmacist_id = 'user_id';
   ```
   - Verify payment required messaging
   - Test feature restrictions

### Automated Testing

```typescript
// Example test for subscription hook
describe('useSubscription', () => {
  it('should disable features when no subscription', () => {
    const { hasActiveSubscription, canCreateHMR } = renderHook(() => useSubscription());
    expect(hasActiveSubscription).toBe(false);
    expect(canCreateHMR).toBe(false);
  });
});
```

## Configuration Options

### Subscription Plans
Plans are configured in the `subscription_plans` table:
- `hmr_limit`: Monthly HMR creation limit (null = unlimited)
- `features`: JSON array of included features
- `is_active`: Whether plan is available for selection

### Usage Tracking
Usage is tracked in the `usage_tracking` table:
- `month_year`: Format "YYYY-MM" for monthly tracking
- `hmr_count`: Number of HMRs created this month
- `last_hmr_date`: Timestamp of last HMR creation

### Access Control Settings
```typescript
// Configurable thresholds
const WARNING_THRESHOLD = 0.75; // 75% usage warning
const CRITICAL_THRESHOLD = 0.90; // 90% usage critical warning
const OVERLAY_DELAY = 2000; // 2 second delay before showing overlay
```

## Troubleshooting

### Common Issues

1. **Overlay Not Appearing**
   - Check subscription hook is properly imported
   - Verify API endpoint is returning correct data
   - Ensure useEffect dependencies are correct

2. **Features Not Disabled**
   - Confirm subscription status is being passed to components
   - Check TypeScript interfaces match API response
   - Verify access control logic in component props

3. **Usage Limits Not Enforced**
   - Check usage tracking table has current month data
   - Verify `can_create` field calculation in API
   - Ensure webhook updates usage after HMR creation

### Debug Tools

```typescript
// Add to component for debugging
console.log('Subscription Debug:', {
  hasActiveSubscription,
  canCreateHMR,
  subscriptionData,
  loading: subscriptionLoading
});
```

## Future Enhancements

### Planned Features
1. **Grace Period**: Allow limited access after subscription expires
2. **Feature Tiers**: Different feature sets per plan level
3. **Usage Analytics**: Detailed usage tracking and reporting
4. **Smart Notifications**: Proactive upgrade suggestions
5. **Team Management**: Multi-user subscription handling

### Performance Optimizations
1. **Caching**: Cache subscription data with TTL
2. **Lazy Loading**: Load subscription data only when needed
3. **Optimistic Updates**: Update UI before API confirmation
4. **Background Refresh**: Periodic subscription status updates

## Security Considerations

### Server-Side Validation
- All subscription checks are validated server-side
- Client-side restrictions are for UX only
- API endpoints verify subscription before processing
- Usage limits enforced at database level

### Data Protection
- Subscription data is encrypted in transit
- Access logs maintained for audit purposes
- PII handling follows GDPR compliance
- Secure payment processing via Stripe

This implementation provides a robust, user-friendly subscription access control system that ensures proper monetization while maintaining excellent user experience. 