import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import EnhancedDashboard from '@/components/clinical/EnhancedDashboard';
import PDFUpload from '@/components/PDFUpload';
import PatientsView from '@/components/PatientsView';
import TabsWorkflow from '@/components/TabsWorkflow';
import DataDebugger from '@/components/DataDebugger';
import { useHMRSelectors, Patient } from '@/store/hmr-store';

// Extended type for all navigation steps
type ExtendedStep = 
  | 'dashboard' 
  | 'patients-view' 
  | 'upload' 
  | 'patient-info' 
  | 'medications-review' 
  | 'interview' 
  | 'recommendations' 
  | 'review'
  | 'add-patient'
  | 'scheduled-reviews'
  | 'medications'
  | 'clinical-guidelines'
  | 'drug-interactions'
  | 'risk-assessment'
  | 'analytics'
  | 'reports'
  | 'settings'
  | 'urgent-review'
  | 'medication-alert';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const {
    currentStep,
    setCurrentStep,
    loadDraft,
    resetWorkflow,
    hasUnsavedWork,
    setLoading,
    setError,
    patients,
    loadPatients,
    setCurrentPatient,
    currentPatient
  } = useHMRSelectors();

  useEffect(() => {
    setMounted(true);
    
    try {
      loadDraft();
    } catch (error) {
      console.error('[DEBUG] Error in loadDraft:', error);
    }
    
    const timer = setTimeout(() => {
      setMounted(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [loadDraft]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleNavigate = (step: string) => {
    setCurrentStep(step as any);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

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
    console.log('Continue draft for review:', reviewId);
    setCurrentStep('patient-info');
  };

  const handleViewAllPatients = () => {
    setCurrentStep('patients-view');
  };

  const handleGenerateReports = () => {
    alert('Generate Reports functionality - will show options to generate batch reports, statistics, and export data');
  };

  const handleScheduleReview = () => {
    alert('Schedule Review functionality - will show calendar interface for scheduling reviews');
  };

  const handleGlobalSearch = (query: string) => {
    console.log('Global search:', query);
    // TODO: Implement global search functionality
  };

  // Patient view handlers
  const handleNewPatient = () => {
    alert('Add New Patient functionality - will navigate to patient creation form');
  };

  const handleEditPatient = (patientId: number) => {
    alert(`Edit Patient ${patientId} functionality - will navigate to patient edit form`);
  };

  const handleViewPatient = (patientId: number) => {
    alert(`View Patient ${patientId} functionality - will show detailed patient information`);
  };

  const handleStartReview = async (patientId: number) => {
    try {
      setLoading(true);
      console.log('Starting review for patient ID:', patientId);
      
      if (patients.length === 0) {
        console.log('Loading patients from API...');
        await loadPatients();
      }
      
      const patient = patients.find((p: Patient) => p.id === patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      console.log('Found patient:', patient.name);

      resetWorkflow();
      setCurrentPatient(patient);
      setCurrentStep('patient-info');
      
      console.log('Successfully started HMR workflow for patient:', patient.name);
      
    } catch (error) {
      console.error('Error starting review:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to start review: ${errorMessage}`);
      alert(`Failed to start review: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = async (reviewId: number) => {
    try {
      setLoading(true);
      
      const reviewResponse = await fetch(`/api/reviews/${reviewId}`);
      if (!reviewResponse.ok) {
        throw new Error('Failed to fetch review data');
      }
      const reviewData = await reviewResponse.json();

      const pdfResponse = await fetch('/api/generate-hmr-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text();
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `HMR_Report_${reviewData.patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('Report downloaded successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate report');
      alert(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDataExtracted = (data: { patient?: Record<string, string | number>; medications?: Record<string, string | number>[] }) => {
    console.log('Data extracted from PDF:', data);
    setCurrentStep('patient-info');
  };

  const handlePDFNext = () => {
    setCurrentStep('patient-info');
  };

  const handleTabsWorkflowExit = () => {
    setCurrentStep('dashboard');
  };

  const handlePatientBack = () => {
    setCurrentStep('dashboard');
  };

  const renderCurrentStep = () => {
    switch (currentStep as ExtendedStep) {
      case 'dashboard':
        return (
          <EnhancedDashboard
            onNewReview={handleNewReview}
            onViewAllPatients={handleViewAllPatients}
            onViewPatient={handleViewPatient}
            onStartReview={handleStartReview}
            onViewReport={handleViewReport}
          />
        );
        
      case 'upload':
        return (
          <PDFUpload 
            onDataExtracted={handleDataExtracted} 
            onNext={handlePDFNext}
          />
        );
        
      case 'patients-view':
        return (
          <PatientsView
            onBack={handlePatientBack}
            onNewPatient={handleNewPatient}
            onEditPatient={handleEditPatient}
            onViewPatient={handleViewPatient}
            onStartReview={handleStartReview}
          />
        );
        
      case 'patient-info':
      case 'medications-review':
      case 'interview':
      case 'recommendations':
      case 'review':
        return <TabsWorkflow onExit={handleTabsWorkflowExit} />;
        
      case 'add-patient':
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Patient</h2>
              <p className="text-gray-600">Patient registration form will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'scheduled-reviews':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Scheduled Reviews</h2>
              <p className="text-gray-600">Calendar view of scheduled HMR reviews will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'medications':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Medication Database</h2>
              <p className="text-gray-600">Drug database and interaction checker will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'clinical-guidelines':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical Guidelines</h2>
              <p className="text-gray-600">Evidence-based clinical protocols and guidelines will be displayed here.</p>
            </div>
          </div>
        );
        
      case 'drug-interactions':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Drug Interaction Checker</h2>
              <p className="text-gray-600">Advanced drug interaction checking tools will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'risk-assessment':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Risk Assessment Tools</h2>
              <p className="text-gray-600">Patient risk calculators and assessment tools will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical Analytics</h2>
              <p className="text-gray-600">Advanced analytics and clinical outcome metrics will be displayed here.</p>
            </div>
          </div>
        );
        
      case 'reports':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports & Export</h2>
              <p className="text-gray-600">Report generation and data export functionality will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings & Profile</h2>
              <p className="text-gray-600">User settings and profile management will be implemented here.</p>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Feature Coming Soon</h2>
              <p className="text-gray-600">This feature is currently under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        currentStep={currentStep}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />
      
      {/* Top Navigation */}
      <TopNavigation
        sidebarCollapsed={sidebarCollapsed}
        currentPatient={currentPatient}
        onNewReview={handleNewReview}
        onScheduleReview={handleScheduleReview}
        onGenerateReport={handleGenerateReports}
        onSearch={handleGlobalSearch}
      />
      
      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'ml-16' : 'ml-72'}
        pt-20
      `}>
        <div className="min-h-[calc(100vh-5rem)]">
          {renderCurrentStep()}
        </div>
      </div>
      
      {/* Debug Component (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <DataDebugger />
        </div>
      )}
    </div>
  );
} 