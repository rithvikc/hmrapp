import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Clock, 
  Heart, 
  Stethoscope, 
  Users, 
  CheckCircle, 
  FileText,
  Target,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const stats = [
    { label: 'Time Saved Per Report', value: '45 mins', icon: Clock },
    { label: 'Pharmacists Helped', value: '500+', icon: Users },
    { label: 'Reports Generated', value: '10,000+', icon: FileText },
    { label: 'Customer Satisfaction', value: '98%', icon: Heart },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Passion for Patient Care',
      description: 'We believe pharmacists should spend their time on what matters most - helping patients, not paperwork.'
    },
    {
      icon: Target,
      title: 'Focus on Efficiency',
      description: 'Every feature we build is designed to reduce administrative burden and increase clinical impact.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation in Healthcare',
      description: 'We use cutting-edge technology to solve real problems faced by healthcare professionals every day.'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Stethoscope className="h-4 w-4 mr-2" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 font-serif">
            Built by Pharmacists, for Pharmacists
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We started myHMR because we were frustrated with spending more time on paperwork 
            than on what we love most - helping patients through comprehensive medication reviews.
          </p>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif">
                The Problem We Solved
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Reports Taking Forever</h3>
                    <p className="text-gray-600">
                      We were spending 2-3 hours writing up reports for 30-minute patient interviews. 
                      The documentation was taking longer than the actual clinical work.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Repetitive Administrative Work</h3>
                    <p className="text-gray-600">
                      Every report required the same formatting, patient details, and clinical structure. 
                      We were essentially doing data entry instead of clinical thinking.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Less Time for What Matters</h3>
                    <p className="text-gray-600">
                      The administrative burden meant we could help fewer patients and had less energy 
                      for the clinical work we were passionate about.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-red-500 mb-2">3 Hours</div>
                <div className="text-lg text-gray-600 mb-6">Average time per HMR report</div>
                
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500 mb-2">Time breakdown</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Patient interview</span>
                      <span className="font-medium">30 mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Report writing</span>
                      <span className="font-medium text-red-600">2.5 hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="text-6xl font-bold text-green-500 mb-2">15 Minutes</div>
                <div className="text-lg text-gray-600 mb-6">New average time per report</div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-2">Time breakdown with myHMR</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">Patient interview</span>
                      <span className="font-medium">30 mins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Report generation</span>
                      <span className="font-medium text-green-600">15 mins</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 text-sm text-green-700 font-medium">
                  ✨ 90% time reduction in documentation
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-serif">
                Our Solution
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Automated Report Generation</h3>
                    <p className="text-gray-600">
                      Our intelligent system converts your clinical interview data into professional, 
                      comprehensive HMR reports in minutes, not hours.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Focus on Clinical Work</h3>
                    <p className="text-gray-600">
                      Spend your time conducting thorough patient interviews and making clinical decisions, 
                      while we handle the administrative documentation.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Heart className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">Help More Patients</h3>
                    <p className="text-gray-600">
                      With faster report generation, you can conduct more HMRs per day and make a 
                      greater impact on patient health outcomes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600">
              Helping pharmacists across the country focus on what they do best
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 font-serif">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            Ready to Focus on What You Love?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of pharmacists who've reclaimed their time and rediscovered their passion for patient care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/pricing"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 