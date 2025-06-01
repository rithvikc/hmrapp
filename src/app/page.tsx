'use client';

import React, { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import PDFUpload from '@/components/PDFUpload';
import PatientInfoReview from '@/components/PatientInfoReview';
import MedicationsReview from '@/components/MedicationsReview';
import PatientInterview from '@/components/PatientInterview';
import ClinicalRecommendations from '@/components/ClinicalRecommendations';
import FinalReview from '@/components/FinalReview';
import { useHMRSelectors } from '@/store/hmr-store';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const {
    currentStep,
    setCurrentStep,
    loadDraft,
    resetWorkflow,
    hasUnsavedWork
  } = useHMRSelectors();

  useEffect(() => {
    setMounted(true);
    // Check for existing draft on app load only after mounting
    loadDraft();
  }, [loadDraft]);

  // Prevent hydration mismatches by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleNewReview = () => {
    if (hasUnsavedWork) {
      const confirmNewReview = window.confirm(
        'You have unsaved work. Starting a new review will discard it. Continue?'
      );
      if (!confirmNewReview) return;
    }
    
    resetWorkflow();
    setCurrentStep('upload');
  };

  const handleContinueDraft = (reviewId: number) => {
    // Load specific review data
    console.log('Continue draft for review:', reviewId);
    // TODO: Implement loading specific review data
    setCurrentStep('interview');
  };

  const handleViewReport = (reviewId: number) => {
    // View/download completed report
    console.log('View report for review:', reviewId);
    // TODO: Implement report viewing/downloading
  };

  const handleDataExtracted = (data: { patient?: Record<string, string | number>; medications?: Record<string, string | number>[] }) => {
    console.log('Data extracted from PDF:', data);
  };

  const handleNextStep = () => {
    switch (currentStep) {
      case 'upload':
        setCurrentStep('patient-info');
        break;
      case 'patient-info':
        setCurrentStep('medications-review');
        break;
      case 'medications-review':
        setCurrentStep('interview');
        break;
      case 'interview':
        setCurrentStep('recommendations');
        break;
      case 'recommendations':
        setCurrentStep('review');
        break;
      case 'review':
        setCurrentStep('email');
        break;
      default:
        setCurrentStep('upload');
    }
  };

  const handlePreviousStep = () => {
    switch (currentStep) {
      case 'upload':
        setCurrentStep('dashboard');
        break;
      case 'patient-info':
        setCurrentStep('upload');
        break;
      case 'medications-review':
        setCurrentStep('patient-info');
        break;
      case 'interview':
        setCurrentStep('medications-review');
        break;
      case 'recommendations':
        setCurrentStep('interview');
        break;
      case 'review':
        setCurrentStep('recommendations');
        break;
      case 'email':
        setCurrentStep('review');
        break;
      default:
        setCurrentStep('dashboard');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'dashboard':
        return (
          <Dashboard
            onNewReview={handleNewReview}
            onContinueDraft={handleContinueDraft}
            onViewReport={handleViewReport}
          />
        );
        
      case 'upload':
        return (
          <PDFUpload
            onDataExtracted={handleDataExtracted}
            onNext={handleNextStep}
          />
        );
      
      case 'patient-info':
        return (
          <PatientInfoReview
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );

      case 'medications-review':
        return (
          <MedicationsReview
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      
      case 'interview':
        return (
          <PatientInterview
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      
      case 'recommendations':
        return (
          <ClinicalRecommendations
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      
      case 'review':
        return (
          <FinalReview
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        );
      
      case 'email':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Send Report
              </h2>
              <p className="text-gray-600">
                Generate PDF report and send to referring doctor
              </p>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Email Report Component</p>
                <p className="text-sm text-gray-400">
                  This will generate the PDF and handle email sending
                </p>
              </div>
              
              <div className="flex justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={handlePreviousStep}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back to Review
                </button>
                
                <button
                  onClick={() => setCurrentStep('dashboard')}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Complete & Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <Dashboard
            onNewReview={handleNewReview}
            onContinueDraft={handleContinueDraft}
            onViewReport={handleViewReport}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              HMR Workflow
            </h1>
            <button
              onClick={() => {
                const confirmExit = window.confirm(
                  'Are you sure you want to exit? Unsaved changes will be lost.'
                );
                if (confirmExit) {
                  resetWorkflow();
                  setCurrentStep('dashboard');
                }
              }}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Exit Workflow
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {[
              { step: 'upload', label: 'Upload' },
              { step: 'patient-info', label: 'Patient Info' },
              { step: 'medications-review', label: 'Medications Review' },
              { step: 'interview', label: 'Interview' },
              { step: 'recommendations', label: 'Recommendations' },
              { step: 'review', label: 'Review' },
              { step: 'email', label: 'Send' }
            ].map((item, index) => {
              const isActive = currentStep === item.step;
              const isCompleted = ['upload', 'patient-info', 'medications-review', 'interview', 'recommendations', 'review', 'email']
                .indexOf(currentStep) > index;
              
              return (
                <div key={item.step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                  {index < 6 && (
                    <div className={`mx-4 h-0.5 w-8 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  );
}
