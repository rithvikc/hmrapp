'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { Patient } from '@/store/hmr-store';

interface PatientInfoReviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function PatientInfoReview({ onNext, onPrevious }: PatientInfoReviewProps) {
  const { 
    currentPatient, 
    setCurrentPatient, 
    extractedData,
    setLoading,
    saveDraft
  } = useHMRSelectors();

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
      setFormData(prev => ({
        ...prev,
        name: extractedData.name || '',
        dob: extractedData.dob || '',
        gender: extractedData.gender || '',
        medicare_number: extractedData.medicareNumber || '',
        address: extractedData.address || '',
        phone: extractedData.phone || '',
        referring_doctor: extractedData.referringDoctor || '',
        doctor_email: extractedData.doctorEmail || '',
        known_allergies: extractedData.allergies || '',
        current_conditions: extractedData.currentConditions || '',
        past_medical_history: extractedData.pastMedicalHistory || ''
      }));
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Patient Information Review
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Patient Name:</strong> {formData.name || 'Not specified'}</span>
            <span><strong>DOB:</strong> {formData.dob || 'Not specified'}</span>
            <span><strong>Gender:</strong> {formData.gender || 'Not specified'}</span>
            <span><strong>Doctor:</strong> {formData.referring_doctor || 'Not specified'}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="space-y-8">
          {/* Patient Demographics Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
              Patient Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter patient's full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob || ''}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dob ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.gender ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicare Number
                </label>
                <input
                  type="text"
                  value={formData.medicare_number || ''}
                  onChange={(e) => handleInputChange('medicare_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="16-digit Medicare number"
                  maxLength={16}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient's address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Referring Doctor Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
              Referring Doctor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.referring_doctor || ''}
                  onChange={(e) => handleInputChange('referring_doctor', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.referring_doctor ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter doctor's name"
                />
                {errors.referring_doctor && <p className="text-red-500 text-sm mt-1">{errors.referring_doctor}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Name
                </label>
                <input
                  type="text"
                  value={formData.practice_name || ''}
                  onChange={(e) => handleInputChange('practice_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter practice name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.doctor_email || ''}
                  onChange={(e) => handleInputChange('doctor_email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.doctor_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="doctor@example.com"
                />
                {errors.doctor_email && <p className="text-red-500 text-sm mt-1">{errors.doctor_email}</p>}
                <p className="text-xs text-gray-500 mt-1">Required for sending the HMR report</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Phone
                </label>
                <input
                  type="tel"
                  value={formData.practice_phone || ''}
                  onChange={(e) => handleInputChange('practice_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Practice phone number"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practice Address
                </label>
                <textarea
                  value={formData.practice_address || ''}
                  onChange={(e) => handleInputChange('practice_address', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter practice address"
                />
              </div>
            </div>
          </div>

          {/* Medical History Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 border-b border-gray-200 pb-2">
              Medical History
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Known Allergies
                </label>
                <textarea
                  value={formData.known_allergies || ''}
                  onChange={(e) => handleInputChange('known_allergies', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List known allergies (one per line)"
                />
                <p className="text-xs text-gray-500 mt-1">Enter each allergy on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Medical Conditions
                </label>
                <textarea
                  value={formData.current_conditions || ''}
                  onChange={(e) => handleInputChange('current_conditions', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="List current medical conditions (one per line)"
                />
                <p className="text-xs text-gray-500 mt-1">Enter each condition on a new line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Past Medical History
                </label>
                <textarea
                  value={formData.past_medical_history || ''}
                  onChange={(e) => handleInputChange('past_medical_history', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
  );
} 