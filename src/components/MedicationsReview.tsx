'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { Medication } from '@/store/hmr-store';

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

export default function MedicationsReview({ onNext, onPrevious }: MedicationsReviewProps) {
  const { 
    currentPatient,
    currentMedications, 
    setCurrentMedications,
    addMedication,
    updateMedication,
    removeMedication,
    extractedData,
    setLoading,
    saveDraft
  } = useHMRSelectors();

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load medications from extracted data if available
  useEffect(() => {
    if (extractedData?.medications && currentMedications.length === 0) {
      const extractedMeds = extractedData.medications.map((med: Medication) => ({
        ...med,
        patient_id: currentPatient?.id
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

  const getRegularMedications = () => currentMedications.filter(med => med.prn_status === 'Regular');
  const getPRNMedications = () => currentMedications.filter(med => med.prn_status === 'PRN (as needed)');
  const getLimitedDurationMedications = () => currentMedications.filter(med => med.prn_status === 'Limited Duration');

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Medications Review
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Patient:</strong> {currentPatient?.name || 'Not specified'}</span>
            <span><strong>Total Medications:</strong> {currentMedications.length}</span>
            <span><strong>Regular:</strong> {getRegularMedications().length}</span>
            <span><strong>PRN:</strong> {getPRNMedications().length}</span>
            <span><strong>Limited Duration:</strong> {getLimitedDurationMedications().length}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Current Medications</h3>
          <div className="flex gap-3">
            <button
              onClick={handleAddMedication}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              + Add New Medication
            </button>
            <button
              onClick={handleImportFromPrevious}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Import from Previous Review
            </button>
            <button
              onClick={handleSaveMedications}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Save Medications List
            </button>
          </div>
        </div>

        {/* Medications Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Medication Name
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Strength
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Form
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Dosage
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Frequency
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Route
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  PRN Status
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Prescriber
                </th>
                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentMedications.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                    No medications added yet. Click &quot;Add New Medication&quot; to get started.
                  </td>
                </tr>
              ) : (
                currentMedications.map((medication, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={medication.name || ''}
                        onChange={(e) => handleUpdateMedication(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Medication name"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={medication.strength || ''}
                        onChange={(e) => handleUpdateMedication(index, 'strength', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., 10mg"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <select
                        value={medication.form || ''}
                        onChange={(e) => handleUpdateMedication(index, 'form', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select form</option>
                        {FORM_OPTIONS.map(form => (
                          <option key={form} value={form}>{form}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={medication.dosage || ''}
                        onChange={(e) => handleUpdateMedication(index, 'dosage', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., 1 tablet"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={medication.frequency || ''}
                        onChange={(e) => handleUpdateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g., twice daily"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <select
                        value={medication.route || ''}
                        onChange={(e) => handleUpdateMedication(index, 'route', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="">Select route</option>
                        {ROUTE_OPTIONS.map(route => (
                          <option key={route} value={route}>{route}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <select
                        value={medication.prn_status}
                        onChange={(e) => handleUpdateMedication(index, 'prn_status', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {PRN_STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={medication.prescriber || ''}
                        onChange={(e) => handleUpdateMedication(index, 'prescriber', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Prescriber"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {editingIndex === index ? 'Done' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDeleteMedication(index)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
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
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3">
              Regular Medications ({getRegularMedications().length})
            </h4>
            <div className="space-y-2">
              {getRegularMedications().map((med, index) => (
                <div key={index} className="text-sm text-green-700">
                  {med.name} {med.strength && `(${med.strength})`}
                </div>
              ))}
              {getRegularMedications().length === 0 && (
                <div className="text-sm text-green-600 italic">No regular medications</div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-3">
              PRN (As Needed) Medications ({getPRNMedications().length})
            </h4>
            <div className="space-y-2">
              {getPRNMedications().map((med, index) => (
                <div key={index} className="text-sm text-orange-700">
                  {med.name} {med.strength && `(${med.strength})`}
                </div>
              ))}
              {getPRNMedications().length === 0 && (
                <div className="text-sm text-orange-600 italic">No PRN medications</div>
              )}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-3">
              Limited Duration Medications ({getLimitedDurationMedications().length})
            </h4>
            <div className="space-y-2">
              {getLimitedDurationMedications().map((med, index) => (
                <div key={index} className="text-sm text-purple-700">
                  {med.name} {med.strength && `(${med.strength})`}
                </div>
              ))}
              {getLimitedDurationMedications().length === 0 && (
                <div className="text-sm text-purple-600 italic">No limited duration medications</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <button
            onClick={onPrevious}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Patient Info
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleSaveMedications}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Save All Changes
            </button>
            <button
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Continue to Interview →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 