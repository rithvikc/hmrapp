'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Check, Zap, Crown, Users, BarChart3, Phone, 
  CreditCard, ArrowRight, Sparkles, Shield
} from 'lucide-react';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  hmr_limit: number | null;
  features: string[];
  stripe_price_id: string | null;
  popular?: boolean;
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const { user, pharmacist } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch subscription plans
    fetchPlans();
  }, [user, router]);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setCreatingCheckout(true);

    try {
      if (planId === 'trial') {
        // Handle free trial
        const response = await fetch('/api/subscription/start-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          router.push('/dashboard?welcome=true&trial=true');
        } else {
          throw new Error('Failed to start trial');
        }
      } else {
        // Create Stripe checkout session
        const response = await fetch('/api/subscription/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            plan_id: planId,
            success_url: `${window.location.origin}/dashboard?welcome=true&subscription=success`,
            cancel_url: `${window.location.origin}/subscription`,
          }),
        });

        const data = await response.json();

        if (response.ok && data.url) {
          // Redirect to Stripe checkout
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setCreatingCheckout(false);
      setSelectedPlan('');
    }
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'starter':
        return <Zap className="h-8 w-8" />;
      case 'professional':
        return <Crown className="h-8 w-8" />;
      case 'trial':
        return <Sparkles className="h-8 w-8" />;
      default:
        return <Users className="h-8 w-8" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome to LAL MedReviews!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Hi {pharmacist?.name || 'Doctor'}, choose the perfect plan for your practice
          </p>
          <p className="text-gray-500">
            Start with our free trial - no commitment required
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.id === 'professional'
                  ? 'border-purple-500 scale-105'
                  : plan.id === 'trial'
                  ? 'border-green-500'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.id === 'professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              {plan.id === 'trial' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Risk Free
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Plan Icon */}
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  plan.id === 'professional'
                    ? 'bg-purple-100 text-purple-600'
                    : plan.id === 'trial'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {getPlanIcon(plan.id)}
                </div>

                {/* Plan Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>

                {/* Price */}
                <div className="mb-6">
                  {plan.id === 'trial' ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">Free</span>
                      <span className="text-gray-500 ml-2">14 days</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price_monthly)}
                      </span>
                      <span className="text-gray-500 ml-2">/month</span>
                    </>
                  )}
                </div>

                {/* HMR Limit */}
                <div className="mb-6">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    plan.hmr_limit === null
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {plan.hmr_limit === null ? '∞ Unlimited HMRs' : `${plan.hmr_limit} HMRs`}
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5 mr-3" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan.id)}
                  disabled={creatingCheckout && selectedPlan === plan.id}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                    plan.id === 'professional'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                      : plan.id === 'trial'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {creatingCheckout && selectedPlan === plan.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {plan.id === 'trial' ? 'Start Free Trial' : 'Choose Plan'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>

                {plan.id === 'trial' && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Credit card required • Cancel anytime
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold">Features</th>
                  <th className="text-center py-4 px-6 font-semibold">Trial</th>
                  <th className="text-center py-4 px-6 font-semibold">Starter</th>
                  <th className="text-center py-4 px-6 font-semibold">Professional</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">HMR Reports per month</td>
                  <td className="text-center py-4 px-6">5 (trial only)</td>
                  <td className="text-center py-4 px-6">30</td>
                  <td className="text-center py-4 px-6">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">Patient Management</td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">PDF Report Generation</td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">Analytics Dashboard</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">Basic</td>
                  <td className="text-center py-4 px-6">Advanced</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-6">Priority Support</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-6">API Access</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6">-</td>
                  <td className="text-center py-4 px-6"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Security & Trust */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold mb-4">Secure & Compliant</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Your patient data is protected with enterprise-grade security. We are HIPAA compliant 
            and use industry-standard encryption to keep your information safe.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Secure Payments
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              HIPAA Compliant
            </div>
            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2" />
              24/7 Support
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500 mb-4">
            Questions about pricing? <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact our team</Link>
          </p>
          <p className="text-xs text-gray-400">
            All plans include a 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
} 