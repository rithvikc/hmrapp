import Link from 'next/link';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  Twitter,
  Linkedin,
  Github
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 font-serif">myHMR</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Streamlined Home Medication Reviews for Australian pharmacists.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 font-serif">Product</h3>
              <ul className="space-y-3">
              <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">About</Link></li>
              <li><Link href="/resources" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Resources</Link></li>
              </ul>
      </div>

          {/* Support Links */}
            <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 font-serif">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/support" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">Terms</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4 font-serif">Connect</h3>
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-gray-600 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                support@myhmr.ai
        </div>
              <div className="flex items-center text-gray-600 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                1-800-MY-HMR
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-3">
              <Link href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Twitter className="h-4 w-4 text-gray-600" />
              </Link>
              <Link href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Linkedin className="h-4 w-4 text-gray-600" />
              </Link>
              <Link href="#" className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Github className="h-4 w-4 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              &copy; {currentYear} myHMR. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>🇦🇺 Made in Australia</span>
              <span>•</span>
              <span>Privacy-First Design</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 