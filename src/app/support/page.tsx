import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Book, 
  Video, 
  FileText,
  Clock,
  Users,
  Shield,
  ArrowRight,
  CheckCircle,
  Zap,
  Search
} from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const contactOptions = [
    {
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      availability: 'Mon-Fri, 8AM-6PM AEST',
      cta: 'Start Chat',
      primary: true,
      color: 'from-blue-600 to-purple-600'
    },
    {
      title: 'Email Support',
      description: 'Send us your questions anytime',
      icon: Mail,
      availability: 'Response within 4 hours',
      cta: 'Send Email',
      primary: false,
      color: 'from-green-600 to-teal-600'
    },
    {
      title: 'Phone Support',
      description: 'Speak directly with our experts',
      icon: Phone,
      availability: 'Professional & Business plans',
      cta: 'Call Now',
      primary: false,
      color: 'from-orange-600 to-red-600'
    }
  ];

  const helpResources = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of creating your first HMR report',
      icon: Book,
      type: 'Documentation',
      readTime: '5 min read'
    },
    {
      title: 'Video Tutorials',
      description: 'Step-by-step walkthroughs of key features',
      icon: Video,
      type: 'Video Series',
      readTime: '10 videos'
    },
    {
      title: 'Template Library',
      description: 'Pre-built templates for different types of reviews',
      icon: FileText,
      type: 'Resources',
      readTime: '20+ templates'
    },
    {
      title: 'Best Practices',
      description: 'Tips from experienced pharmacists',
      icon: CheckCircle,
      type: 'Guidelines',
      readTime: '8 min read'
    },
    {
      title: 'Integration Guide',
      description: 'Connect with your existing pharmacy systems',
      icon: Zap,
      type: 'Technical',
      readTime: '15 min read'
    },
    {
      title: 'Troubleshooting',
      description: 'Solutions to common issues and problems',
      icon: Search,
      type: 'Support',
      readTime: 'Various'
    }
  ];

  const supportTopics = [
    {
      category: 'Account Management',
      topics: [
        'Setting up your account',
        'Billing and subscription changes',
        'User permissions and team management',
        'Data export and backup'
      ]
    },
    {
      category: 'Report Generation',
      topics: [
        'Creating your first HMR report',
        'Customizing report templates',
        'Adding clinical recommendations',
        'Reviewing and finalizing reports'
      ]
    },
    {
      category: 'Technical Support',
      topics: [
        'Browser compatibility issues',
        'Integration with pharmacy systems',
        'Data import and export',
        'Mobile app usage'
      ]
    },
    {
      category: 'Security & Compliance',
      topics: [
        'HIPAA compliance features',
        'Data security measures',
        'Patient consent management',
        'Audit trail and reporting'
      ]
    }
  ];

  const stats = [
    { label: 'Average Response Time', value: '< 2 hours', icon: Clock },
    { label: 'Customer Satisfaction', value: '98%', icon: Users },
    { label: 'Issues Resolved', value: '99.5%', icon: CheckCircle },
    { label: 'Security Uptime', value: '99.9%', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8 font-serif">
            We're Here to Help
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Get the support you need to make the most of myHMR. Our team of experts is ready to assist you.
          </p>
        </div>
      </section>

      {/* Support Stats */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

      {/* Contact Options */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-600">
              Choose the support option that works best for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl p-8 shadow-lg ${
                    option.primary ? 'ring-2 ring-blue-500 transform scale-105' : ''
                  }`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 font-serif">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    <div className="text-sm text-gray-500 mb-6">{option.availability}</div>
                    
                    <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      option.primary 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}>
                      {option.cta}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Resources */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Help Resources
            </h2>
            <p className="text-xl text-gray-600">
              Find answers and learn how to get the most out of myHMR
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpResources.map((resource, index) => {
              const Icon = resource.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 group cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {resource.type}
                        </span>
                        <span className="text-xs text-gray-500">{resource.readTime}</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{resource.description}</p>
                      
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        <span>Learn more</span>
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Support Topics */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
              Common Support Topics
            </h2>
            <p className="text-xl text-gray-600">
              Quick access to the most frequently requested help topics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {supportTopics.map((category, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">{category.category}</h3>
                <ul className="space-y-3">
                  {category.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>
                      <Link
                        href="#"
                        className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200 block hover:bg-blue-50 p-2 rounded-lg -m-2"
                      >
                        {topic}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-50 border-t border-red-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Phone className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 font-serif">
            Need Emergency Support?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            For critical issues affecting patient care or urgent technical problems that need immediate attention.
          </p>
          <div className="space-y-4">
            <div className="text-xl font-semibold text-red-600">
              Emergency Hotline: 1-800-LAL-HELP
            </div>
            <div className="text-sm text-gray-600">
              Available 24/7 for Professional and Business plan customers
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 font-serif">
            Still Need Help?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Our support team is standing by to help you succeed with myHMR.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Start Live Chat</span>
            </button>
            <Link
              href="/pricing"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Support Plans
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 