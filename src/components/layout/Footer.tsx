import Link from 'next/link';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  MapPin,
  Twitter,
  Facebook,
  Linkedin,
  Instagram,
  ArrowRight
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Features', href: '/#features' },
        { name: 'Demo', href: '/demo' },
        { name: 'Updates', href: '/updates' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'Resource Library', href: '/resources' },
        { name: 'Clinical Guidelines', href: '/resources#guidelines' },
        { name: 'Templates', href: '/resources#templates' },
        { name: 'Video Tutorials', href: '/resources#videos' },
        { name: 'Webinars', href: '/resources#webinars' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/support' },
        { name: 'Contact Us', href: '/support#contact' },
        { name: 'Live Chat', href: '/support#chat' },
        { name: 'Training', href: '/support#training' },
        { name: 'System Status', href: '/status' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press', href: '/press' },
        { name: 'Partners', href: '/partners' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Security', href: '/security' },
        { name: 'HIPAA Compliance', href: '/compliance' },
        { name: 'Cookie Policy', href: '/cookies' }
      ]
    }
  ];

  const contactInfo = [
    {
      icon: Mail,
      text: 'support@lalmedreviews.com',
      href: 'mailto:support@lalmedreviews.com'
    },
    {
      icon: Phone,
      text: '1-800-LAL-HELP',
      href: 'tel:1-800-525-4357'
    },
    {
      icon: MapPin,
      text: 'Sydney, Australia',
      href: null
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/lalmedreviews', name: 'Twitter' },
    { icon: Facebook, href: 'https://facebook.com/lalmedreviews', name: 'Facebook' },
    { icon: Linkedin, href: 'https://linkedin.com/company/lalmedreviews', name: 'LinkedIn' },
    { icon: Instagram, href: 'https://instagram.com/lalmedreviews', name: 'Instagram' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">LAL MedReviews</span>
                <div className="text-xs text-gray-400">Clinical Platform</div>
              </div>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              Professional Home Medication Review platform designed for Australian pharmacists. 
              Streamline your workflow, ensure compliance, and focus on what matters most - patient care.
            </p>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {contactInfo.map((contact, index) => {
                const Icon = contact.icon;
                const content = (
                  <div className="flex items-center text-gray-400 hover:text-white transition-colors">
                    <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="text-sm">{contact.text}</span>
                  </div>
                );

                return contact.href ? (
                  <Link key={index} href={contact.href}>
                    {content}
                  </Link>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm group flex items-center"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get the latest updates on new features, clinical guidelines, and platform improvements.
              </p>
            </div>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-r-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <p>&copy; {currentYear} LAL MedReviews. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <span>🇦🇺 Made in Australia</span>
                <span>•</span>
                <span>HIPAA Compliant</span>
                <span>•</span>
                <span>SOC 2 Certified</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/security" className="text-gray-400 hover:text-white transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 