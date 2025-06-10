'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Stethoscope, Shield, FileText, Clock, CheckCircle, ArrowRight,
  Users, BarChart3, Lock, Smartphone, Zap, Award, User, Pill,
  MessageSquare, Activity, Mail, Timer, TrendingUp, Brain, Sparkles
} from 'lucide-react';

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const workflowSteps = [
    {
      icon: User,
      title: 'Patient Registration',
      description: 'Quick patient demographics capture with automated data validation and duplicate detection',
      time: '1 min',
      traditionalTime: '15 min'
    },
    {
      icon: Pill,
      title: 'Medication Review',
      description: 'Intelligent medication analysis with automatic drug interaction detection and dosage optimization',
      time: '1 min',
      traditionalTime: '25 min'
    },
    {
      icon: MessageSquare,
      title: 'Patient Interview',
      description: 'Smart questionnaires with dynamic clinical prompts and personalized follow-up questions',
      time: '1 min',
      traditionalTime: '20 min'
    },
    {
      icon: Activity,
      title: 'Clinical Assessment',
      description: 'Automated clinical recommendations with evidence-based priority scoring and risk assessment',
      time: '1 min',
      traditionalTime: '25 min'
    },
    {
      icon: FileText,
      title: 'Report Generation',
      description: 'Instant PDF creation with professional formatting and automatic Medicare compliance checking',
      time: '30 sec',
      traditionalTime: '30 min'
    },
    {
      icon: Mail,
      title: 'GP Communication',
      description: 'Pre-formatted email templates and secure document transmission with delivery confirmation',
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
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 font-serif">
              Streamlined Home Medication{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Reviews
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Save hours on every HMR with intelligent automation designed for Australian pharmacists. 
              Generate professional reports, streamline clinical assessments, and focus on patient care.
            </p>
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Timer className="h-4 w-4 mr-2" />
              Save 95% of your documentation time
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/pricing"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start 14-Day Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/demo"
                className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center justify-center"
              >
                Watch Demo
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-4 max-w-2xl mx-auto">
              Start with Professional Plan • Cancel anytime during 14-day trial • No commitment required
            </p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              How myHMR Saves You Time
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Complete your entire HMR workflow in just 5 minutes instead of {Math.round(totalTraditionalTime)} minutes with intelligent automation
            </p>
            
            {/* Time Savings Highlight */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl inline-block mb-12 shadow-lg">
              <div className="flex items-center space-x-4">
                <Timer className="h-8 w-8" />
                <div className="text-left">
                  <div className="text-2xl font-bold">Save {Math.round(timeSaved)} minutes</div>
                  <div className="text-green-100">per HMR report with AI</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Workflow */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Step Navigation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 font-serif">HMR Workflow Steps</h3>
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
                <h3 className="text-2xl font-bold text-gray-900 font-serif mb-2">
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
                  <h4 className="text-xl font-bold text-gray-900 mb-2 font-serif">
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
                    <span className="text-sm text-gray-600">With AI:</span>
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
                Industry-leading AI efficiency
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Time-Saving Features for Professional HMRs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for Australian pharmacists to maximize efficiency and minimize documentation time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'Automated Report Generation',
                description: 'Professional PDF reports instantly generated with intelligent formatting that meets Medicare requirements.'
              },
              {
                icon: Sparkles,
                title: 'Smart Clinical Insights',
                description: 'Intelligent drug interaction checking, dosage optimization, and evidence-based clinical recommendations.'
              },
              {
                icon: Clock,
                title: 'Streamlined Workflow',
                description: 'Complete HMRs 95% faster with guided interview processes and intelligent automation.'
              },
              {
                icon: Lock,
                title: 'Privacy-First Design',
                description: 'Minimal data storage - only patient name, DOB, and ID are retained. No sensitive health data stored.'
              },
              {
                icon: FileText,
                title: 'Professional Templates',
                description: 'Smart templates that adapt to patient needs and clinical scenarios automatically.'
              },
              {
                icon: Smartphone,
                title: 'Mobile Optimized',
                description: 'Access your platform anywhere with responsive design and mobile optimization.'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 font-serif">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              Privacy-First Approach
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Your Privacy is Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe in minimal data collection. Only essential patient identifiers are stored - no sensitive health information is retained on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Minimal Data Storage</h3>
              <p className="text-sm text-gray-600">Only patient name, date of birth, and unique ID are stored. No clinical data retention.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Encrypted Processing</h3>
              <p className="text-sm text-gray-600">All data is encrypted during processing and transmission using industry-standard security.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Secure Payments</h3>
              <p className="text-sm text-gray-600">Payment details are securely processed and never stored on our servers.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center bg-white px-6 py-3 rounded-full shadow-lg border border-green-200">
              <span className="text-sm text-gray-600 mr-2">Designed for healthcare professionals</span>
              <span className="text-sm font-semibold text-green-600">Privacy by Design</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif">
                Why Choose myHMR?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Award,
                    title: 'Medicare Compliant',
                    description: 'All AI-generated reports meet Medicare guidelines for HMR documentation and billing requirements.'
                  },
                  {
                    icon: Zap,
                    title: 'Maximum Efficiency',
                    description: 'Reduce documentation time by up to 95% with intelligent automation and smart recommendations.'
                  },
                  {
                    icon: Lock,
                    title: 'Privacy-First',
                    description: 'Minimal data collection ensures patient privacy while maintaining clinical effectiveness.'
                  },
                  {
                    icon: Users,
                    title: 'Professional Support',
                    description: '24/7 support from our team of pharmacists and AI specialists.'
                  }
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mr-4 mt-1">
                        <Icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center font-serif">Platform Highlights</h3>
              <div className="space-y-4">
                {[
                  'Streamlined medication review workflow',
                  'Automated professional report generation',
                  'Smart clinical decision support',
                  'Intelligent patient interview guides',
                  'Pre-formatted GP communication templates',
                  'Privacy-first minimal data storage',
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            Ready to Save Hours on Every HMR?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of Australian pharmacists who save 95% of their documentation time with myHMR
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/pricing"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start 14-Day Free Trial
            </Link>
            <Link 
              href="/contact"
              className="border border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
          <p className="text-sm text-blue-100 mt-4">
            Professional Plan required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
} 