'use client'

import { useRouter } from 'next/navigation'
import { FileText, Users, Mail, Shield, Home, Pill, Zap, CheckCircle, ArrowRight, Heart, Activity } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full mb-8">
                <Home className="h-4 w-4" />
                <span>Australian Home Medication Review Automation</span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  HMR Automation
                </span>
                <br />
                <span className="text-gray-800">
                  Made Simple
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                Streamline your Home Medication Review workflow with intelligent automation. 
                From GP referral to final report - optimising patient outcomes across Australia.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Create your free report</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-400 hover:text-blue-600 transition-all duration-300 bg-white"
                >
                  Access Platform
                </button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">90%</div>
                  <div className="text-sm text-gray-600">Time Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">45min</div>
                  <div className="text-sm text-gray-600">Average HMR Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Pharmacists Served</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">$222.77</div>
                  <div className="text-sm text-gray-600">Per HMR Claim</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Complete HMR
              </span> Solution
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for efficient Home Medication Reviews in Australia
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Document Processing</h3>
              <p className="text-gray-600 mb-6">
                Intelligent extraction of patient information and medications from GP referrals. OCR technology automatically populates patient profiles.
              </p>
              <div className="flex items-center text-blue-600 font-semibold">
                <span>Learn more</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-2xl border border-purple-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Clinical Assessment Tools</h3>
              <p className="text-gray-600 mb-6">
                Structured patient interview forms, medication adherence assessments, and lifestyle evaluation tools designed for Australian HMR standards.
              </p>
              <div className="flex items-center text-purple-600 font-semibold">
                <span>Explore features</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>

            <div className="group bg-gradient-to-br from-indigo-50 to-blue-100 p-8 rounded-2xl border border-indigo-200 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Automated Reporting</h3>
              <p className="text-gray-600 mb-6">
                Generate professional HMR reports instantly. Automatic email templates for GPs, claim forms, and follow-up scheduling.
              </p>
              <div className="flex items-center text-indigo-600 font-semibold">
                <span>See demo</span>
                <ArrowRight className="h-4 w-4 ml-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <div className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Complete HMR Workflow
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              From GP referral to Medicare claim - every step streamlined for Australian pharmacists
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Referral Processing", desc: "Upload and extract patient data from GP referrals automatically" },
              { icon: Users, title: "Patient Interview", desc: "Structured interview forms for medication understanding and lifestyle assessment" },
              { icon: Pill, title: "Medication Review", desc: "Comprehensive analysis of current medications and adherence patterns" },
              { icon: Activity, title: "Clinical Recommendations", desc: "Evidence-based suggestions and medication management plans" },
              { icon: Mail, title: "GP Communication", desc: "Professional reports and email templates for seamless GP collaboration" },
              { icon: CheckCircle, title: "Medicare Claiming", desc: "Automated claim generation for Item 900 and rural loading allowances" }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-colors duration-300">
                  <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg mb-4">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-blue-100">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Built for <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Australian Healthcare</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl border border-green-200">
              <CheckCircle className="h-12 w-12 text-green-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Medicare Compliant</h3>
              <p className="text-gray-600">
                Fully compliant with Australian Medicare requirements for HMR services (Item 900) and rural loading allowances.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-8 rounded-2xl border border-blue-200">
              <Shield className="h-12 w-12 text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy Protected</h3>
              <p className="text-gray-600">
                Australian Privacy Act compliant with secure patient data handling and My Health Record integration.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-2xl border border-purple-200">
              <Activity className="h-12 w-12 text-purple-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">PSA Standards</h3>
              <p className="text-gray-600">
                Adheres to Pharmaceutical Society of Australia guidelines for comprehensive medication management reviews.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your HMR Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join hundreds of Australian pharmacists already streamlining their Home Medication Review workflows
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 shadow-lg"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => router.push('/auth/signin')}
              className="px-10 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">HMR Automation</h3>
              <p className="text-gray-400 mb-4">
                Streamlining Home Medication Reviews for Australian pharmacists. 
                Built by pharmacists, for pharmacists.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 HMR Automation. All rights reserved. Australian owned and operated.</p>
          </div>
        </div>
      </div>
    </div>
  )
} 