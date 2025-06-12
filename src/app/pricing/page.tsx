'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Check, 
  Clock, 
  Users, 
  Building, 
  Star,
  ArrowRight,
  Calculator,
  Coffee,
  Tv,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  hmr_limit: number | null;
  features: string[];
  stripe_price_id: string | null;
  sort_order: number;
}

export default function PricingPage() {
  const [hoursSlider, setHoursSlider] = useState(15);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

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

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`;
  };

  const getPlanDescription = (planId: string) => {
    switch (planId) {
      case 'professional':
        return 'For individual pharmacists who want to streamline their HMR workflow.';
      case 'business':
        return 'For pharmacy businesses and teams who need comprehensive HMR capabilities.';
      case 'enterprise':
        return 'For large organizations requiring custom solutions and unlimited support.';
      default:
        return 'Professional medication review solutions.';
    }
  };

  const isEnterprise = (planId: string) => planId === 'enterprise';
  const isPopular = (planId: string) => planId === 'business';

  const timeContexts = [
    { hours: 5, activity: '5 cups of coffee', icon: Coffee, color: 'text-amber-600' },
    { hours: 10, activity: '2 Netflix episodes', icon: Tv, color: 'text-red-600' },
    { hours: 20, activity: 'Reading 2 books', icon: BookOpen, color: 'text-blue-600' },
    { hours: 30, activity: 'A weekend getaway', icon: Star, color: 'text-purple-600' }
  ];

  const getTimeContext = (hours: number) => {
    return timeContexts.reduce((prev, current) => 
      hours >= current.hours ? current : prev
    );
  };

  const faqs = [
    {
      question: 'How does the automated report generation work?',
      answer: 'Our platform uses advanced algorithms to transform your patient interview data into comprehensive HMR reports. Simply input the patient information, medication details, and clinical observations, and our system generates a professional report following standard HMR guidelines.'
    },
    {
      question: 'Is my patient data secure and HIPAA compliant?',
      answer: 'Absolutely. We take data security seriously and maintain full HIPAA compliance. All patient data is encrypted both in transit and at rest, stored on secure servers, and access is strictly controlled. We undergo regular security audits to ensure the highest standards of protection.'
    },
    {
      question: 'Can I customize the report templates?',
      answer: 'Yes! Professional and Business plans include customizable report templates. You can add your practice branding, modify sections to match your workflow, and save custom templates for different types of reviews.'
    },
    {
      question: 'What happens if I exceed my monthly report limit?',
      answer: 'If you approach your limit, we\'ll notify you in advance. You can either upgrade your plan or purchase additional reports as needed. We never want to interrupt your patient care, so we\'ll work with you to find the best solution.'
    },
    {
      question: 'Do you offer training and support?',
      answer: 'Yes! All plans include comprehensive onboarding. Professional plans get priority email and phone support, while Business plans include dedicated account management and team training sessions to ensure everyone gets the most out of the platform.'
    },
    {
      question: 'Can I cancel or change my plan anytime?',
      answer: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time. There are no long-term contracts or cancellation fees. If you cancel, you\'ll retain access to your account until the end of your current billing period.'
    }
  ];

  const timeSaved = hoursSlider * 2.5; // 2.5 hours saved per report
  const timeContext = getTimeContext(timeSaved);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight font-serif">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
            Choose the plan that fits your practice. Start with Professional and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((plan) => (
              <div 
                key={plan.id} 
                className={`relative bg-white rounded-lg border-2 p-8 ${
                  isPopular(plan.id) ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-200 shadow-sm'
                } transition-all duration-300 hover:shadow-lg`}
              >
                {isPopular(plan.id) && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 font-serif">
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    {isEnterprise(plan.id) ? (
                      <>
                        <span className="text-3xl font-bold text-gray-900">Contact Sales</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price_monthly)}</span>
                        <span className="text-gray-600 ml-1">/month</span>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {plan.hmr_limit === null ? '∞ Unlimited HMRs' : `${plan.hmr_limit} HMRs/month`}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 leading-relaxed">{getPlanDescription(plan.id)}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {isEnterprise(plan.id) ? (
                  <a
                    href="mailto:sales@myhmr.ai?subject=Enterprise Plan Inquiry&body=Hi, I am interested in learning more about the Enterprise plan for myHMR."
                    className="w-full py-3 px-6 rounded-lg font-semibold text-center block transition-all duration-200 bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contact Sales
                  </a>
                ) : (
                <Link
                  href="/signup"
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center block transition-all duration-200 ${
                      isPopular(plan.id)
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } flex items-center justify-center`}
                >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Time Savings Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="h-4 w-4 mr-2" />
              Time Savings Calculator
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
              See How Much Time You'll Save
            </h2>
            <p className="text-xl text-gray-600">
              Calculate your monthly time savings with myHMR
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 font-serif">
                How many HMRs do you complete per month?
              </h3>
              
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>1 HMR</span>
                  <span>30 HMRs</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={hoursSlider}
                    onChange={(e) => setHoursSlider(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                <div className="text-center mt-4">
                  <span className="text-3xl font-bold text-blue-600">{hoursSlider}</span>
                  <span className="text-gray-600 ml-2">HMRs per month</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-gray-700">Time spent on reports (old way)</span>
                  <span className="font-semibold text-red-600">{hoursSlider * 3} hours</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-gray-700">Time with myHMR</span>
                  <span className="font-semibold text-green-600">{hoursSlider * 0.5} hours</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-300">
                  <span className="text-gray-700 font-semibold">Time saved per month</span>
                  <span className="font-bold text-blue-600 text-xl">{timeSaved} hours</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 font-serif">
                What does {timeSaved} hours mean?
              </h3>
              
              <div className="text-center mb-8">
                <div className={`w-20 h-20 ${timeContext.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <timeContext.icon className={`h-10 w-10 ${timeContext.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2 font-serif">
                  That's like having time for
                </div>
                <div className={`text-xl font-semibold ${timeContext.color}`}>
                  {timeContext.activity}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Monthly earning potential increase</div>
                  <div className="text-xl font-bold text-green-600">
                    ${Math.round(timeSaved * 75)} - ${Math.round(timeSaved * 120)}
                  </div>
                  <div className="text-xs text-gray-500">Based on $75-120/hour clinical rate</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Additional patients you could help</div>
                  <div className="text-xl font-bold text-blue-600">
                    {Math.round(timeSaved / 0.5)} more patients
                  </div>
                  <div className="text-xs text-gray-500">Based on 30-min appointments</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about myHMR
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg bg-white">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 font-serif">
                    {faq.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6 font-serif">
            Ready to Save {timeSaved} Hours Per Month?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join hundreds of pharmacists who've transformed their practice with myHMR.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
          border: 2px solid white;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3B82F6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
        }
        
        .slider::-webkit-slider-track {
          background: transparent;
        }
        
        .slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
} 