'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import PatientInfoReview from '@/components/PatientInfoReview';
import MedicationsReview from '@/components/MedicationsReview';
import PatientInterview from '@/components/PatientInterview';
import ClinicalRecommendations from '@/components/ClinicalRecommendations';
import FinalReview from '@/components/FinalReview';

interface TabsWorkflowProps {
  onExit: () => void;
}

export default function TabsWorkflow({ onExit }: TabsWorkflowProps) {
  const {
    currentStep,
    setCurrentStep,
    resetWorkflow,
    saveDraft
  } = useHMRSelectors();

  const [activeTab, setActiveTab] = useState<string>('patient-info');

  // Initialize active tab based on current step when component mounts
  useEffect(() => {
    if (currentStep && ['patient-info', 'medications-review', 'interview', 'recommendations', 'review'].includes(currentStep)) {
      setActiveTab(currentStep);
    }
  }, [currentStep]);

  // Update the currentStep in the store when tab changes
  useEffect(() => {
    if (activeTab) {
      setCurrentStep(activeTab as any);
    }
  }, [activeTab, setCurrentStep]);

  // Auto-save draft when switching tabs
  const handleTabChange = (tab: string) => {
    saveDraft();
    setActiveTab(tab);
  };

  // Handle next/previous navigation within tabs
  const handleNext = () => {
    const tabs = ['patient-info', 'medications-review', 'interview', 'recommendations', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const tabs = ['patient-info', 'medications-review', 'interview', 'recommendations', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      handleTabChange(tabs[currentIndex - 1]);
    }
  };

  const handleExitWorkflow = () => {
    const confirmExit = window.confirm(
      'Are you sure you want to exit? Your progress has been saved.'
    );
    if (confirmExit) {
      onExit();
    }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'patient-info':
        return <PatientInfoReview onNext={handleNext} onPrevious={handlePrevious} />;
      case 'medications-review':
        return <MedicationsReview onNext={handleNext} onPrevious={handlePrevious} />;
      case 'interview':
        return <PatientInterview onNext={handleNext} onPrevious={handlePrevious} />;
      case 'recommendations':
        return <ClinicalRecommendations onNext={handleNext} onPrevious={handlePrevious} />;
      case 'review':
        return <FinalReview onNext={handleNext} onPrevious={handlePrevious} />;
      default:
        return <PatientInfoReview onNext={handleNext} onPrevious={handlePrevious} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header with Exit Button */}
      <div className="flex justify-between items-center mb-6 p-4 bg-white border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">HMR Report Workflow</h1>
        <button
          onClick={handleExitWorkflow}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
        >
          Exit Workflow
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="mb-6 bg-white p-1 rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'patient-info', label: 'Patient Info' },
            { id: 'medications-review', label: 'Medications' },
            { id: 'interview', label: 'Interview' },
            { id: 'recommendations', label: 'Recommendations' },
            { id: 'review', label: 'Final Review' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 py-3 px-4 text-center font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 flex justify-between text-sm text-gray-500">
          <div>
            <span className="font-medium">Tip:</span> You can switch between tabs at any time. Your progress is automatically saved.
          </div>
          <div>
            <span className="text-blue-600 font-medium">Auto-saving</span> enabled
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {renderActiveTabContent()}
      </div>
    </div>
  );
} 