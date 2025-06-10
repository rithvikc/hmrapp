import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  Book, 
  Users,
  Calendar,
  TrendingUp,
  Award,
  Lightbulb,
  Shield,
  Clock,
  ArrowRight,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';

export default function ResourcesPage() {
  const resourceCategories = [
    {
      title: 'Clinical Guidelines',
      description: 'Evidence-based resources for HMR best practices',
      icon: Book,
      count: 12,
      color: 'from-blue-600 to-blue-700'
    },
    {
      title: 'Report Templates',
      description: 'Ready-to-use templates for different review types',
      icon: FileText,
      count: 25,
      color: 'from-green-600 to-green-700'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step guides and training materials',
      icon: Video,
      count: 18,
      color: 'from-purple-600 to-purple-700'
    },
    {
      title: 'Research & Studies',
      description: 'Latest pharmaceutical research and case studies',
      icon: TrendingUp,
      count: 35,
      color: 'from-orange-600 to-orange-700'
    },
    {
      title: 'Compliance Tools',
      description: 'HIPAA and regulatory compliance resources',
      icon: Shield,
      count: 8,
      color: 'from-red-600 to-red-700'
    },
    {
      title: 'Webinars & Events',
      description: 'Live training sessions and industry events',
      icon: Calendar,
      count: 15,
      color: 'from-teal-600 to-teal-700'
    }
  ];

  const featuredResources = [
    {
      title: 'Complete HMR Best Practices Guide',
      description: 'Comprehensive guide covering all aspects of home medicine reviews, from patient preparation to report submission.',
      type: 'Clinical Guide',
      duration: '45 min read',
      featured: true,
      downloadable: true,
      image: '/api/placeholder/400/240'
    },
    {
      title: 'Medication Reconciliation Template',
      description: 'Standardized template for documenting medication discrepancies and clinical recommendations.',
      type: 'Template',
      duration: 'Template',
      featured: true,
      downloadable: true,
      image: '/api/placeholder/400/240'
    },
    {
      title: 'Getting Started with myHMR',
      description: 'Complete walkthrough of the platform features and how to generate your first report in under 15 minutes.',
      type: 'Video Tutorial',
      duration: '12 min',
      featured: true,
      downloadable: false,
      image: '/api/placeholder/400/240'
    }
  ];

  const recentResources = [
    {
      title: 'New Medicare HMR Guidelines 2024',
      type: 'Clinical Update',
      date: '2 days ago',
      readTime: '8 min read'
    },
    {
      title: 'Polypharmacy Management Strategies',
      type: 'Research Paper',
      date: '1 week ago',
      readTime: '25 min read'
    },
    {
      title: 'Patient Communication Templates',
      type: 'Template Pack',
      date: '2 weeks ago',
      readTime: 'Multiple files'
    },
    {
      title: 'Clinical Decision Support Tools',
      type: 'Interactive Guide',
      date: '3 weeks ago',
      readTime: '15 min read'
    },
    {
      title: 'HMR ROI Calculator',
      type: 'Business Tool',
      date: '1 month ago',
      readTime: 'Calculator'
    }
  ];

  const upcomingWebinars = [
    {
      title: 'Advanced Clinical Recommendations',
      date: 'Dec 15, 2024',
      time: '2:00 PM AEST',
      presenter: 'Dr. Sarah Chen, PharmD',
      spots: 45
    },
    {
      title: 'HIPAA Compliance in Digital HMRs',
      date: 'Dec 22, 2024',
      time: '10:00 AM AEST',
      presenter: 'Legal Team',
      spots: 23
    },
    {
      title: 'Medication Therapy Management',
      date: 'Jan 8, 2025',
      time: '3:00 PM AEST',
      presenter: 'Prof. Michael Torres',
      spots: 67
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 font-serif">
            Resource Library
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Access comprehensive guides, templates, research, and tools to enhance your pharmacy practice and HMR expertise.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, guides, templates..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600">
              Find exactly what you need with our organized resource library
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resourceCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 group cursor-pointer">
                  <div className={`w-14 h-14 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {category.title}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <span>Browse resources</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4 mr-2" />
              Featured Resources
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Most Popular Resources
            </h2>
            <p className="text-xl text-gray-600">
              Our top-rated guides and templates used by thousands of pharmacists
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {resource.type === 'Video Tutorial' ? (
                        <Video className="h-8 w-8" />
                      ) : resource.type === 'Template' ? (
                        <FileText className="h-8 w-8" />
                      ) : (
                        <Book className="h-8 w-8" />
                      )}
                    </div>
                    <div className="text-sm font-medium">{resource.type}</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {resource.type}
                    </span>
                    <span className="text-xs text-gray-500">{resource.duration}</span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      <span>View Resource</span>
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </button>
                    {resource.downloadable && (
                      <button className="text-gray-600 hover:text-gray-700">
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two Column Layout */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Recent Resources */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Recently Added</h2>
              <div className="space-y-4">
                {recentResources.map((resource, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {resource.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">{resource.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {resource.type}
                      </span>
                      <span className="text-sm text-gray-500">{resource.readTime}</span>
                    </div>
                  </div>
                ))}
                
                <Link
                  href="#"
                  className="block text-center py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View All Resources
                </Link>
              </div>
            </div>

            {/* Upcoming Webinars */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Upcoming Webinars</h2>
              <div className="space-y-4">
                {upcomingWebinars.map((webinar, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 font-serif">{webinar.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {webinar.date} at {webinar.time}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {webinar.presenter}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        {webinar.spots} spots available
                      </div>
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Register Now
                    </button>
                  </div>
                ))}
                
                <Link
                  href="#"
                  className="block text-center py-3 px-6 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View All Events
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Quick Access
            </h2>
            <p className="text-xl text-gray-600">
              Jump straight to your most-needed resources
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'HMR Checklist', icon: FileText, color: 'bg-blue-500' },
              { title: 'Drug Interaction Tool', icon: Shield, color: 'bg-red-500' },
              { title: 'Patient Handouts', icon: Users, color: 'bg-green-500' },
              { title: 'Billing Codes', icon: TrendingUp, color: 'bg-purple-500' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                  <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    <span>Access now</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our team is constantly adding new resources. Let us know what you need and we'll prioritize it.
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
              href="/support"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 