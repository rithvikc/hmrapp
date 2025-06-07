'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    saveDraft,
    hasUnsavedWork
  } = useHMRSelectors();

  const [activeTab, setActiveTab] = useState<string>('patient-info');
  const [lastSaveTime, setLastSaveTime] = useState<number>(Date.now());

  // Enhanced auto-save function
  const performAutoSave = useCallback(() => {
    try {
      console.log('TabsWorkflow: Performing auto-save...');
      saveDraft();
      setLastSaveTime(Date.now());
      console.log('TabsWorkflow: Auto-save completed successfully');
    } catch (error) {
      console.error('TabsWorkflow: Auto-save failed:', error);
    }
  }, [saveDraft]);

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

  // Auto-save on page visibility change (when user switches browser tabs)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is being hidden (user switched to another tab)
        console.log('TabsWorkflow: Page hidden, performing auto-save...');
        performAutoSave();
      } else {
        // Page is visible again
        console.log('TabsWorkflow: Page visible again');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performAutoSave]);

  // Auto-save before page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('TabsWorkflow: Page unloading, performing final auto-save...');
      performAutoSave();
      
      // Show warning if there's unsaved work
      if (hasUnsavedWork) {
        const message = 'You have unsaved work. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [performAutoSave, hasUnsavedWork]);

  // Auto-save on window blur (when window loses focus)
  useEffect(() => {
    const handleWindowBlur = () => {
      console.log('TabsWorkflow: Window lost focus, performing auto-save...');
      performAutoSave();
    };

    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [performAutoSave]);

  // Periodic auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const timeSinceLastSave = Date.now() - lastSaveTime;
      if (timeSinceLastSave > 30000) { // 30 seconds
        console.log('TabsWorkflow: Periodic auto-save triggered');
        performAutoSave();
      }
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [performAutoSave, lastSaveTime]);

  // Auto-save draft when switching tabs
  const handleTabChange = (tab: string) => {
    console.log(`TabsWorkflow: Changing from ${activeTab} to ${tab}`);
    performAutoSave();
    setActiveTab(tab);
  };

  // Handle next/previous navigation within tabs
  const handleNext = () => {
    const tabs = ['patient-info', 'medications-review', 'interview', 'recommendations', 'review'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      handleTabChange(tabs[currentIndex + 1]);
    } else if (activeTab === 'review') {
      // Workflow completed - handle completion
      handleWorkflowCompletion();
    }
  };

  const handleWorkflowCompletion = async () => {
    try {
      // Save final draft
      console.log('TabsWorkflow: Completing workflow, saving final draft...');
      await performAutoSave();
      
      // Show completion message
      alert('🎉 Workflow completed successfully! Your HMR report has been finalized and saved. You can now generate the PDF and email template from the Final Review tab.');
      
      // Optional: Navigate back to dashboard or keep on final review
      // onExit(); // Uncomment if you want to exit to dashboard
    } catch (error) {
      console.error('Error completing workflow:', error);
      alert('Error completing workflow. Please try again.');
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
    // Auto-save before showing confirmation
    performAutoSave();
    
    const confirmExit = window.confirm(
      'Are you sure you want to exit? Your progress has been saved and will be available when you return.'
    );
    if (confirmExit) {
      // Final save before exit
      performAutoSave();
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
        <div>
          <h1 className="text-xl font-semibold text-gray-900">HMR Report Workflow</h1>
          <p className="text-xs text-gray-500 mt-1">
            Auto-saves every 30 seconds and when you switch tabs
          </p>
        </div>
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
            <span className="font-medium">Tip:</span> Your progress is automatically saved when switching tabs or browser windows.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-green-600 font-medium">🟢 Auto-save active</span>
            <span className="text-xs text-gray-400">
              Last saved: {new Date(lastSaveTime).toLocaleTimeString()}
            </span>
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