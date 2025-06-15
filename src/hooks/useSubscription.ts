import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionData {
  subscription: {
    id: string;
    status: string;
    plan_name: string;
    current_period_end: string;
    trial_ends_at?: string;
    subscription_plans: {
      id: string;
      name: string;
      hmr_limit: number | null;
    };
  };
  usage: {
    current_month: string;
    hmr_count: number;
    limit: number;
    can_create: boolean;
  };
  available_plans: any[];
}

export function useSubscription() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSubscriptionData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/subscription/current');
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      
      const data = await response.json();
      setSubscriptionData(data);
    } catch (err) {
      console.error('Error fetching subscription data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [user]);

  // Helper functions for subscription status checking
  const hasActiveSubscription = () => {
    if (!subscriptionData?.subscription) return false;
    return ['active', 'trialing'].includes(subscriptionData.subscription.status);
  };

  const canCreateHMR = () => {
    if (!subscriptionData) return false;
    return hasActiveSubscription() && subscriptionData.usage.can_create;
  };

  const getSubscriptionStatus = () => {
    if (!subscriptionData?.subscription) {
      return {
        status: 'none',
        isActive: false,
        planName: 'No Plan',
        canAccess: false
      };
    }

    const sub = subscriptionData.subscription;
    const isActive = ['active', 'trialing'].includes(sub.status);
    
    return {
      status: sub.status,
      isActive,
      planName: sub.plan_name,
      canAccess: isActive,
      usage: subscriptionData.usage
    };
  };

  const refreshSubscription = () => {
    fetchSubscriptionData();
  };

  return {
    subscriptionData,
    loading,
    error,
    hasActiveSubscription: hasActiveSubscription(),
    canCreateHMR: canCreateHMR(),
    subscriptionStatus: getSubscriptionStatus(),
    refreshSubscription
  };
} 