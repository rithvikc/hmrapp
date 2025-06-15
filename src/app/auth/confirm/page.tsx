'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Stethoscope,
  ArrowRight,
  Mail,
  Home
} from 'lucide-react';

function ConfirmPageContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectToStripeCheckout = async (planId: string, userId: string) => {
    try {
      setRedirecting(true);
      const response = await fetch('/api/subscription/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_id: planId,
          success_url: `${window.location.origin}/dashboard?welcome=true&subscription=success`,
          cancel_url: `${window.location.origin}/dashboard?welcome=true`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Clear the stored plan since we're processing it
        sessionStorage.removeItem('selectedPlan');
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        console.error('Failed to create checkout session:', data.error);
        // Fallback to dashboard if checkout fails
        router.push('/dashboard?welcome=true');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // Fallback to dashboard if checkout fails
      router.push('/dashboard?welcome=true');
    }
  };
  
  useEffect(() => {
    const confirmSignup = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      
      if (!token_hash || type !== 'signup') {
        setStatus('error');
        setMessage('Invalid confirmation link. The link may be expired or already used.');
        return;
      }

      try {
        const supabase = createClient();
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        });

        if (error) {
          setStatus('error');
          setMessage(error.message);
        } else {
          setStatus('success');
          setMessage('Your email has been confirmed successfully!');
          
          // Try to create pharmacist record if it doesn't exist
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              // Check if pharmacist record exists
              const { data: pharmacist } = await supabase
                .from('pharmacists')
                .select('id')
                .eq('user_id', user.id)
                .single();
              
              if (!pharmacist) {
                console.log('Confirm page: Creating pharmacist record for confirmed user');
                // Create pharmacist record via API
                const response = await fetch('/api/auth/create-pharmacist', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    email: user.email,
                    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                    registration_number: user.user_metadata?.registration_number || null,
                    phone: user.user_metadata?.phone || null,
                    practice_name: user.user_metadata?.practice || null,
                    practice_address: user.user_metadata?.location || null,
                  })
                });
                
                if (response.ok) {
                  console.log('Confirm page: Pharmacist record created successfully');
                } else {
                  console.error('Confirm page: Failed to create pharmacist record');
                }
              }

              // Check for selected plan and redirect to Stripe if needed
              const selectedPlan = user.user_metadata?.selected_plan || sessionStorage.getItem('selectedPlan');
              if (selectedPlan && selectedPlan !== 'enterprise') {
                console.log('Confirm page: Redirecting to Stripe checkout for plan:', selectedPlan);
                setTimeout(() => {
                  redirectToStripeCheckout(selectedPlan, user.id);
                }, 2000);
                return; // Don't redirect to dashboard, let Stripe handle it
              }
            }
          } catch (createError) {
            console.error('Confirm page: Error during pharmacist creation:', createError);
            // Don't fail the confirmation process if pharmacist creation fails
          }
          
          // Redirect to dashboard after a short delay (only if no plan selected)
          setTimeout(() => {
            router.push('/dashboard?welcome=true');
          }, 3000);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    confirmSignup();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="flex justify-center mb-6 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            myHMR
          </h1>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Confirming your email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your account.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Email Confirmed!
                </h2>
                <p className="text-gray-600 mb-8">
                  {message} {redirecting ? "Redirecting to payment setup..." : "You'll be redirected to your dashboard shortly."}
                </p>
                {redirecting && (
                  <div className="mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                )}
                <div className="space-y-4">
                  <Link
                    href="/dashboard"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Continue to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Confirmation Failed
                </h2>
                <p className="text-gray-600 mb-8">
                  {message}
                </p>
                <div className="space-y-4">
                  <Link
                    href="/signup"
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Request New Confirmation
                  </Link>
                  <Link
                    href="/"
                    className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Return to Home
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Additional Info */}
          {status === 'success' && (
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Account Activated</h4>
                  <p className="text-xs text-blue-800 mt-1">
                    Welcome to myHMR! Your account is now active and ready to streamline your Home Medication Reviews.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="flex justify-center mb-6 hover:opacity-80 transition-opacity">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            myHMR
          </h1>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-6">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare your confirmation page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmPageContent />
    </Suspense>
  );
} 