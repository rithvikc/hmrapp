'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useHMRStore } from '@/store/hmr-store';

interface ExtractedData {
  name?: string;
  dob?: string;
  gender?: string;
  medicareNumber?: string;
  address?: string;
  phone?: string;
  referringDoctor?: string;
  doctorEmail?: string;
  currentConditions?: string;
  pastMedicalHistory?: string;
  allergies?: string;
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
    prnStatus: string;
    confidence: number;
  }>;
  pharmacistName?: string;
}

interface PDFUploadProps {
  onDataExtracted: (data: ExtractedData) => void;
  onNext: () => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onDataExtracted, onNext }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [rawExtractedText, setRawExtractedText] = useState<string>('');
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [showRawText, setShowRawText] = useState(false);

  const {
    setUploadedFile,
    setExtractedData: setStoreExtractedData,
    setCurrentPatient,
    setCurrentMedications,
    setCurrentInterviewResponse,
    setLoading,
    setError: setStoreError
  } = useHMRStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      return;
    }

    // Clear any existing data before processing new file
    setExtractedData(null);
    setEditedData(null);
    setStoreExtractedData(null);
    
    setIsProcessing(true);
    setError(null);
    setUploadedFile(file);
    setLoading(true);

    try {
      console.log('📄 Processing new PDF file:', file.name);
      
      // Process PDF with OCR
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/process-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PDF');
      }

      const apiResponse = await response.json();
      console.log('📄 API Response:', apiResponse);
      
      // Store raw extracted text if available
      if (apiResponse.rawText || apiResponse.extractedText) {
        setRawExtractedText(apiResponse.rawText || apiResponse.extractedText || '');
      }
      
      // Extract the actual data from the API response
      const data = apiResponse.data || apiResponse;
      console.log('📄 Extracted Data:', data);
      
      // Ensure medications array exists
      const normalizedData = {
        ...data,
        medications: data.medications || []
      };
      
      console.log('📄 Normalized Data:', normalizedData);
      
      setExtractedData(normalizedData);
      setEditedData(normalizedData);
      setStoreExtractedData(normalizedData);
      onDataExtracted(normalizedData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process PDF';
      console.error('📄 PDF Processing Error:', error);
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setIsProcessing(false);
      setLoading(false);
    }
  }, [setUploadedFile, setStoreExtractedData, setLoading, setStoreError, onDataExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleSave = () => {
    if (editedData) {
      setExtractedData(editedData);
      setStoreExtractedData(editedData);
      onDataExtracted(editedData);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedData(extractedData);
    setEditMode(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditedData((prev: ExtractedData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleMedicationChange = (index: number, field: string, value: string | number) => {
    setEditedData((prev: ExtractedData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: (prev.medications || []).map((med, i) => 
          i === index ? { ...med, [field]: value } : med
        )
      };
    });
  };

  const addMedication = () => {
    setEditedData((prev: ExtractedData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: [
          ...(prev.medications || []),
          {
            name: '',
            dosage: '',
            frequency: '',
            prnStatus: 'Regular',
            confidence: 1.0
          }
        ]
      };
    });
  };

  const removeMedication = (index: number) => {
    setEditedData((prev: ExtractedData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        medications: (prev.medications || []).filter((_, i) => i !== index)
      };
    });
  };

  const validateData = useCallback(() => {
    if (!extractedData) return [];
    
    const newIssues: string[] = [];
    
    if (!extractedData.name) newIssues.push('Patient name is missing');
    if (!extractedData.dob) newIssues.push('Date of birth is missing');
    if (!extractedData.gender) newIssues.push('Gender is missing');
    if (!extractedData.referringDoctor) newIssues.push('Referring doctor is missing');
    if (!extractedData.pharmacistName) newIssues.push('Pharmacist name is missing');
    if (!extractedData.medications || extractedData.medications.length === 0) {
      newIssues.push('No medications detected');
    }
    
    setIssues(newIssues);
    return newIssues;
  }, [extractedData]);

  useEffect(() => {
    if (extractedData) {
      validateData();
    }
  }, [extractedData, validateData]);

  const proceedToNext = () => {
    if (extractedData) {
      // Set patient data in store
      setCurrentPatient({
        name: extractedData.name || '',
        dob: extractedData.dob || '',
        gender: extractedData.gender || '',
        medicare_number: extractedData.medicareNumber || '',
        address: extractedData.address || '',
        phone: extractedData.phone || '',
        referring_doctor: extractedData.referringDoctor || '',
        doctor_email: extractedData.doctorEmail || '',
        practice_name: '',
        known_allergies: extractedData.allergies || '',
        current_conditions: extractedData.currentConditions || '',
        past_medical_history: extractedData.pastMedicalHistory || ''
      });

      // Set medications in store
      const medications = (extractedData.medications || []).map((med, index) => ({
        id: index + 1,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        prn_status: med.prnStatus as 'Regular' | 'PRN (as needed)' | 'Limited Duration' | 'Stopped',
        compliance_status: 'Good' as const,
        route: 'Oral' as const
      }));

      setCurrentMedications(medications);
      
      // Create initial interview response with pharmacist name if provided
      if (extractedData.pharmacistName) {
        setCurrentInterviewResponse({
          patient_id: undefined,  // Will be set after patient is saved
          interview_date: new Date().toISOString().split('T')[0],
          pharmacist_name: extractedData.pharmacistName,
          status: 'draft'
        });
      }
      
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Referral Document
        </h2>
        <p className="text-gray-600">
          Upload the PDF referral document to extract patient information and medications
        </p>
      </div>

      {/* Upload Area */}
      {!extractedData && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Processing PDF...
              </p>
              <p className="text-gray-600">
                Extracting patient information and medications
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop the PDF here' : 'Upload PDF Referral'}
              </p>
              <p className="text-gray-600 mb-4">
                Drag & drop a PDF file here, or click to select
              </p>
              <div className="text-sm text-gray-500">
                Supported: PDF files only
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Processing Error
              </h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Extracted Data Preview */}
      {extractedData && (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">
                  Extracted Information
                </h3>
              </div>
              <div className="flex space-x-2">
                {!editMode ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Raw Text Preview Toggle */}
            {rawExtractedText && (
              <div className="mb-6">
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {showRawText ? 'Hide' : 'Show'} Raw Extracted Text
                  </span>
                  <span className="text-xs text-gray-500">({rawExtractedText.length} characters)</span>
                </button>
                
                {showRawText && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-900 mb-2">Raw OCR Text:</h5>
                    <div className="max-h-64 overflow-y-auto">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                        {rawExtractedText}
                      </pre>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This is the raw text extracted from your PDF. Review it to ensure the mapped fields below are correct.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Validation Issues - Enhanced */}
            {issues.length > 0 && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center mb-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                  <h4 className="text-md font-semibold text-yellow-800">
                    {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Found - Please Review & Correct
                  </h4>
                </div>
                <div className="mb-3 text-sm text-yellow-700">
                  The following fields need attention. Click "Edit" to correct them or review the raw text above to verify the extraction.
                </div>
                <ul className="space-y-2">
                  {issues.map((issue, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-sm text-yellow-700 mr-4">• {issue}</span>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors ml-4"
                      >
                        Fix Now
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Field Mapping Guidance */}
            {editMode && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-semibold text-blue-900">Field Mapping Tips</h4>
                    <ul className="text-sm text-blue-800 mt-2 space-y-1">
                      <li>• Review the raw text above to find missing information</li>
                      <li>• Check that medication names don't include dosage instructions</li>
                      <li>• Verify that doctor names are complete and correctly formatted</li>
                      <li>• Ensure dates are in the correct format (YYYY-MM-DD)</li>
                      <li>• Separate multiple medications if they were combined</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Patient Information */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedData?.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">{extractedData.name || 'Not detected'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  {editMode ? (
                    <input
                      type="date"
                      value={editedData?.dob || ''}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">{extractedData.dob || 'Not detected'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  {editMode ? (
                    <select
                      value={editedData?.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">{extractedData.gender || 'Not detected'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referring Doctor
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedData?.referringDoctor || ''}
                      onChange={(e) => handleInputChange('referringDoctor', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-2 bg-gray-50 rounded">{extractedData.referringDoctor || 'Not detected'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Pharmacist Information - NEW */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Pharmacist Information</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pharmacist Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedData?.pharmacistName || ''}
                    onChange={(e) => handleInputChange('pharmacistName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                    style={{ color: '#1f2937' }}
                    placeholder="e.g., Jane Smith (MRN 1234)"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{extractedData.pharmacistName || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Medications ({editMode ? editedData?.medications?.length || 0 : extractedData.medications?.length || 0})
                </h4>
                <div className="flex items-center space-x-3">
                  {!editMode && extractedData.medications && extractedData.medications.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Confidence: {Math.round((extractedData.medications.reduce((acc, med) => acc + (med.confidence || 0), 0) / extractedData.medications.length) * 100)}% avg
                    </div>
                  )}
                  {editMode && (
                    <button
                      onClick={addMedication}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Add Medication
                    </button>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Review each medication carefully:</strong> Ensure names are correct, dosages are separated from instructions, 
                    and frequencies are properly formatted. Check the raw text above if you need to find missing medications.
                  </p>
                </div>
              )}

              {(editMode ? editedData?.medications : extractedData.medications)?.map((medication: {
                name: string;
                dosage: string;
                frequency: string;
                prnStatus: string;
                confidence: number;
              }, index: number) => (
                <div key={index} className={`mb-4 p-4 border rounded-lg ${
                  medication.confidence && medication.confidence < 0.7 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                }`}>
                  {/* Confidence Indicator */}
                  {!editMode && medication.confidence && (
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-700">Medication #{index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          medication.confidence >= 0.8 ? 'bg-green-100 text-green-800' :
                          medication.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {Math.round(medication.confidence * 100)}% confidence
                        </span>
                        {medication.confidence < 0.7 && (
                          <span className="text-xs text-orange-600">⚠ Needs review</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medication Name {medication.confidence && medication.confidence < 0.7 && <span className="text-orange-500">*</span>}
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={medication.name || ''}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                          style={{ color: '#1f2937' }}
                          placeholder="Enter medication name"
                        />
                      ) : (
                        <p className={`p-2 rounded ${medication.confidence && medication.confidence < 0.7 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                          {medication.name || 'Not detected'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={medication.dosage || ''}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                          style={{ color: '#1f2937' }}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{medication.dosage || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={medication.frequency || ''}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                          style={{ color: '#1f2937' }}
                        />
                      ) : (
                        <p className="p-2 bg-gray-50 rounded">{medication.frequency || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      {editMode ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={medication.prnStatus || 'Regular'}
                            onChange={(e) => handleMedicationChange(index, 'prnStatus', e.target.value)}
                            className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-gray-900 bg-white"
                            style={{ color: '#1f2937' }}
                          >
                            <option value="Regular">Regular</option>
                            <option value="PRN (as needed)">PRN (as needed)</option>
                            <option value="Limited Duration">Limited Duration</option>
                          </select>
                          <button
                            onClick={() => removeMedication(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            medication.prnStatus === 'PRN' ? 'bg-yellow-100 text-yellow-800' :
                            medication.prnStatus === 'Limited Duration' ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {medication.prnStatus || 'Regular'}
                          </span>
                          {medication.confidence && (
                            <span className="text-xs text-gray-500">
                              {Math.round(medication.confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setExtractedData(null);
                  setRawExtractedText('');
                  setEditMode(false);
                  setIssues([]);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Upload Different File
              </button>
              
              <div className="flex items-center space-x-4">
                {/* Validation Status */}
                <div className="text-sm">
                  {editMode ? (
                    <span className="text-amber-600">⚠ Save changes before continuing</span>
                  ) : issues.length > 0 ? (
                    <span className="text-red-600">❌ {issues.length} issue(s) need fixing</span>
                  ) : (
                    <span className="text-green-600">✅ Ready to proceed</span>
                  )}
                </div>
                
                <button
                  onClick={proceedToNext}
                  disabled={!extractedData || editMode || issues.length > 0}
                  className={`px-6 py-2 rounded font-medium transition-colors ${
                    !extractedData || editMode || issues.length > 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {editMode ? 'Save Changes First' : 'Continue to Patient Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFUpload; 