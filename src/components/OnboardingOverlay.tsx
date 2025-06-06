'use client';

import { useState, useEffect } from 'react';
import { 
  X, ArrowRight, CheckCircle, Users, FileText, 
  BarChart3, Sparkles, Play, BookOpen
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
}

interface OnboardingOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  pharmacistName?: string;
  isTrialUser?: boolean;
}

export default function OnboardingOverlay({ 
  isVisible, 
  onComplete, 
  pharmacistName = 'Doctor',
  isTrialUser = false 
}: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: `Welcome to LAL MedReviews, ${pharmacistName}!`,
      description: `You're now part of the leading platform for Home Medicine Reviews. ${isTrialUser ? 'Your 14-day trial gives you access to 5 HMR reports.' : 'Let\'s get you started with creating your first HMR.'} This quick tour will show you everything you need to know.`,
      icon: <Sparkles className="h-8 w-8 text-purple-600" />
    },
    {
      id: 'patients',
      title: 'Manage Your Patients',
      description: 'Add and organize your patients with comprehensive profiles including medical history, current medications, and contact details. All patient data is securely stored and HIPAA compliant.',
      icon: <Users className="h-8 w-8 text-blue-600" />,
      action: 'Add Your First Patient'
    },
    {
      id: 'hmr',
      title: 'Create HMR Reports',
      description: 'Conduct comprehensive medication reviews with our guided interview process. Generate professional PDF reports automatically with clinical recommendations and medication compliance assessments.',
      icon: <FileText className="h-8 w-8 text-green-600" />,
      action: 'Start Your First HMR'
    },
    {
      id: 'dashboard',
      title: 'Track Your Progress',
      description: 'Monitor your practice with analytics, track pending reviews, and see your recent activity. Keep tabs on your subscription usage and upcoming renewals.',
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      action: 'Explore Dashboard'
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: `Congratulations! You're ready to transform your medication review process. ${isTrialUser ? 'Remember, you have 5 trial HMRs to explore all features.' : 'Enjoy unlimited HMRs with your subscription.'} Need help? Check our knowledge base or contact support.`,
      icon: <CheckCircle className="h-8 w-8 text-green-500" />
    }
  ];

  const handleNext = async () => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);

    // Mark step as completed in backend
    if (currentStep < steps.length - 1) {
      try {
        await fetch('/api/onboarding', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: steps[currentStep].id
          }),
        });
      } catch (error) {
        console.error('Error updating onboarding step:', error);
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding
      try {
        await fetch('/api/onboarding', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            step: 'complete'
          }),
        });
      } catch (error) {
        console.error('Error completing onboarding:', error);
      }
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                {currentStepData.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentStepData.title}</h2>
                <p className="text-blue-100 text-sm">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              {currentStepData.icon}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-blue-600 scale-125'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Quick Tips for Current Step */}
          {currentStep === 1 && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Quick Tip</h4>
              <p className="text-blue-800 text-sm">
                Start by adding a few regular patients. You can always update their information later as you learn more about their medication needs.
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-green-900 mb-2">💡 Quick Tip</h4>
              <p className="text-green-800 text-sm">
                Our guided interview process ensures you don't miss any important details. The system will prompt you for all necessary information.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-orange-900 mb-2">💡 Quick Tip</h4>
              <p className="text-orange-800 text-sm">
                {isTrialUser 
                  ? 'Your trial usage is tracked in the top-right corner. When ready, upgrade for unlimited access.'
                  : 'Your subscription usage resets monthly. Track your progress and patient outcomes over time.'
                }
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div className="flex space-x-3">
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Skip Tour
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                </span>
                {currentStep === steps.length - 1 ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Need help? Check our{' '}
              <button className="text-blue-600 hover:text-blue-500 inline-flex items-center">
                <BookOpen className="h-3 w-3 mr-1" />
                Knowledge Base
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 