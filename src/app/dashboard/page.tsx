'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import MainLayout from '@/components/layout/MainLayout';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import SubscriptionOverlay from '@/components/SubscriptionOverlay';
import { useHMRSelectors } from '@/store/hmr-store';
import { 
  CheckCircle, 
  Zap, 
  AlertTriangle 
} from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, pharmacist, loading } = useAuth();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [showSubscriptionOverlay, setShowSubscriptionOverlay] = useState(false);
  
  const { setCurrentStep } = useHMRSelectors();
  const { 
    subscriptionData, 
    hasActiveSubscription, 
    canCreateHMR, 
    loading: subscriptionLoading 
  } = useSubscription();

  useEffect(() => {
    console.log('Dashboard: Auth state check - loading:', loading, 'user exists:', !!user, 'user id:', user?.id);
    
    // Don't do anything while still loading
    if (loading) {
      console.log('Dashboard: Still loading authentication...');
      return;
    }
    
    // If not loading and no user, redirect to login
    if (!user) {
      console.log('Dashboard: No user found, redirecting to login...');
      // Clear any potentially corrupted data before redirecting
      localStorage.removeItem('hmr-draft');
      localStorage.removeItem('hmr-store');
      router.push('/login');
      return;
    }
    
    // If we have a user, set up the dashboard
    if (user) {
      console.log('Dashboard: User authenticated successfully, setting up dashboard...');
      setCurrentStep('dashboard');
      
      // Check for welcome message only once
      if (!showWelcomeMessage && !dashboardData) {
        const isWelcome = searchParams.get('welcome');
        const isTrialUser = searchParams.get('trial');
        const subscriptionSuccess = searchParams.get('subscription');
        
        if (isWelcome === 'true') {
          console.log('Dashboard: Setting welcome message');
          setShowWelcomeMessage(true);
          
          if (subscriptionSuccess === 'success') {
            console.log('Welcome message: Subscription successful!');
          } else if (isTrialUser === 'true') {
            console.log('Welcome message: Trial user started!');
          }
          
          // Auto-hide welcome message after 5 seconds
          setTimeout(() => {
            console.log('Dashboard: Hiding welcome message');
            setShowWelcomeMessage(false);
          }, 5000);
        }
      }
      
      // Fetch dashboard data if we don't have it yet
      if (!dashboardData && loadingData) {
        console.log('Dashboard: Fetching dashboard data...');
        fetchDashboardData();
      }
    }
  }, [loading, user, router, searchParams, showWelcomeMessage, dashboardData, loadingData, setCurrentStep]);

  // Check subscription status and show overlay if needed
  useEffect(() => {
    if (!subscriptionLoading && !loading && user) {
      // Show overlay if no active subscription after a short delay
      if (!hasActiveSubscription) {
        const timer = setTimeout(() => {
          setShowSubscriptionOverlay(true);
        }, 2000); // Show after 2 seconds to allow for smooth loading
        return () => clearTimeout(timer);
      }
    }
  }, [subscriptionLoading, loading, user, hasActiveSubscription]);

  const fetchDashboardData = async () => {
    try {
      setLoadingData(true);
      
      // Simulate API call for dashboard data
      // In a real app, this would fetch actual dashboard metrics
      const mockData = {
        totalPatients: 45,
        completedReviews: 23,
        pendingReviews: 5,
        draftReviews: 2
      };
      
      setDashboardData(mockData);
    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Store onboarding completion in localStorage or API
    localStorage.setItem('onboarding-completed', 'true');
  };

  const getSubscriptionStatus = () => {
    if (!subscriptionData?.subscription) {
      return { 
        status: 'none', 
        bgColor: 'bg-gray-50', 
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        text: 'No subscription' 
      };
    }

    const sub = subscriptionData.subscription;
    switch (sub.status) {
      case 'active':
        return { 
          status: 'active', 
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          text: `${sub.plan_name} - Active`,
          icon: <CheckCircle className="h-4 w-4" />
        };
      case 'trialing':
        const trialEnd = sub.trial_ends_at ? new Date(sub.trial_ends_at) : new Date();
        const daysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return { 
          status: 'trial', 
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          text: `Free Trial (${daysLeft} days left)`,
          icon: <Zap className="h-4 w-4" />
        };
      case 'past_due':
        return { 
          status: 'past_due', 
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          text: 'Payment required',
          icon: <AlertTriangle className="h-4 w-4" />
        };
      default:
        return { 
          status: 'unknown', 
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          text: sub.status 
        };
    }
  };

  const getUsageDisplay = () => {
    if (!subscriptionData?.usage) return null;

    const { hmr_count, limit } = subscriptionData.usage;
    const isUnlimited = limit === null;
    
    if (isUnlimited) {
      return { type: 'unlimited', text: `${hmr_count} HMRs this month` };
    } else {
      const percentage = limit > 0 ? (hmr_count / limit) * 100 : 0;
      let barColor = 'bg-green-500';
      if (percentage >= 90) barColor = 'bg-red-500';
      else if (percentage >= 70) barColor = 'bg-yellow-500';
      
      return {
        type: 'limited',
        text: `${hmr_count}/${limit} HMRs used`,
        percentage,
        barColor
      };
    }
  };

  // Show loading spinner while checking authentication or loading data
  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  const subscriptionStatus = getSubscriptionStatus();
  const usageDisplay = getUsageDisplay();
  const isTrialUser = subscriptionData?.subscription?.status === 'trialing';

  return (
    <>
      {/* Welcome Message */}
      {showWelcomeMessage && (
        <div className="fixed top-4 right-4 z-40 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <span>🎉 Welcome to myHMR!</span>
            <button 
              onClick={() => setShowWelcomeMessage(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Subscription Status Bar */}
      {subscriptionData?.subscription && (
        <div className={`${subscriptionStatus.bgColor} border-b ${subscriptionStatus.borderColor} px-4 py-2`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={subscriptionStatus.iconColor}>
                {subscriptionStatus.icon}
              </div>
              <span className={`text-sm font-medium ${subscriptionStatus.textColor}`}>
                {subscriptionStatus.text}
              </span>
            </div>
            
            {usageDisplay && (
              <div className="flex items-center space-x-4">
                {usageDisplay.type === 'unlimited' ? (
                  <span className="text-sm text-gray-600">{usageDisplay.text}</span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{usageDisplay.text}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${usageDisplay.barColor}`}
                        style={{ width: `${usageDisplay.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {subscriptionStatus.status === 'trial' && (
                  <button 
                    onClick={() => router.push('/subscription')}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Upgrade
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      <div className="min-h-screen bg-gray-50">
        {/* Main Layout */}
        <MainLayout />
      </div>

      {/* Onboarding Overlay */}
      <OnboardingOverlay
        isVisible={showOnboarding}
        onComplete={handleOnboardingComplete}
        pharmacistName={pharmacist?.name}
        isTrialUser={isTrialUser}
      />

      {/* Subscription Overlay */}
      <SubscriptionOverlay
        isVisible={showSubscriptionOverlay}
        onClose={() => setShowSubscriptionOverlay(false)}
        title={!hasActiveSubscription ? "Subscription Required" : "Usage Limit Reached"}
        message={
          !hasActiveSubscription 
            ? "Your subscription is not active. Please select a plan to continue using myHMR features."
            : "You've reached your monthly HMR limit. Upgrade your plan to create more reports."
        }
        showCloseButton={false} // Don't allow closing when subscription is required
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 