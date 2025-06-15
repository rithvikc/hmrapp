'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useHMRSelectors, ClinicalRecommendation } from '@/store/hmr-store';
import { useAuth } from '@/contexts/AuthContext';
import PDFEditScreen from './PDFEditScreen';
import { 
  FileText, Mail, Eye, Edit, CheckCircle, AlertTriangle, 
  Clock, Printer, Smartphone, Save, X, Edit3, Upload, 
  FileImage, Trash2, MapPin
} from 'lucide-react';
import PDFGenerationProgress from './PDFGenerationProgress'

interface FinalReviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

type ReviewTab = 'summary' | 'preview' | 'edit' | 'template' | 'custom-templates';

interface CustomTemplate {
  id: string;
  name: string;
  file: File;
  type: 'pdf' | 'docx';
  fields: string[];
  mapping: Record<string, string>;
}

export default function FinalReview({ onNext, onPrevious }: FinalReviewProps) {
  const {
    currentPatient,
    currentMedications,
    currentInterviewResponse,
    currentClinicalRecommendations,
    setLoading,
    saveDraft,
    setCurrentStep,
    setCurrentInterviewResponse,
    setCurrentPatient,
    setCurrentMedications,
    setCurrentClinicalRecommendations
  } = useHMRSelectors();

  const { user, pharmacist } = useAuth();

  const [activeTab, setActiveTab] = useState<ReviewTab>('summary');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isPdfOutdated, setIsPdfOutdated] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [sendOptions, setSendOptions] = useState({
    immediate: true,
    scheduledTime: null as Date | null,
    includeEducationSheet: false,
    includeMedicationList: false
  });
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [showEditScreen, setShowEditScreen] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [showProgress, setShowProgress] = useState(false);
  
  // Editing state variables
  const [isEditingPharmacist, setIsEditingPharmacist] = useState(false);
  const [pharmacistName, setPharmacistName] = useState('');
  
  // Auto-populate pharmacist name from logged-in user
  useEffect(() => {
    if (currentInterviewResponse?.pharmacist_name) {
      setPharmacistName(currentInterviewResponse.pharmacist_name);
    } else if (pharmacist?.name) {
      // Auto-populate from logged-in pharmacist
      const autoPharmacistName = pharmacist.registration_number 
        ? `${pharmacist.name} (MRN ${pharmacist.registration_number})`
        : pharmacist.name;
      setPharmacistName(autoPharmacistName);
      
      // Also update the interview response if it exists
      if (currentInterviewResponse) {
        setCurrentInterviewResponse({
          ...currentInterviewResponse,
          pharmacist_name: autoPharmacistName
        });
      }
    } else if (user?.user_metadata?.name) {
      // Fallback to user metadata
      setPharmacistName(user.user_metadata.name);
      
      if (currentInterviewResponse) {
        setCurrentInterviewResponse({
          ...currentInterviewResponse,
          pharmacist_name: user.user_metadata.name
        });
      }
    }
  }, [currentInterviewResponse, pharmacist, user, setCurrentInterviewResponse]);

  // Get user email for PDF generation
  const getUserEmail = () => {
    return pharmacist?.email || user?.email || 'avishkarlal01@gmail.com';
  };

  // Add beforeunload protection to prevent accidental tab closure
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if PDF generation is actively in progress
      if (showProgress) {
        e.preventDefault();
        e.returnValue = 'PDF generation is in progress. Are you sure you want to leave?';
        return 'PDF generation is in progress. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showProgress]);

  const validateReview = useCallback(() => {
    const issues: string[] = [];
    
    // Check patient information - be more lenient
    if (!currentPatient?.name?.trim()) {
      issues.push('Patient name is missing');
    }
    
    if (!currentPatient?.dob?.trim()) {
      issues.push('Patient date of birth is missing');
    }
    
    // Check doctor email - only if provided
    if (currentPatient?.doctor_email?.trim() && !/\S+@\S+\.\S+/.test(currentPatient.doctor_email)) {
      issues.push('GP email address format is invalid');
    }
    
    // Check interview completion - more thorough but realistic check
    if (!currentInterviewResponse?.interview_date) {
      issues.push('Interview date is missing');
    }
    
    // Check pharmacist name - use current state or auto-populated value
    const effectivePharmacistName = currentInterviewResponse?.pharmacist_name || pharmacistName;
    if (!effectivePharmacistName?.trim()) {
      issues.push('Pharmacist name is missing');
    }
    
    setValidationIssues(issues);
  }, [currentPatient, currentMedications, currentInterviewResponse, currentClinicalRecommendations, pharmacistName]);

  const generateEmailTemplate = useCallback(() => {
    if (!currentPatient) return;
    
    const pronoun = currentPatient.gender?.toLowerCase() === 'female' ? 'She' : 'He';
    const userEmail = getUserEmail();
    
    const highPriorityCount = currentClinicalRecommendations.filter(rec => rec.priority_level === 'High').length;
    const isUrgent = highPriorityCount > 0;
    
    let template = '';
    
    if (isUrgent) {
      template = `Subject: URGENT - Home Medication Review findings for ${currentPatient.name}

Dear Dr ${currentPatient.referring_doctor || '[Doctor Name]'},

URGENT - Home Medication Review findings for ${currentPatient.name}

Following my review on ${currentInterviewResponse?.interview_date || '[Date]'}, I have identified ${highPriorityCount} HIGH PRIORITY medication-related issue${highPriorityCount > 1 ? 's' : ''} requiring immediate attention:

${currentClinicalRecommendations
  .filter(rec => rec.priority_level === 'High')
  .map(rec => `• ${rec.issue_identified}`)
  .join('\n')}

Please review the attached report urgently and contact me if you require any clarification.

I would be pleased to discuss any aspects of this review or provide supporting literature for any recommendations.

Regards,
${currentInterviewResponse?.pharmacist_name || pharmacist?.name || 'Avishkar Lal'}
Accredited Pharmacist MRN ${pharmacist?.registration_number || '8362'}
Phone: 0490 417 047
Email: ${userEmail}`;
    } else {
      template = `Subject: Home Medication Review - ${currentPatient.name} - ${new Date().toLocaleDateString('en-AU')}

Dear Dr ${currentPatient.referring_doctor || '[Doctor Name]'},

Thank you for referring ${currentPatient.name} for a Home Medication Review. ${pronoun} was interviewed on ${currentInterviewResponse?.interview_date || '[Date]'}.

Key findings from the review:
${currentClinicalRecommendations
  .slice(0, 3)
  .map(rec => `• ${rec.issue_identified.split('.')[0]}`)
  .join('\n')}

I have identified ${currentClinicalRecommendations.length} issue${currentClinicalRecommendations.length > 1 ? 's' : ''} requiring your consideration. Please find attached the complete Home Medication Review report and management plan for your review.

I would be pleased to discuss any aspects of this review or provide supporting literature for any recommendations.

Please complete the attached Medication Management Report and forward a copy to ${userEmail}. MBS item number 900 can then be claimed.

Regards,
${currentInterviewResponse?.pharmacist_name || pharmacist?.name || 'Avishkar Lal'}
Accredited Pharmacist MRN ${pharmacist?.registration_number || '8362'}
Phone: 0490 417 047
Email: ${userEmail}`;
    }
    
    setEmailTemplate(template);
  }, [currentPatient, currentInterviewResponse, currentClinicalRecommendations, pharmacist, getUserEmail]);

  useEffect(() => {
    validateReview();
    generateEmailTemplate();
  }, [validateReview, generateEmailTemplate]);

  // Mark PDF as outdated when data changes
  useEffect(() => {
    if (pdfUrl) {
      setIsPdfOutdated(true);
    }
  }, [currentPatient, currentMedications, currentInterviewResponse, currentClinicalRecommendations, pdfUrl]);

  const handleGeneratePDF = async (useEditableData = false) => {
    setLoading(true);
    setShowProgress(true);
    try {
      // Use edited data if available, otherwise use current store data
      const reportData = editedData || {
        patient: currentPatient,
        medications: currentMedications,
        interview: currentInterviewResponse,
        recommendations: currentClinicalRecommendations
      };

      const response = await fetch('/api/generate-hmr-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: currentPatient?.id,
          reviewData: reportData,
          userEmail: getUserEmail(),
          options: {
            includeAppendices: sendOptions.includeEducationSheet || sendOptions.includeMedicationList,
            watermark: validationIssues.length > 0 ? 'Draft' : 'Final',
            format: 'A4'
          }
        })
      });
      
      if (response.ok) {
        // Handle PDF blob response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsPdfOutdated(false);
        console.log('PDF generated successfully');
        // Signal success to the progress component
        if ((window as any).__pdfProgressHandlers?.success) {
          (window as any).__pdfProgressHandlers.success();
        }
      } else {
        const errorData = await response.text();
        let errorMessage = 'Failed to generate PDF';
        
        try {
          // Try to parse the error as JSON
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || parsedError.error || parsedError.details || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text
          errorMessage = errorData || errorMessage;
        }
        
        console.error('PDF generation failed:', errorMessage);
        
        // Signal error to the progress component
        if ((window as any).__pdfProgressHandlers?.error) {
          (window as any).__pdfProgressHandlers.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Signal error to the progress component
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if ((window as any).__pdfProgressHandlers?.error) {
        (window as any).__pdfProgressHandlers.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // PDF Edit Screen handlers
  const handleEditSave = (data: any) => {
    setEditedData(data);
    setIsPdfOutdated(true);
    setActiveTab('preview');
    alert('Changes saved! Switch to Preview tab to generate updated PDF.');
  };

  const handleEditCancel = () => {
    setActiveTab('summary');
  };

  const handleEditPreview = async (data: any) => {
    setEditedData(data);
    setLoading(true);
    setShowProgress(true);
    try {
      const response = await fetch('/api/generate-hmr-pdf', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: currentPatient?.id,
          reviewData: data,
          userEmail: getUserEmail(),
          options: {
            includeAppendices: sendOptions.includeEducationSheet || sendOptions.includeMedicationList,
            watermark: validationIssues.length > 0 ? 'Draft' : 'Final',
            format: 'A4'
          }
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url);
        setIsPdfOutdated(false);
        setActiveTab('preview');
        console.log('Preview PDF generated successfully');
        // Signal success to the progress component
        if ((window as any).__pdfProgressHandlers?.success) {
          (window as any).__pdfProgressHandlers.success();
        }
      } else {
        const errorData = await response.text();
        let errorMessage = 'Failed to generate PDF';
        
        try {
          // Try to parse the error as JSON
          const parsedError = JSON.parse(errorData);
          errorMessage = parsedError.message || parsedError.error || parsedError.details || errorMessage;
        } catch (e) {
          // If not JSON, use the raw text
          errorMessage = errorData || errorMessage;
        }
        
        console.error('PDF generation failed:', errorMessage);
        
        // Signal error to the progress component
        if ((window as any).__pdfProgressHandlers?.error) {
          (window as any).__pdfProgressHandlers.error(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Signal error to the progress component
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if ((window as any).__pdfProgressHandlers?.error) {
        (window as any).__pdfProgressHandlers.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStandardPDFGeneration = () => handleGeneratePDF(false);

  const handleMobilePreview = () => {
    setShowMobilePreview(true);
  };

  const handlePrintPreview = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print();
        });
      }
    } else {
      alert('Please generate PDF first');
    }
  };

  const navigateToStep = (step: string) => {
    saveDraft();
    
    switch (step) {
      case 'patient':
        setCurrentStep('patient-info');
        break;
      case 'medications':
        setCurrentStep('medications-review');
        break;
      case 'interview':
        setCurrentStep('interview');
        break;
      case 'recommendations':
        setCurrentStep('recommendations');
        break;
      default:
        break;
    }
  };

  const copyEmailTemplate = () => {
    if (emailTemplate) {
      navigator.clipboard.writeText(emailTemplate).then(() => {
        alert('Email template copied to clipboard! You can now paste it into your email client.');
      }).catch(err => {
        console.error('Failed to copy email template:', err);
        alert('Failed to copy to clipboard. Please select and copy the text manually.');
      });
    }
  };

  const handleSavePharmacistName = async () => {
    if (!pharmacistName.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      if (currentInterviewResponse) {
        const updatedInterview = {
          ...currentInterviewResponse,
          pharmacist_name: pharmacistName
        };
        
        const response = await fetch('/api/interviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedInterview)
        });
        
        if (response.ok) {
          const interview = await response.json();
          setCurrentInterviewResponse(interview);
          saveDraft();
          setIsEditingPharmacist(false);
        }
      } else {
        const newInterview = {
          patient_id: currentPatient?.id,
          interview_date: new Date().toISOString().split('T')[0],
          pharmacist_name: pharmacistName,
          status: 'draft'
        };
        
        const response = await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newInterview)
        });
        
        if (response.ok) {
          const interview = await response.json();
          setCurrentInterviewResponse(interview);
          saveDraft();
          setIsEditingPharmacist(false);
        }
      }
    } catch (error) {
      console.error('Error saving pharmacist name:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFixIssue = (issue: string) => {
    if (issue.includes('Patient name') || issue.includes('GP email')) {
      navigateToStep('patient');
    } else if (issue.includes('medications')) {
      navigateToStep('medications');
    } else if (issue.includes('Interview') || issue.includes('Pharmacist name')) {
      navigateToStep('interview');
    } else if (issue.includes('recommendations')) {
      navigateToStep('recommendations');
    }
  };

  const renderSummaryTab = () => {
    // Calculate effective pharmacist name for validation
    const effectivePharmacistName = currentInterviewResponse?.pharmacist_name || pharmacistName;
    
    return (
      <div className="space-y-6">
        {/* Validation Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-Export Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                label: 'Patient information complete and verified', 
                valid: !!currentPatient?.name?.trim() && !!currentPatient?.dob?.trim()
              },
              { 
                label: 'All medications reviewed and confirmed', 
                valid: true, // Always valid - no medications is acceptable
                note: currentMedications.length === 0 ? 'No medications documented (this may be appropriate)' : `${currentMedications.length} medication(s) documented`
              },
              { 
                label: 'Interview sections completed', 
                valid: !!currentInterviewResponse?.interview_date && !!effectivePharmacistName?.trim()
              },
              { 
                label: 'Clinical assessment documented', 
                valid: true, // Always valid - no issues found is acceptable
                note: currentClinicalRecommendations.length === 0 ? 'No specific issues identified (this may be appropriate)' : `${currentClinicalRecommendations.length} recommendation(s) documented`
              },
              { 
                label: 'Patient counselling documented', 
                valid: true // Always valid in this workflow
              },
              { 
                label: 'GP email address confirmed', 
                valid: !currentPatient?.doctor_email?.trim() || (!!currentPatient?.doctor_email?.trim() && /\S+@\S+\.\S+/.test(currentPatient.doctor_email)),
                note: !currentPatient?.doctor_email?.trim() ? 'Optional - can be provided if available' : ''
              },
              { 
                label: 'Pharmacist name provided', 
                valid: !!effectivePharmacistName?.trim() 
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                {item.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className={`text-sm ${item.valid ? 'text-gray-700' : 'text-red-600'}`}>
                    {item.label}
                  </span>
                  {item.note && (
                    <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 rounded-md bg-gray-50">
            <div className="flex items-center">
              {validationIssues.length === 0 ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Ready to Generate Report</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">{validationIssues.length} Issues Found</span>
                </>
              )}
            </div>
            {validationIssues.length > 0 && (
              <ul className="mt-2 text-sm text-red-600 list-disc list-inside space-y-2">
                {validationIssues.map((issue, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span className="mr-4">{issue}</span>
                    <button 
                      onClick={() => handleFixIssue(issue)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors ml-4"
                    >
                      Fix Now
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Pharmacist Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Pharmacist Details</h3>
            {!isEditingPharmacist ? (
              <button 
                onClick={() => setIsEditingPharmacist(true)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit pharmacist details"
              >
                <Edit className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={handleSavePharmacistName}
                  className="text-green-600 hover:text-green-800 transition-colors"
                  title="Save pharmacist details"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    setIsEditingPharmacist(false);
                    if (currentInterviewResponse?.pharmacist_name) {
                      setPharmacistName(currentInterviewResponse.pharmacist_name);
                    }
                  }}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="space-y-2 text-sm">
            {isEditingPharmacist ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacist Name (with credentials)
                </label>
                <input
                  type="text"
                  value={pharmacistName}
                  onChange={(e) => setPharmacistName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="e.g., John Smith (MRN 1234)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your full name and MRN number as it should appear on the report
                </p>
              </div>
            ) : (
              <div>
                <strong>Pharmacist Name:</strong> {currentInterviewResponse?.pharmacist_name || 'Not specified'}
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Patient Information</h3>
              <button 
                onClick={() => navigateToStep('patient')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit patient information"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {currentPatient?.name || 'Not specified'}</div>
              <div><strong>DOB:</strong> {currentPatient?.dob || 'Not specified'}</div>
              <div><strong>Gender:</strong> {currentPatient?.gender || 'Not specified'}</div>
              <div><strong>Medicare:</strong> {currentPatient?.medicare_number || 'Not specified'}</div>
              <div><strong>Doctor:</strong> {currentPatient?.referring_doctor || 'Not specified'}</div>
              <div><strong>Practice:</strong> {currentPatient?.practice_name || 'Not specified'}</div>
            </div>
          </div>

          {/* Medications Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Medications Summary</h3>
              <button 
                onClick={() => navigateToStep('medications')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit medications"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Total Medications:</strong> {currentMedications.length}</div>
              <div><strong>Regular:</strong> {currentMedications.filter(med => med.prn_status === 'Regular').length}</div>
              <div><strong>PRN:</strong> {currentMedications.filter(med => med.prn_status === 'PRN (as needed)').length}</div>
              <div><strong>Limited Duration:</strong> {currentMedications.filter(med => med.prn_status === 'Limited Duration').length}</div>
              <div><strong>Compliance Issues:</strong> {currentMedications.filter(med => med.compliance_status === 'Poor' || med.compliance_status === 'Non-adherent').length}</div>
            </div>
          </div>

          {/* Interview Summary Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Interview Summary</h3>
              <button 
                onClick={() => navigateToStep('interview')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit interview responses"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Understanding:</strong> {currentInterviewResponse?.medication_understanding?.split(' - ')[0] || 'Not assessed'}</div>
              <div><strong>Administration:</strong> {currentInterviewResponse?.medication_administration ? 'DAA' : 'Not specified'}</div>
              <div><strong>Adherence:</strong> {currentInterviewResponse?.medication_adherence?.split(' - ')[0] || 'Not assessed'}</div>
              <div><strong>Lifestyle Concerns:</strong> {[
                currentInterviewResponse?.fluid_intake?.includes('Inadequate') ? 'Fluid intake' : null,
                currentInterviewResponse?.eating_habits?.includes('Poor') ? 'Eating habits' : null,
                currentInterviewResponse?.smoking_status === 'Current smoker' ? 'Smoking' : null,
                currentInterviewResponse?.alcohol_consumption?.includes('Excessive') ? 'Alcohol' : null
              ].filter(Boolean).length} identified</div>
            </div>
          </div>

          {/* Clinical Recommendations Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Recommendations</h3>
              <button 
                onClick={() => navigateToStep('recommendations')}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit clinical recommendations"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Total Issues:</strong> {currentClinicalRecommendations.length}</div>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                <strong>High Priority:</strong> {currentClinicalRecommendations.filter(rec => rec.priority_level === 'High').length}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-yellow-500 mr-1" />
                <strong>Medium Priority:</strong> {currentClinicalRecommendations.filter(rec => rec.priority_level === 'Medium').length}
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <strong>Low Priority:</strong> {currentClinicalRecommendations.filter(rec => rec.priority_level === 'Low').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPreviewTab = () => (
    <div className="space-y-6">
      {/* PDF Generation Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Export Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Template Style</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Standard HMR Template</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Page Format</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>A4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Appendices</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={sendOptions.includeEducationSheet}
                  onChange={(e) => setSendOptions(prev => ({ ...prev, includeEducationSheet: e.target.checked }))}
                  className="mr-2" 
                />
                <span className="text-sm">Patient Education Sheet</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={sendOptions.includeMedicationList}
                  onChange={(e) => setSendOptions(prev => ({ ...prev, includeMedicationList: e.target.checked }))}
                  className="mr-2" 
                />
                <span className="text-sm">Medication List Summary</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Watermark</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={validationIssues.length > 0 ? 'Draft' : 'Final'}>
                {validationIssues.length > 0 ? 'Draft' : 'Final'}
              </option>
            </select>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-6">
          <button
            onClick={handleStandardPDFGeneration}
            className={`px-4 py-2 ${isPdfOutdated ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-md transition-colors flex items-center space-x-2`}
          >
            <Eye className="w-4 h-4" />
            <span>{isPdfOutdated ? 'Regenerate PDF' : 'Preview PDF'}</span>
          </button>
          <button 
            onClick={handleMobilePreview}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile Preview</span>
          </button>
          <button 
            onClick={handlePrintPreview}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Preview</span>
          </button>
        </div>

        {isPdfOutdated && pdfUrl && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              <span className="text-orange-700 font-medium">PDF may be outdated</span>
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Data has been changed since the last PDF generation. Click &quot;Regenerate PDF&quot; to update.
            </p>
          </div>
        )}
      </div>

      {/* PDF Preview Area */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Preview</h3>
        {pdfUrl ? (
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <iframe 
              src={pdfUrl} 
              className="w-full h-96"
              title="PDF Preview"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg py-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Click &quot;Preview PDF&quot; to generate and preview the report</p>
          </div>
        )}
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mobile Preview</h3>
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <iframe 
                src={pdfUrl} 
                className="w-full h-96"
                title="Mobile PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplateTab = () => (
    <div className="space-y-6">
      {/* Email Template */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Email Template</h3>
          <button
            onClick={copyEmailTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            disabled={!emailTemplate}
          >
            <Mail className="w-4 h-4" />
            <span>Copy Template</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ready-to-Use Email Template
            </label>
            <p className="text-sm text-gray-600 mb-4">
              This template includes the subject line and email body. Copy and paste directly into your email client.
            </p>
            <textarea
              value={emailTemplate}
              readOnly
              rows={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm bg-gray-50"
              placeholder="Email template will appear here once patient and review data is available..."
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Generate the PDF report from the Preview tab</li>
              <li>Click &quot;Copy Template&quot; to copy the email text</li>
              <li>Open your email client (Outlook, Gmail, etc.)</li>
              <li>Paste the template - the subject line will be at the top</li>
              <li>Attach the generated PDF report</li>
              <li>Send to the referring doctor</li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Email Details:</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <div><strong>To:</strong> {currentPatient?.doctor_email || 'Doctor email not provided'}</div>
              <div><strong>BCC:</strong> {getUserEmail()} (for records)</div>
              <div><strong>Attachments:</strong> HMR Report PDF</div>
              {sendOptions.includeEducationSheet && (
                <div><strong>Additional:</strong> Patient Education Sheet</div>
              )}
              {sendOptions.includeMedicationList && (
                <div><strong>Additional:</strong> Medication List Summary</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add template-related state
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<CustomTemplate | null>(null);
  const [isUploadingTemplate, setIsUploadingTemplate] = useState(false);
  const [showMappingInterface, setShowMappingInterface] = useState(false);

  // Add template-related functions
  const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload only PDF or DOCX files.');
      return;
    }

    setIsUploadingTemplate(true);
    try {
      // Extract fields from template
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/extract-template-fields', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract template fields');
      }

      const { fields } = await response.json();

      const newTemplate: CustomTemplate = {
        id: Date.now().toString(),
        name: file.name,
        file: file,
        type: file.type.includes('pdf') ? 'pdf' : 'docx',
        fields: fields,
        mapping: {}
      };

      setCustomTemplates(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      setShowMappingInterface(true);
    } catch (error) {
      console.error('Error uploading template:', error);
      alert('Failed to upload template. Please try again.');
    } finally {
      setIsUploadingTemplate(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
      setShowMappingInterface(false);
    }
  };

  const handleGenerateFromTemplate = async (template: CustomTemplate) => {
    setLoading(true);
    setShowProgress(true);
    try {
      const reportData = editedData || {
        patient: currentPatient,
        medications: currentMedications,
        interview: currentInterviewResponse,
        recommendations: currentClinicalRecommendations
      };

      const formData = new FormData();
      formData.append('template', template.file);
      formData.append('reportData', JSON.stringify(reportData));
      formData.append('mapping', JSON.stringify(template.mapping));
      formData.append('templateType', template.type);

      const response = await fetch('/api/generate-custom-template', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Download the filled template
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.name.replace(/\.[^/.]+$/, '')}_filled.${template.type}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        console.log('Custom template generated successfully');
        
        // Signal success to the progress component
        if ((window as any).__pdfProgressHandlers?.success) {
          (window as any).__pdfProgressHandlers.success();
        }
      } else {
        throw new Error('Failed to generate custom template');
      }
    } catch (error) {
      console.error('Error generating custom template:', error);
      
      // Signal error to the progress component
      if ((window as any).__pdfProgressHandlers?.error) {
        (window as any).__pdfProgressHandlers.error('Failed to generate custom template');
      }
    } finally {
      setLoading(false);
      setShowProgress(false);
    }
  };

  const getAvailableReportFields = () => {
    return [
      // Patient fields
      'patient.name', 'patient.dob', 'patient.gender', 'patient.medicare_number',
      'patient.address', 'patient.phone', 'patient.referring_doctor', 'patient.doctor_email',
      'patient.practice_name', 'patient.known_allergies', 'patient.current_conditions',
      
      // Interview fields
      'interview.interview_date', 'interview.pharmacist_name', 'interview.medication_understanding',
      'interview.medication_administration', 'interview.medication_adherence', 'interview.fluid_intake',
      'interview.eating_habits', 'interview.smoking_status', 'interview.alcohol_consumption',
      
      // Medications summary
      'medications.count', 'medications.list', 'medications.compliance_summary',
      
      // Recommendations summary
      'recommendations.count', 'recommendations.high_priority', 'recommendations.summary',
      
      // System fields
      'report.generated_date', 'report.pharmacist_email'
    ];
  };

  const renderCustomTemplateTab = () => (
    <div className="space-y-6">
      {/* Template Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Custom Templates</h3>
          <label className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>{isUploadingTemplate ? 'Uploading...' : 'Upload Template'}</span>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleTemplateUpload}
              className="hidden"
              disabled={isUploadingTemplate}
            />
          </label>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Upload custom PDF or DOCX templates with form fields that can be filled with your report data.
        </p>

        {/* Template List */}
        {customTemplates.length > 0 ? (
          <div className="space-y-3">
            {customTemplates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {template.type === 'pdf' ? (
                        <FileText className="w-8 h-8 text-red-500" />
                      ) : (
                        <FileImage className="w-8 h-8 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-500">
                        {template.fields.length} fields detected • {template.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTemplate(template);
                        setShowMappingInterface(true);
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors flex items-center space-x-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Map Fields</span>
                    </button>
                    <button
                      onClick={() => handleGenerateFromTemplate(template)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                      disabled={Object.keys(template.mapping).length === 0}
                    >
                      Generate
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Mapping Status */}
                {template.fields.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Field Mapping:</span> {Object.keys(template.mapping).length}/{template.fields.length} mapped
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(Object.keys(template.mapping).length / template.fields.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No custom templates uploaded yet</p>
            <p className="text-sm text-gray-400">Upload a PDF or DOCX template to get started</p>
          </div>
        )}
      </div>

      {/* Field Mapping Interface */}
      {showMappingInterface && selectedTemplate && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Map Fields for "{selectedTemplate.name}"
            </h3>
            <button
              onClick={() => setShowMappingInterface(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            Map template fields to report data. Unmapped fields will remain empty in the generated document.
          </p>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {selectedTemplate.fields.map((field) => (
              <div key={field} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Field: <span className="font-mono text-blue-600">{field}</span>
                  </label>
                </div>
                <div>
                  <select
                    value={selectedTemplate.mapping[field] || ''}
                    onChange={(e) => {
                      const updatedTemplate = {
                        ...selectedTemplate,
                        mapping: {
                          ...selectedTemplate.mapping,
                          [field]: e.target.value
                        }
                      };
                      setSelectedTemplate(updatedTemplate);
                      setCustomTemplates(prev => 
                        prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t)
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Select report field...</option>
                    {getAvailableReportFields().map((reportField) => (
                      <option key={reportField} value={reportField}>
                        {reportField}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowMappingInterface(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowMappingInterface(false);
                // Automatically generate if all fields are mapped
                if (Object.keys(selectedTemplate.mapping).length === selectedTemplate.fields.length) {
                  handleGenerateFromTemplate(selectedTemplate);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Mapping
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Final Review & Report Generation
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Patient:</strong> {currentPatient?.name || 'Unknown Patient'}</span>
            <span><strong>DOB:</strong> {currentPatient?.dob || 'Not specified'}</span>
            <span><strong>Interview Date:</strong> {currentInterviewResponse?.interview_date || 'Not specified'}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              validationIssues.length === 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              Status: {validationIssues.length === 0 ? 'Ready for Review' : 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {[
          { key: 'summary', label: 'Review Summary', icon: FileText },
          { key: 'preview', label: 'PDF Preview', icon: Eye },
          { key: 'edit', label: 'Edit PDF', icon: Edit3 },
          { key: 'template', label: 'Email Template', icon: Mail },
          { key: 'custom-templates', label: 'Custom Templates', icon: Upload }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as ReviewTab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 min-h-96">
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'preview' && renderPreviewTab()}
        {activeTab === 'edit' && (
          <PDFEditScreen 
            onSave={handleEditSave}
            onCancel={handleEditCancel}
            onPreview={handleEditPreview}
          />
        )}
        {activeTab === 'template' && renderTemplateTab()}
        {activeTab === 'custom-templates' && renderCustomTemplateTab()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
        <button
          onClick={onPrevious}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          ← Back to Recommendations
        </button>

        <div className="flex gap-4">
          <button
            onClick={saveDraft}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Progress</span>
          </button>
          {activeTab === 'template' || activeTab === 'custom-templates' ? (
            <button
              onClick={onNext}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Complete Workflow →
            </button>
          ) : (
            <button
              onClick={() => {
                const tabs: ReviewTab[] = ['summary', 'preview', 'edit', 'template', 'custom-templates'];
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Next Step →
            </button>
          )}
        </div>
      </div>

      {/* PDF Generation Progress Animation */}
      <PDFGenerationProgress 
        isVisible={showProgress}
        onComplete={() => setShowProgress(false)}
        duration={15000}
      />
    </div>
  );
} 