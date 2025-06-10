import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import EnhancedDashboard from '@/components/clinical/EnhancedDashboard';
import PDFUpload from '@/components/PDFUpload';
import PatientsView from '@/components/PatientsView';
import TabsWorkflow from '@/components/TabsWorkflow';
import DataDebugger from '@/components/DataDebugger';
import Settings from '@/components/Settings';
import { useHMRSelectors, Patient } from '@/store/hmr-store';
import { Calendar } from 'lucide-react';
import PDFGenerationProgress from '@/components/PDFGenerationProgress';

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
  | 'patient-view-detail'
  | 'patient-edit'
  | 'scheduled-reviews'
  | 'medications'
  | 'clinical-guidelines'
  | 'drug-interactions'
  | 'risk-assessment'
  | 'analytics'
  | 'reports'
  | 'settings';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
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
    console.log('MainLayout: Starting new HMR review...');
    
    if (hasUnsavedWork) {
      const confirmNewReview = window.confirm(
        'You have unsaved work. Starting a new review will discard it. Continue?'
      );
      if (!confirmNewReview) {
        console.log('MainLayout: User cancelled new review');
        return;
      }
    }
    
    console.log('MainLayout: Resetting workflow and navigating to upload...');
    resetWorkflow();
    
    // Small delay to ensure reset is complete, then navigate
    setTimeout(() => {
      setCurrentStep('upload');
      console.log('MainLayout: Navigation to upload complete');
    }, 100);
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

  const handleResumeReview = () => {
    if (currentPatient) {
      // Resume the HMR workflow by navigating to patient-info step
      setCurrentStep('patient-info');
    }
  };

  const handleGlobalSearch = (query: string) => {
    console.log('Global search:', query);
    // TODO: Implement global search functionality
  };

  // Patient view handlers
  const handleNewPatient = () => {
    setCurrentStep('add-patient');
  };

  const handleEditPatient = async (patientId: number) => {
    try {
      setLoading(true);
      console.log('Editing patient ID:', patientId);
      
      if (patients.length === 0) {
        console.log('Loading patients from API...');
        await loadPatients();
      }
      
      const patient = patients.find((p: Patient) => p.id === patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      console.log('Found patient for editing:', patient.name);
      setCurrentPatient(patient);
      setCurrentStep('patient-edit');
      
    } catch (error) {
      console.error('Error loading patient for edit:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load patient: ${errorMessage}`);
      alert(`Failed to load patient: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = async (patientId: number) => {
    try {
      setLoading(true);
      console.log('Viewing patient ID:', patientId);
      
      if (patients.length === 0) {
        console.log('Loading patients from API...');
        await loadPatients();
      }
      
      const patient = patients.find((p: Patient) => p.id === patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      console.log('Found patient for viewing:', patient.name);
      setCurrentPatient(patient);
      setCurrentStep('patient-view-detail');
      
    } catch (error) {
      console.error('Error loading patient for view:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load patient: ${errorMessage}`);
      alert(`Failed to load patient: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
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
      setShowProgress(true);
      
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
        setShowProgress(false);
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
      setShowProgress(false);
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Add New Patient</h2>
              <p className="text-gray-600">Patient registration form will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'patient-view-detail':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Patient Details</h2>
                <button
                  onClick={() => setCurrentStep('patients-view')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>← Back to Patients</span>
                </button>
              </div>
              {currentPatient ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Personal Information</h3>
                      <div className="space-y-3">
                        <div><span className="font-medium">Name:</span> {currentPatient.name}</div>
                        <div><span className="font-medium">Date of Birth:</span> {currentPatient.dob}</div>
                        <div><span className="font-medium">Gender:</span> {currentPatient.gender}</div>
                        <div><span className="font-medium">Medicare Number:</span> {currentPatient.medicare_number || 'Not provided'}</div>
                        <div><span className="font-medium">Phone:</span> {currentPatient.phone || 'Not provided'}</div>
                        <div><span className="font-medium">Address:</span> {currentPatient.address || 'Not provided'}</div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Medical Information</h3>
                      <div className="space-y-3">
                        <div><span className="font-medium">Referring Doctor:</span> {currentPatient.referring_doctor}</div>
                        <div><span className="font-medium">Practice:</span> {currentPatient.practice_name || 'Not provided'}</div>
                        <div><span className="font-medium">Known Allergies:</span> {currentPatient.known_allergies || 'None listed'}</div>
                        <div><span className="font-medium">Current Conditions:</span> {currentPatient.current_conditions || 'None listed'}</div>
                        <div><span className="font-medium">Past Medical History:</span> {currentPatient.past_medical_history || 'None listed'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => handleEditPatient(currentPatient.id!)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit Patient
                    </button>
                    <button
                      onClick={() => handleStartReview(currentPatient.id!)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Start HMR Review
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No patient selected.</p>
              )}
            </div>
          </div>
        );
        
      case 'patient-edit':
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Edit Patient</h2>
                <button
                  onClick={() => setCurrentStep('patients-view')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span>← Back to Patients</span>
                </button>
              </div>
              {currentPatient ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <p className="text-gray-600 mb-4">Editing: <span className="font-medium">{currentPatient.name}</span></p>
                  <p className="text-gray-600">Patient edit form will be implemented here.</p>
                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => setCurrentStep('patient-view-detail')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        alert('Save functionality will be implemented');
                        setCurrentStep('patient-view-detail');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No patient selected.</p>
              )}
            </div>
          </div>
        );
        
      case 'scheduled-reviews':
        return (
          <div className="p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-serif">Scheduled Reviews</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      // Google Calendar integration
                      const calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=HMR+Review&dates=20240101T100000Z/20240101T110000Z&details=Home+Medication+Review+appointment&location=Patient+Home';
                      window.open(calendarUrl, '_blank');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Add to Google Calendar</span>
                  </button>
                  <button
                    onClick={() => {
                      // Outlook Calendar integration
                      const outlookUrl = 'https://outlook.live.com/calendar/0/deeplink/compose?subject=HMR+Review&startdt=2024-01-01T10:00:00&enddt=2024-01-01T11:00:00&body=Home+Medication+Review+appointment&location=Patient+Home';
                      window.open(outlookUrl, '_blank');
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Add to Outlook</span>
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar Integration Info */}
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Calendar Integration</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Google Calendar</h4>
                        <p className="text-blue-700 text-sm mb-3">Sync your HMR appointments with Google Calendar for easy scheduling and reminders.</p>
                        <button
                          onClick={() => {
                            alert('Google Calendar sync will be implemented with OAuth integration');
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Connect Google Calendar →
                        </button>
                      </div>
                      
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-2">Microsoft Outlook</h4>
                        <p className="text-orange-700 text-sm mb-3">Integrate with Outlook Calendar for seamless appointment management.</p>
                        <button
                          onClick={() => {
                            alert('Outlook Calendar sync will be implemented with Microsoft Graph API');
                          }}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          Connect Outlook Calendar →
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Schedule */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Quick Schedule</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          const now = new Date();
                          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=HMR+Review&dates=${nextWeek.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(nextWeek.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Home+Medication+Review+appointment`;
                          window.open(calendarUrl, '_blank');
                        }}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">Next Week</div>
                        <div className="text-sm text-gray-600">Schedule for next week</div>
                      </button>
                      
                      <button
                        onClick={() => {
                          const now = new Date();
                          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=HMR+Review&dates=${nextMonth.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(nextMonth.getTime() + 60 * 60 * 1000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=Home+Medication+Review+appointment`;
                          window.open(calendarUrl, '_blank');
                        }}
                        className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900">Next Month</div>
                        <div className="text-sm text-gray-600">Schedule for next month</div>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 font-serif">Upcoming Reviews</h3>
                  <p className="text-gray-600">Scheduled HMR appointments will appear here once calendar integration is set up.</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'medications':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Medication Database</h2>
              <p className="text-gray-600">Drug database and interaction checker will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'clinical-guidelines':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Clinical Guidelines</h2>
              <p className="text-gray-600">Evidence-based clinical protocols and guidelines will be displayed here.</p>
            </div>
          </div>
        );
        
      case 'drug-interactions':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Drug Interaction Checker</h2>
              <p className="text-gray-600">Advanced drug interaction checking tools will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'risk-assessment':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Risk Assessment Tools</h2>
              <p className="text-gray-600">Patient risk calculators and assessment tools will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Clinical Analytics</h2>
              <p className="text-gray-600">Advanced analytics and clinical outcome metrics will be displayed here.</p>
            </div>
          </div>
        );
        
      case 'reports':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-serif">Reports & Export</h2>
              <p className="text-gray-600">Report generation and data export functionality will be implemented here.</p>
            </div>
          </div>
        );
        
      case 'settings':
        return <Settings />;
        
      default:
        return (
          <div className="p-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Feature Coming Soon</h2>
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
        onResumeReview={handleResumeReview}
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

      {/* PDF Generation Progress Animation */}
      <PDFGenerationProgress 
        isVisible={showProgress}
        onComplete={() => setShowProgress(false)}
        duration={15000} // 15 seconds for HMR PDF generation
      />
    </div>
  );
} 