'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useHMRSelectors, ClinicalRecommendation } from '@/store/hmr-store';
import { 
  FileText, Mail, Eye, Edit, CheckCircle, AlertTriangle, 
  Clock, Printer, Smartphone, Save, X
} from 'lucide-react';

interface FinalReviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

type ReviewTab = 'summary' | 'preview' | 'template';

export default function FinalReview({ onNext, onPrevious }: FinalReviewProps) {
  const {
    currentPatient,
    currentMedications,
    currentInterviewResponse,
    currentClinicalRecommendations,
    setLoading,
    saveDraft,
    setCurrentStep
  } = useHMRSelectors();

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

  const validateReview = useCallback(() => {
    const issues: string[] = [];
    
    if (!currentPatient?.name) issues.push('Patient name is missing');
    if (!currentPatient?.doctor_email) issues.push('GP email address is not confirmed');
    if (!currentMedications.length) issues.push('No medications documented');
    if (!currentInterviewResponse) issues.push('Interview not completed');
    if (!currentClinicalRecommendations.length) issues.push('No clinical recommendations documented');
    if (currentClinicalRecommendations.some(rec => !rec.issue_identified || !rec.suggested_action)) {
      issues.push('Some recommendations are incomplete');
    }
    if (!currentInterviewResponse?.pharmacist_name) issues.push('Pharmacist name is missing');
    
    setValidationIssues(issues);
  }, [currentPatient, currentMedications, currentInterviewResponse, currentClinicalRecommendations]);

  const generateEmailTemplate = useCallback(() => {
    if (!currentPatient) return;
    
    const pronoun = currentPatient.gender?.toLowerCase() === 'female' ? 'She' : 'He';
    
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
Avishkar Lal
Accredited Pharmacist MRN 8362
Phone: 0490 417 047
Email: avishkarlal01@gmail.com`;
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

Please complete the attached Medication Management Report and forward a copy to avishkarlal01@gmail.com. MBS item number 900 can then be claimed.

Regards,
Avishkar Lal
Accredited Pharmacist MRN 8362
Phone: 0490 417 047
Email: avishkarlal01@gmail.com`;
    }
    
    setEmailTemplate(template);
  }, [currentPatient, currentInterviewResponse, currentClinicalRecommendations]);

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

  const handleGeneratePDF = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-hmr-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: currentPatient?.id,
          reviewData: {
            patient: currentPatient,
            medications: currentMedications,
            interview: currentInterviewResponse,
            recommendations: currentClinicalRecommendations
          },
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
      } else {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        alert(`Failed to generate PDF: ${errorText}`);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

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
    // Save current progress before navigating
    saveDraft();
    
    // Navigate to the appropriate workflow step
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
              <div><strong>BCC:</strong> avishkarlal01@gmail.com (for records)</div>
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

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Validation Checklist */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pre-Export Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Patient information complete and verified', valid: !!currentPatient?.name },
            { label: 'All medications reviewed and confirmed', valid: currentMedications.length > 0 },
            { label: 'Interview sections completed', valid: !!currentInterviewResponse },
            { label: 'At least one clinical recommendation documented', valid: currentClinicalRecommendations.length > 0 },
            { label: 'Patient counselling documented', valid: currentClinicalRecommendations.some(rec => (rec as ClinicalRecommendation & { patient_counselling?: string }).patient_counselling) },
            { label: 'GP email address confirmed', valid: !!currentPatient?.doctor_email }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              {item.valid ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              )}
              <span className={`text-sm ${item.valid ? 'text-gray-700' : 'text-red-600'}`}>
                {item.label}
              </span>
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
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {validationIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
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
            onClick={handleGeneratePDF}
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
          { key: 'template', label: 'Email Template', icon: Mail }
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
        {activeTab === 'template' && renderTemplateTab()}
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
          {activeTab === 'template' ? (
            <button
              onClick={onNext}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Complete Workflow →
            </button>
          ) : (
            <button
              onClick={() => {
                const tabs: ReviewTab[] = ['summary', 'preview', 'template'];
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
    </div>
  );
} 