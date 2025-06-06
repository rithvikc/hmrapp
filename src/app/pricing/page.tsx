'use client';

import { useState } from 'react';
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
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';

export default function PricingPage() {
  const [hoursSlider, setHoursSlider] = useState(15);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '',
      description: 'Perfect for trying out our platform',
      features: [
        '3 free HMR reports',
        'Basic report templates',
        'Email support',
        'PDF export',
        'Patient data security'
      ],
      cta: 'Start Free Trial',
      popular: false,
      color: 'from-gray-600 to-gray-700'
    },
    {
      name: 'Professional',
      price: '$100',
      period: '/month',
      description: 'For individual pharmacists',
      features: [
        '30 HMR reports per month',
        'Advanced report templates',
        'Priority email support',
        'PDF & Word export',
        'Patient data security',
        'Clinical recommendations',
        'Custom branding',
        'Phone support'
      ],
      cta: 'Start Professional',
      popular: true,
      color: 'from-blue-600 to-purple-600'
    },
    {
      name: 'Business',
      price: '$250',
      period: '/month',
      description: 'For pharmacy businesses & teams',
      features: [
        '100 HMR reports per month',
        'All Professional features',
        'Multi-user management',
        'Team collaboration tools',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated account manager',
        'Training & onboarding',
        'White-label options'
      ],
      cta: 'Start Business',
      popular: false,
      color: 'from-green-600 to-teal-600'
    }
  ];

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
    },
    {
      question: 'How accurate are the generated reports?',
      answer: 'Our reports are based on established HMR guidelines and have been reviewed by practicing pharmacists. However, all reports should be reviewed and approved by the conducting pharmacist before submission, as clinical judgment remains essential to quality patient care.'
    },
    {
      question: 'Do you integrate with pharmacy management systems?',
      answer: 'We\'re constantly expanding our integrations. Business plan customers can request custom integrations with their existing systems. Contact our team to discuss your specific integration needs.'
    }
  ];

  const timeSaved = hoursSlider * 2.5; // 2.5 hours saved per report
  const timeContext = getTimeContext(timeSaved);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 leading-tight">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Choose the plan that fits your practice. Start with our free trial and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.popular ? 'border-blue-500 transform scale-105' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-center block transition-all duration-200 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Time Savings Calculator */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Calculator className="h-4 w-4 mr-2" />
              Time Savings Calculator
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See How Much Time You'll Save
            </h2>
            <p className="text-xl text-gray-600">
              Calculate your monthly time savings with LAL MedReviews
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
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
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider relative z-10"
                  />
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-300 rounded-lg transform -translate-y-1/2 z-0"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg transform -translate-y-1/2 z-5"
                    style={{ width: `${(hoursSlider / 30) * 100}%` }}
                  ></div>
                </div>
                <div className="text-center mt-4">
                  <span className="text-3xl font-bold text-blue-600">{hoursSlider}</span>
                  <span className="text-gray-600 ml-2">HMRs per month</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-gray-700">Time spent on reports (old way)</span>
                  <span className="font-semibold text-red-600">{hoursSlider * 3} hours</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-gray-700">Time with LAL MedReviews</span>
                  <span className="font-semibold text-green-600">{hoursSlider * 0.5} hours</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="text-gray-700 font-semibold">Time saved per month</span>
                  <span className="font-bold text-blue-600 text-xl">{timeSaved} hours</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                What does {timeSaved} hours mean?
              </h3>
              
              <div className="text-center mb-8">
                <div className={`w-20 h-20 ${timeContext.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <timeContext.icon className={`h-10 w-10 ${timeContext.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  That's like having time for
                </div>
                <div className={`text-2xl font-semibold ${timeContext.color}`}>
                  {timeContext.activity}
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Monthly earning potential increase</div>
                  <div className="text-xl font-bold text-green-600">
                    ${Math.round(timeSaved * 75)} - ${Math.round(timeSaved * 120)}
                  </div>
                  <div className="text-xs text-gray-500">Based on $75-120/hour clinical rate</div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about LAL MedReviews
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900">{faq.question}</span>
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Save {timeSaved} Hours Per Month?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of pharmacists who've transformed their practice with LAL MedReviews.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/about"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
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
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
          border: 3px solid white;
          position: relative;
          z-index: 20;
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
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