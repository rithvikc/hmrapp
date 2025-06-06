'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useHMRSelectors } from '@/store/hmr-store';
import MainLayout from '@/components/layout/MainLayout';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { setCurrentStep } = useHMRSelectors();
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      // Set the current step to dashboard when this page loads
      setCurrentStep('dashboard');
      
      // Check if this is a welcome redirect from signup
      const isWelcome = searchParams.get('welcome');
      if (isWelcome === 'true') {
        setShowWelcomeMessage(true);
        console.log('Welcome new user to dashboard!');
        
        // Auto-hide welcome message after 5 seconds
        setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);
      }
    }
  }, [user, loading, router, setCurrentStep, searchParams]);

  // Show loading spinner while checking authentication
  if (loading) {
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

  return (
    <>
      {showWelcomeMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <span>🎉 Welcome to LAL MedReviews!</span>
            <button 
              onClick={() => setShowWelcomeMessage(false)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
      <MainLayout />
    </>
  );
} 