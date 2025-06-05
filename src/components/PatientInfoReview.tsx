'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { Patient } from '@/store/hmr-store';
import { Eye, EyeOff, Copy } from 'lucide-react';

// Improved SimplePDFViewer with better error handling
const SimplePDFViewer = ({ file, onTextSelect, className, rawText, selectedFieldType }: any) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      try {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        setIsLoading(false);
        setError(null);
        return () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Error creating PDF URL:', err);
        setError('Failed to load PDF document. Please try uploading again.');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [file]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg ${className || ''}`}>
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-full bg-red-50 border border-red-200 rounded-lg ${className || ''}`}>
        <div className="text-center p-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-50 border border-gray-200 rounded-lg ${className || ''}`}>
        <div className="text-center p-8">
          <p className="text-gray-600">No PDF loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg ${className || ''}`}>
      {/* PDF Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <h4 className="font-medium text-gray-700">📄 {file?.name}</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowRawText(!showRawText)}
            className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            {showRawText ? 'Show PDF' : 'Show Text'}
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden">
        {showRawText ? (
          <div className="h-full overflow-auto p-4 bg-gray-50 font-mono text-xs">
            <div className="whitespace-pre-wrap">
              {rawText || 'No text extracted yet...'}
            </div>
          </div>
        ) : (
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
            onLoad={() => setError(null)}
            onError={() => setError('PDF failed to load in viewer')}
          />
        )}
      </div>

      {/* Copy Instructions */}
      <div className="p-3 border-t border-gray-200 bg-blue-50">
        <p className="text-xs text-blue-700">
          💡 <strong>To copy text from PDF:</strong> 
          {showRawText ? ' Select text above and copy manually' : ' Select text in the PDF viewer, then copy (Ctrl+C/Cmd+C)'}
        </p>
        {selectedFieldType && (
          <p className="text-xs text-orange-700 mt-1">
            🎯 <strong>Copy Mode:</strong> Text will be copied to "{selectedFieldType}" field
          </p>
        )}
      </div>
    </div>
  );
};

interface PatientInfoReviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function PatientInfoReview({ onNext, onPrevious }: PatientInfoReviewProps) {
  const { 
    currentPatient, 
    setCurrentPatient, 
    extractedData,
    uploadedFile,
    setLoading,
    saveDraft
  } = useHMRSelectors();

  const [showPDFComparison, setShowPDFComparison] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string>('');
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Patient>({
    name: '',
    dob: '',
    gender: '',
    address: '',
    phone: '',
    medicare_number: '',
    referring_doctor: '',
    doctor_email: '',
    practice_name: '',
    practice_address: '',
    practice_phone: '',
    known_allergies: '',
    current_conditions: '',
    past_medical_history: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Load data from current patient or extracted data
  useEffect(() => {
    if (currentPatient) {
      setFormData(currentPatient);
    } else if (extractedData) {
      const newFormData = {
        name: extractedData.name || '',
        dob: extractedData.dob || '',
        gender: extractedData.gender || '',
        medicare_number: extractedData.medicareNumber || '',
        address: extractedData.address || '',
        phone: extractedData.phone || '',
        referring_doctor: extractedData.referringDoctor || '',
        doctor_email: extractedData.doctorEmail || '',
        practice_name: extractedData.practiceName || '',
        practice_address: '',
        practice_phone: '',
        known_allergies: extractedData.allergies || '',
        current_conditions: extractedData.currentConditions || '',
        past_medical_history: extractedData.pastMedicalHistory || ''
      };
      
      setFormData(newFormData);
    }
  }, [currentPatient, extractedData]);

  const handleInputChange = (field: keyof Patient, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Patient name is required';
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.referring_doctor?.trim()) {
      newErrors.referring_doctor = 'Referring doctor is required';
    }
    if (!formData.doctor_email?.trim()) {
      newErrors.doctor_email = 'Doctor email is required for report sending';
    } else if (!/\S+@\S+\.\S+/.test(formData.doctor_email)) {
      newErrors.doctor_email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let response;
      if (formData.id) {
        // Update existing patient
        response = await fetch('/api/patients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        // Create new patient
        response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        const patient = await response.json();
        setCurrentPatient(patient);
        saveDraft();
      }
    } catch (error) {
      console.error('Error saving patient:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    await handleSave();
    if (validateForm()) {
      onNext();
    }
  };

  const handlePDFTextSelect = (selectedText: string) => {
    try {
      if (selectedFieldType) {
        handleInputChange(selectedFieldType as keyof Patient, selectedText);
        setSelectedFieldType('');
      }
    } catch (error) {
      console.error('Error handling PDF text selection:', error);
    }
  };

  const selectFieldForCopy = (fieldType: string) => {
    setSelectedFieldType(fieldType);
  };

  const togglePDFComparison = () => {
    try {
      setPdfError(null);
      setShowPDFComparison(!showPDFComparison);
    } catch (error) {
      console.error('Error toggling PDF comparison:', error);
      setPdfError('Failed to load PDF comparison. Please try refreshing the page.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with PDF Toggle */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Patient Information Review
          </h2>
          {uploadedFile && (
            <button
              onClick={togglePDFComparison}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              {showPDFComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showPDFComparison ? 'Hide' : 'Show'} PDF Comparison</span>
            </button>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Patient Name:</strong> {formData.name || 'Not specified'}</span>
            <span><strong>DOB:</strong> {formData.dob || 'Not specified'}</span>
            <span><strong>Gender:</strong> {formData.gender || 'Not specified'}</span>
            <span><strong>Doctor:</strong> {formData.referring_doctor || 'Not specified'}</span>
          </div>
        </div>
      </div>

      {/* PDF Error Display */}
      {pdfError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{pdfError}</p>
        </div>
      )}

      {/* Field selection guidance */}
      {selectedFieldType && showPDFComparison && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>📋 Copy Mode Active:</strong> Select text in the PDF to copy to the "{selectedFieldType}" field.
            <button 
              onClick={() => setSelectedFieldType('')}
              className="ml-2 text-yellow-600 hover:text-yellow-800 underline"
            >
              Cancel
            </button>
          </p>
        </div>
      )}

      <div className={`grid gap-6 ${showPDFComparison ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* PDF Viewer */}
        {showPDFComparison && uploadedFile && (
          <div className="order-1 lg:order-1">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Original PDF Document</h4>
            <div className="h-[800px]">
              <SimplePDFViewer 
                file={uploadedFile}
                onTextSelect={handlePDFTextSelect}
                rawText={extractedData?.rawText || null}
                selectedFieldType={selectedFieldType}
              />
            </div>
          </div>
        )}

        {/* Patient Form */}
        <div className={`order-2 lg:order-2 ${showPDFComparison ? '' : 'max-w-4xl mx-auto'}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="space-y-6">
              {/* Patient Demographics Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Patient Demographics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter patient's full name"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.dob || ''}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.dob ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medicare Number
                    </label>
                    <input
                      type="text"
                      value={formData.medicare_number || ''}
                      onChange={(e) => handleInputChange('medicare_number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="16-digit Medicare number"
                      maxLength={16}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter patient's address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Referring Doctor Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Referring Doctor Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.referring_doctor || ''}
                      onChange={(e) => handleInputChange('referring_doctor', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.referring_doctor ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter doctor's name"
                    />
                    {errors.referring_doctor && <p className="text-red-500 text-xs mt-1">{errors.referring_doctor}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Practice Name
                    </label>
                    <input
                      type="text"
                      value={formData.practice_name || ''}
                      onChange={(e) => handleInputChange('practice_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter practice name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Doctor Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.doctor_email || ''}
                      onChange={(e) => handleInputChange('doctor_email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.doctor_email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="doctor@example.com"
                    />
                    {errors.doctor_email && <p className="text-red-500 text-xs mt-1">{errors.doctor_email}</p>}
                    <p className="text-xs text-gray-500 mt-1">Required for sending the HMR report</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Practice Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.practice_phone || ''}
                      onChange={(e) => handleInputChange('practice_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Practice phone number"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Practice Address
                    </label>
                    <textarea
                      value={formData.practice_address || ''}
                      onChange={(e) => handleInputChange('practice_address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter practice address"
                    />
                  </div>
                </div>
              </div>

              {/* Medical History Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Medical History
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Known Allergies
                    </label>
                    <textarea
                      value={formData.known_allergies || ''}
                      onChange={(e) => handleInputChange('known_allergies', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="List known allergies (one per line)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter each allergy on a new line</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Medical Conditions
                    </label>
                    <textarea
                      value={formData.current_conditions || ''}
                      onChange={(e) => handleInputChange('current_conditions', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="List current medical conditions (one per line)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter each condition on a new line</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Past Medical History
                    </label>
                    <textarea
                      value={formData.past_medical_history || ''}
                      onChange={(e) => handleInputChange('past_medical_history', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter past medical history with dates"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include dates where relevant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
              <button
                onClick={onPrevious}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to Upload
              </button>

              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={handleContinue}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Continue to Medications Review →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 