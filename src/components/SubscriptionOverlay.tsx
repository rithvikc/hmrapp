'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Crown, 
  X, 
  ArrowRight, 
  AlertTriangle,
  CreditCard,
  Zap
} from 'lucide-react';

interface SubscriptionOverlayProps {
  isVisible: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  showCloseButton?: boolean;
}

export default function SubscriptionOverlay({ 
  isVisible, 
  onClose, 
  title = "Subscription Required",
  message = "Your subscription is not active. Please select a plan to continue using myHMR features.",
  showCloseButton = true
}: SubscriptionOverlayProps) {
  const router = useRouter();

  if (!isVisible) return null;

  const handleSelectPlan = () => {
    router.push('/subscription');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
        {/* Close Button */}
        {showCloseButton && onClose && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        )}

        <div className="p-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
            <Crown className="h-8 w-8 text-amber-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {/* Features List */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="h-4 w-4 text-blue-600 mr-2" />
              With an active subscription you get:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Create unlimited HMR reports
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Patient management system
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Professional PDF reports
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                Analytics and insights
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSelectPlan}
              className="w-full flex items-center justify-center py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Select a Plan
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
            
            {showCloseButton && onClose && (
              <button
                onClick={handleClose}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            )}
          </div>

          {/* Support Link */}
          <p className="text-xs text-gray-500 mt-6">
            Need help? <a href="mailto:support@myhmr.ai" className="text-blue-600 hover:text-blue-500">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
} 