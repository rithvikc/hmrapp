'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useHMRSelectors } from '@/store/hmr-store';
import MainLayout from '@/components/layout/MainLayout';
import OnboardingOverlay from '@/components/OnboardingOverlay';
import { Crown, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, pharmacist } = useAuth();
  const { setCurrentStep } = useHMRSelectors();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  
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
  }, [user, loading, router, setCurrentStep, searchParams, showWelcomeMessage, dashboardData, loadingData]);

  const fetchDashboardData = async () => {
    try {
      console.log('Dashboard: Fetching dashboard data...');
      
      // Add a small delay to ensure authentication cookies are fully set
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch('/api/dashboard', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      console.log('Dashboard: API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard: Successfully fetched data');
        setDashboardData(data);
        
        // Check if user needs onboarding
        if (data.onboarding && !data.onboarding.onboarding_completed_at) {
          setShowOnboarding(true);
        }
      } else if (response.status === 401) {
        // Handle 401 with retry after a short delay
        console.log('Dashboard: 401 error, authentication may still be settling. Retrying...');
        
        // Wait a bit longer and try again
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const retryResponse = await fetch('/api/dashboard', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (retryResponse.ok) {
          const data = await retryResponse.json();
          console.log('Dashboard: Successfully fetched data on retry');
          setDashboardData(data);
          
          if (data.onboarding && !data.onboarding.onboarding_completed_at) {
            setShowOnboarding(true);
          }
        } else {
          console.log('Dashboard: Retry failed, using default data');
          // Set default data to prevent dashboard from breaking
          setDashboardData({
            patients: [],
            statistics: {
              totalPatients: 0,
              totalReviews: 0,
              completedReviews: 0,
              draftReviews: 0,
              pendingReviews: 0
            },
            pendingReviews: [],
            recentActivity: [],
            subscription: null,
            usage: {
              current_month: new Date().toISOString().slice(0, 7),
              hmr_count: 0,
              hmr_limit: null,
              last_hmr_date: null
            },
            onboarding: null
          });
        }
      } else {
        const errorText = await response.text();
        console.error('Dashboard: Failed to fetch dashboard data:', response.status, errorText);
        
        // Set default data so dashboard doesn't break
        setDashboardData({
          patients: [],
          statistics: {
            totalPatients: 0,
            totalReviews: 0,
            completedReviews: 0,
            draftReviews: 0,
            pendingReviews: 0
          },
          pendingReviews: [],
          recentActivity: [],
          subscription: null,
          usage: {
            current_month: new Date().toISOString().slice(0, 7),
            hmr_count: 0,
            hmr_limit: null,
            last_hmr_date: null
          },
          onboarding: null
        });
      }
    } catch (error) {
      console.error('Dashboard: Error fetching dashboard data:', error);
      // Set default data to prevent dashboard from breaking
      setDashboardData({
        patients: [],
        statistics: {
          totalPatients: 0,
          totalReviews: 0,
          completedReviews: 0,
          draftReviews: 0,
          pendingReviews: 0
        },
        pendingReviews: [],
        recentActivity: [],
        subscription: null,
        usage: {
          current_month: new Date().toISOString().slice(0, 7),
          hmr_count: 0,
          hmr_limit: null,
          last_hmr_date: null
        },
        onboarding: null
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const getSubscriptionStatus = () => {
    if (!dashboardData?.subscription) {
      return { 
        status: 'none', 
        bgColor: 'bg-gray-50', 
        borderColor: 'border-gray-200',
        textColor: 'text-gray-800',
        iconColor: 'text-gray-600',
        text: 'No subscription' 
      };
    }

    const sub = dashboardData.subscription;
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
        const trialEnd = new Date(sub.trial_ends_at);
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
    if (!dashboardData?.usage) return null;

    const { hmr_count, hmr_limit } = dashboardData.usage;
    const isUnlimited = hmr_limit === null;
    
    if (isUnlimited) {
      return { type: 'unlimited', text: `${hmr_count} HMRs this month` };
    } else {
      const percentage = (hmr_count / hmr_limit) * 100;
      let barColor = 'bg-green-500';
      if (percentage >= 90) barColor = 'bg-red-500';
      else if (percentage >= 70) barColor = 'bg-yellow-500';
      
      return {
        type: 'limited',
        text: `${hmr_count}/${hmr_limit} HMRs used`,
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
  const isTrialUser = dashboardData?.subscription?.status === 'trialing';

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
      {dashboardData?.subscription && (
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
    </>
  );
}

function DashboardLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingFallback />}>
      <DashboardContent />
    </Suspense>
  );
} 