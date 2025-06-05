'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { Medication } from '@/store/hmr-store';
import { Eye, EyeOff, Copy } from 'lucide-react';

interface MedicationsReviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

const FORM_OPTIONS = [
  'Tablet', 'Capsule', 'Liquid', 'Cream', 'Gel', 'Injection', 'Inhaler', 'Spray', 'Drops', 'Patch', 'Other'
];

const ROUTE_OPTIONS = [
  'Oral', 'Topical', 'Inhalation', 'Injection', 'Sublingual', 'Rectal', 'Vaginal', 'Other'
];

const PRN_STATUS_OPTIONS = [
  'Regular', 'PRN (as needed)', 'Limited Duration', 'Stopped'
];

// Simple PDF Viewer fallback for when the main PDFViewer has issues
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

export default function MedicationsReview({ onNext, onPrevious }: MedicationsReviewProps) {
  const { 
    currentPatient,
    currentMedications, 
    setCurrentMedications,
    addMedication,
    updateMedication,
    removeMedication,
    extractedData,
    uploadedFile,
    setLoading,
    saveDraft
  } = useHMRSelectors();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showPDFComparison, setShowPDFComparison] = useState(false);
  const [selectedFieldType, setSelectedFieldType] = useState<string>('');
  const [selectedMedicationIndex, setSelectedMedicationIndex] = useState<number>(-1);

  // Load medications from extracted data if available
  useEffect(() => {
    if (extractedData?.medications && currentMedications.length === 0) {
      const extractedMeds = extractedData.medications.map((med) => ({
        patient_id: currentPatient?.id,
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        prn_status: med.prnStatus as 'Regular' | 'PRN (as needed)' | 'Limited Duration' | 'Stopped',
        strength: '',
        form: undefined,
        route: undefined,
        prescriber: ''
      }));
      setCurrentMedications(extractedMeds);
    }
  }, [extractedData, currentMedications.length, currentPatient?.id, setCurrentMedications]);

  const handleAddMedication = () => {
    const newMedication: Medication = {
      patient_id: currentPatient?.id,
      name: '',
      strength: '',
      form: undefined,
      dosage: '',
      frequency: '',
      route: undefined,
      prn_status: 'Regular',
      prescriber: ''
    };
    addMedication(newMedication);
    setEditingIndex(currentMedications.length);
  };

  const handleUpdateMedication = (index: number, field: keyof Medication, value: string | number) => {
    const updatedMedication = {
      ...currentMedications[index],
      [field]: value
    };
    updateMedication(index, updatedMedication);
  };

  const handleDeleteMedication = (index: number) => {
    if (window.confirm('Are you sure you want to remove this medication?')) {
      removeMedication(index);
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  const handleImportFromPrevious = () => {
    // TODO: Implement import from previous review functionality
    alert('Import from previous review functionality will be implemented');
  };

  const handleSaveMedications = async () => {
    if (!currentPatient?.id) {
      alert('Please save patient information first');
      return;
    }

    setLoading(true);
    try {
      // Save each medication
      for (const medication of currentMedications) {
        if (medication.name.trim()) {
          if (medication.id) {
            // Update existing medication
            await fetch('/api/medications', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...medication,
                patient_id: currentPatient.id
              })
            });
          } else {
            // Create new medication
            await fetch('/api/medications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...medication,
                patient_id: currentPatient.id
              })
            });
          }
        }
      }
      saveDraft();
      alert('Medications saved successfully');
    } catch (error) {
      console.error('Error saving medications:', error);
      alert('Error saving medications');
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF text selection and copying to form fields
  const handlePDFTextSelect = (selectedText: string) => {
    if (!selectedText.trim()) return;

    if (selectedFieldType && selectedMedicationIndex >= 0) {
      // Copy to specific medication field
      handleUpdateMedication(selectedMedicationIndex, selectedFieldType as keyof Medication, selectedText.trim());
      setSelectedFieldType('');
      setSelectedMedicationIndex(-1);
    } else {
      // Copy to clipboard and show toast
      navigator.clipboard?.writeText(selectedText.trim());
    }
  };

  // Set copy mode for specific field
  const setCopyMode = (fieldType: string, medicationIndex: number) => {
    setSelectedFieldType(fieldType);
    setSelectedMedicationIndex(medicationIndex);
  };

  const getRegularMedications = () => currentMedications.filter(med => med.prn_status === 'Regular');
  const getPRNMedications = () => currentMedications.filter(med => med.prn_status === 'PRN (as needed)');
  const getLimitedDurationMedications = () => currentMedications.filter(med => med.prn_status === 'Limited Duration');

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Medications Review
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Patient:</strong> {currentPatient?.name || 'Not specified'}</span>
            <span><strong>Total Medications:</strong> {currentMedications.length}</span>
            <span><strong>Regular:</strong> {getRegularMedications().length}</span>
            <span><strong>PRN:</strong> {getPRNMedications().length}</span>
            <span><strong>Limited Duration:</strong> {getLimitedDurationMedications().length}</span>
          </div>
        </div>
      </div>

      {/* PDF Comparison Toggle */}
      {uploadedFile && (
        <div className="mb-4">
          <button
            onClick={() => setShowPDFComparison(!showPDFComparison)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            {showPDFComparison ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPDFComparison ? 'Hide' : 'Show'} PDF Cross-Check
          </button>
        </div>
      )}

      {/* Copy Mode Indicator */}
      {selectedFieldType && showPDFComparison && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>📋 Copy Mode Active:</strong> Select text in the PDF to copy to "{selectedFieldType}" field for Medication #{selectedMedicationIndex + 1}.
            <button 
              onClick={() => {setSelectedFieldType(''); setSelectedMedicationIndex(-1);}}
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
                rawText={extractedData?.rawText || ''}
                selectedFieldType={selectedFieldType}
              />
            </div>
          </div>
        )}

        {/* Medications Form */}
        <div className={`${showPDFComparison ? 'order-2 lg:order-2' : 'order-1'}`}>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleAddMedication}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  + Add New
                </button>
                <button
                  onClick={handleImportFromPrevious}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Import Previous
                </button>
                <button
                  onClick={handleSaveMedications}
                  className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Save All
                </button>
              </div>
            </div>

            {/* Medications Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Medication Name
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Strength
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Form
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Dosage
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Frequency
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Route
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      PRN Status
                    </th>
                    <th className="border border-gray-300 px-2 py-2 text-left text-xs font-medium text-gray-900">
                      Prescriber
                    </th>
                    <th className="border border-gray-300 px-1 py-2 text-left text-xs font-medium text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentMedications.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="border border-gray-300 px-4 py-6 text-center text-gray-500 text-sm">
                        No medications added yet. Click "Add New" to get started.
                      </td>
                    </tr>
                  ) : (
                    currentMedications.map((medication, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-1 py-1 relative">
                          <input
                            type="text"
                            value={medication.name || ''}
                            onChange={(e) => handleUpdateMedication(index, 'name', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Medication name"
                          />
                          {showPDFComparison && (
                            <button
                              onClick={() => setCopyMode('name', index)}
                              className="absolute top-0.5 right-0.5 p-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Copy from PDF"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-1 relative">
                          <input
                            type="text"
                            value={medication.strength || ''}
                            onChange={(e) => handleUpdateMedication(index, 'strength', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="10mg"
                          />
                          {showPDFComparison && (
                            <button
                              onClick={() => setCopyMode('strength', index)}
                              className="absolute top-0.5 right-0.5 p-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Copy from PDF"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-1">
                          <select
                            value={medication.form || ''}
                            onChange={(e) => handleUpdateMedication(index, 'form', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Form</option>
                            {FORM_OPTIONS.map(form => (
                              <option key={form} value={form}>{form}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 px-1 py-1 relative">
                          <input
                            type="text"
                            value={medication.dosage || ''}
                            onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="1 tablet"
                          />
                          {showPDFComparison && (
                            <button
                              onClick={() => setCopyMode('dosage', index)}
                              className="absolute top-0.5 right-0.5 p-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Copy from PDF"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-1 relative">
                          <input
                            type="text"
                            value={medication.frequency || ''}
                            onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="twice daily"
                          />
                          {showPDFComparison && (
                            <button
                              onClick={() => setCopyMode('frequency', index)}
                              className="absolute top-0.5 right-0.5 p-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Copy from PDF"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-1">
                          <select
                            value={medication.route || ''}
                            onChange={(e) => handleUpdateMedication(index, 'route', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Route</option>
                            {ROUTE_OPTIONS.map(route => (
                              <option key={route} value={route}>{route}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 px-1 py-1">
                          <select
                            value={medication.prn_status}
                            onChange={(e) => handleUpdateMedication(index, 'prn_status', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {PRN_STATUS_OPTIONS.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="border border-gray-300 px-1 py-1 relative">
                          <input
                            type="text"
                            value={medication.prescriber || ''}
                            onChange={(e) => handleUpdateMedication(index, 'prescriber', e.target.value)}
                            className="w-full px-1 py-0.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Prescriber"
                          />
                          {showPDFComparison && (
                            <button
                              onClick={() => setCopyMode('prescriber', index)}
                              className="absolute top-0.5 right-0.5 p-0.5 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Copy from PDF"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                        <td className="border border-gray-300 px-1 py-1">
                          <div className="flex gap-0.5">
                            <button
                              onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                              className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteMedication(index)}
                              className="px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Medication Categories */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">
                  Regular Medications ({getRegularMedications().length})
                </h4>
                <div className="space-y-1">
                  {getRegularMedications().map((med, index) => (
                    <div key={index} className="text-xs text-green-700">
                      {med.name} {med.strength && `(${med.strength})`}
                    </div>
                  ))}
                  {getRegularMedications().length === 0 && (
                    <div className="text-xs text-green-600 italic">No regular medications</div>
                  )}
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <h4 className="font-semibold text-orange-800 mb-2 text-sm">
                  PRN (As Needed) Medications ({getPRNMedications().length})
                </h4>
                <div className="space-y-1">
                  {getPRNMedications().map((med, index) => (
                    <div key={index} className="text-xs text-orange-700">
                      {med.name} {med.strength && `(${med.strength})`}
                    </div>
                  ))}
                  {getPRNMedications().length === 0 && (
                    <div className="text-xs text-orange-600 italic">No PRN medications</div>
                  )}
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <h4 className="font-semibold text-purple-800 mb-2 text-sm">
                  Limited Duration Medications ({getLimitedDurationMedications().length})
                </h4>
                <div className="space-y-1">
                  {getLimitedDurationMedications().map((med, index) => (
                    <div key={index} className="text-xs text-purple-700">
                      {med.name} {med.strength && `(${med.strength})`}
                    </div>
                  ))}
                  {getLimitedDurationMedications().length === 0 && (
                    <div className="text-xs text-purple-600 italic">No limited duration medications</div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              <button
                onClick={onPrevious}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                ← Back to Patient Info
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveMedications}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  Save All Changes
                </button>
                <button
                  onClick={onNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Continue to Interview →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 