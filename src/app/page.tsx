'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Stethoscope, Shield, FileText, Clock, CheckCircle, ArrowRight,
  Users, BarChart3, Lock, Smartphone, Zap, Award, User, Pill,
  MessageSquare, Activity, Mail, Timer, TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const workflowSteps = [
    {
      icon: User,
      title: 'Patient Registration',
      description: 'Securely capture patient demographics, medical history, and current medications',
      time: '1 min',
      traditionalTime: '15 min'
    },
    {
      icon: Pill,
      title: 'Medication Review',
      description: 'Comprehensive medication analysis with automated drug interaction checking',
      time: '1 min',
      traditionalTime: '25 min'
    },
    {
      icon: MessageSquare,
      title: 'Patient Interview',
      description: 'Guided interview process with smart questionnaires and clinical prompts',
      time: '1 min',
      traditionalTime: '20 min'
    },
    {
      icon: Activity,
      title: 'Clinical Assessment',
      description: 'AI-assisted recommendation generation and priority scoring',
      time: '1 min',
      traditionalTime: '25 min'
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Automated PDF creation with professional formatting and Medicare compliance',
      time: '30 sec',
      traditionalTime: '30 min'
    },
    {
      icon: Mail,
      title: 'GP Communication',
      description: 'Pre-formatted email templates and secure document transmission',
      time: '30 sec',
      traditionalTime: '10 min'
    }
  ];

  useEffect(() => {
    if (!isAnimating) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating, workflowSteps.length]);

  const parseTimeToMinutes = (timeStr: string): number => {
    if (timeStr.includes('sec')) {
      return parseFloat(timeStr) / 60; // Convert seconds to minutes
    }
    return parseFloat(timeStr); // Already in minutes
  };

  const totalTime = workflowSteps.reduce((sum, step) => sum + parseTimeToMinutes(step.time), 0);
  const totalTraditionalTime = workflowSteps.reduce((sum, step) => sum + parseTimeToMinutes(step.traditionalTime), 0);
  const timeSaved = totalTraditionalTime - totalTime;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LAL MedReviews
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Professional{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Home Medication Reviews
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline your HMR workflow with our comprehensive platform designed for Australian pharmacists. 
              Generate professional reports, manage patient data securely, and enhance clinical outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signup"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/demo"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              >
                Watch Demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Visualization Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              95% of pharmacists save at least 1 hour per report
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              See How Our Platform Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              From patient registration to GP communication - complete your HMR workflow in just 5 minutes instead of {Math.round(totalTraditionalTime)} minutes
            </p>
            
            {/* Time Savings Highlight */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl inline-block mb-12 shadow-lg">
              <div className="flex items-center space-x-4">
                <Timer className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-2xl font-bold">Save {Math.round(timeSaved)} minutes</div>
                  <div className="text-green-100">per HMR report</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Step Navigation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">HMR Workflow Steps</h3>
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  {isAnimating ? 'Pause' : 'Play'} Demo
                </button>
              </div>
              
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                
                return (
                  <div
                    key={index}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive ? 'scale-105' : 'hover:scale-102'
                    }`}
                    onClick={() => {
                      setActiveStep(index);
                      setIsAnimating(false);
                    }}
                  >
                    <div className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-blue-500 bg-blue-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`font-semibold transition-colors ${
                              isActive ? 'text-blue-900' : 'text-gray-900'
                            }`}>
                              {step.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500 line-through">
                                {step.traditionalTime}
                              </span>
                              <span className={`text-sm font-bold ${
                                isActive ? 'text-green-600' : 'text-gray-700'
                              }`}>
                                {step.time}
                              </span>
                            </div>
                          </div>
                          <p className={`text-sm transition-colors ${
                            isActive ? 'text-blue-800' : 'text-gray-600'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visual Progress */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Current Step: {workflowSteps[activeStep].title}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-600">
                  Step {activeStep + 1} of {workflowSteps.length}
                </p>
              </div>

              {/* Step Visualization */}
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    {React.createElement(workflowSteps[activeStep].icon, { 
                      className: "h-12 w-12 text-white" 
                    })}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {workflowSteps[activeStep].title}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {workflowSteps[activeStep].description}
                  </p>
                </div>

                {/* Time Comparison */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Traditional Method:</span>
                    <span className="text-sm font-medium text-red-600">
                      {workflowSteps[activeStep].traditionalTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">With LAL MedReviews:</span>
                    <span className="text-sm font-bold text-green-600">
                      {workflowSteps[activeStep].time}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-green-700 font-medium">
                    Save {Math.round((parseTimeToMinutes(workflowSteps[activeStep].traditionalTime) - parseTimeToMinutes(workflowSteps[activeStep].time)) * 10) / 10} minutes per step
                  </div>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center space-x-2">
                  {workflowSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index <= activeStep
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">5 min</div>
              <div className="text-gray-600">Complete HMR Time</div>
              <div className="text-sm text-green-600 font-medium mt-1">
                vs {Math.round(totalTraditionalTime)} min traditional
              </div>
            </div>
            <div className="text-center bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-green-600 mb-2">{Math.round((timeSaved / totalTraditionalTime) * 100)}%</div>
              <div className="text-gray-600">Time Reduction</div>
              <div className="text-sm text-green-600 font-medium mt-1">
                Industry-leading efficiency
              </div>
            </div>
            <div className="text-center bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">Pharmacist Satisfaction</div>
              <div className="text-sm text-green-600 font-medium mt-1">
                Save 1+ hour per report
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Professional HMRs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Australian pharmacists, our platform covers every aspect of the HMR process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Automated Report Generation',
                description: 'Generate professional PDF reports that meet Medicare requirements with just a few clicks.'
              },
              {
                icon: Shield,
                title: 'Secure Patient Data',
                description: 'HIPAA-compliant data security with encrypted storage and secure access controls.'
              },
              {
                icon: Clock,
                title: 'Streamlined Workflow',
                description: 'Complete HMRs 50% faster with our guided interview process and smart templates.'
              },
              {
                icon: Users,
                title: 'Patient Management',
                description: 'Comprehensive patient profiles with medication history and clinical notes.'
              },
              {
                icon: BarChart3,
                title: 'Clinical Insights',
                description: 'Drug interaction checking, dosage recommendations, and evidence-based suggestions.'
              },
              {
                icon: Smartphone,
                title: 'Mobile Optimized',
                description: 'Access your platform anywhere with our responsive design and mobile apps.'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose LAL MedReviews?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Award,
                    title: 'Medicare Compliant',
                    description: 'All reports meet Medicare guidelines for HMR documentation and billing requirements.'
                  },
                  {
                    icon: Zap,
                    title: 'Save Time',
                    description: 'Reduce documentation time by up to 50% with our intelligent automation features.'
                  },
                  {
                    icon: Lock,
                    title: 'Secure & Private',
                    description: 'Bank-level encryption ensures patient data remains confidential and secure.'
                  },
                  {
                    icon: Users,
                    title: 'Professional Support',
                    description: '24/7 support from our team of pharmacists and technical specialists.'
                  }
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Platform Highlights</h3>
              <div className="space-y-4">
                {[
                  'Comprehensive medication review workflow',
                  'Automated PDF report generation',
                  'Clinical decision support tools',
                  'Patient counselling documentation',
                  'GP communication templates',
                  'Secure cloud storage',
                  'Mobile-responsive design',
                  'Medicare billing integration'
                ].map((highlight, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your HMR Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of Australian pharmacists who trust LAL MedReviews for their professional practice
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Your Free Trial
            </Link>
            <Link 
              href="/contact"
              className="border border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-2">
                  <Stethoscope className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">LAL MedReviews</span>
              </div>
              <p className="text-sm text-gray-400">
                Professional Home Medication Review platform for Australian pharmacists.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                <li><Link href="/updates" className="hover:text-white transition-colors">Updates</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/training" className="hover:text-white transition-colors">Training</Link></li>
                <li><Link href="/status" className="hover:text-white transition-colors">System Status</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 LAL MedReviews. All rights reserved. Professional Healthcare Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 