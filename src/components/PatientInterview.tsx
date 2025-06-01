'use client';

import React, { useState, useEffect } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { InterviewResponse } from '@/store/hmr-store';

interface PatientInterviewProps {
  onNext: () => void;
  onPrevious: () => void;
}

export default function PatientInterview({ onNext, onPrevious }: PatientInterviewProps) {
  const { 
    currentPatient,
    currentInterviewResponse,
    setCurrentInterviewResponse,
    setLoading,
    saveDraft
  } = useHMRSelectors();

  const [formData, setFormData] = useState<InterviewResponse>({
    patient_id: currentPatient?.id,
    interview_date: new Date().toISOString().split('T')[0],
    pharmacist_name: 'Avishkar Lal (MRN 8362)',
    status: 'draft'
  });

  const [currentSection, setCurrentSection] = useState<'A' | 'B'>('A');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (currentInterviewResponse) {
      setFormData(currentInterviewResponse);
    }
  }, [currentInterviewResponse]);

  const handleInputChange = (field: keyof InterviewResponse, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let response;
      if (formData.id) {
        response = await fetch('/api/interviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch('/api/interviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (response.ok) {
        const interview = await response.json();
        setCurrentInterviewResponse(interview);
        saveDraft();
      }
    } catch (error) {
      console.error('Error saving interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentSection = () => {
    const newErrors: { [key: string]: string } = {};

    switch (currentSection) {
      case 'A':
        if (!formData.medication_understanding) {
          newErrors.medication_understanding = 'Please assess medication understanding';
        }
        if (!formData.medication_administration) {
          newErrors.medication_administration = 'Please select administration method';
        }
        if (!formData.medication_adherence) {
          newErrors.medication_adherence = 'Please assess medication adherence';
        }
        break;
      case 'B':
        if (!formData.fluid_intake) {
          newErrors.fluid_intake = 'Please assess fluid intake';
        }
        if (!formData.eating_habits) {
          newErrors.eating_habits = 'Please assess eating habits';
        }
        if (!formData.smoking_status) {
          newErrors.smoking_status = 'Please assess smoking status';
        }
        if (!formData.alcohol_consumption) {
          newErrors.alcohol_consumption = 'Please assess alcohol consumption';
        }
        if (!formData.recreational_drug_use) {
          newErrors.recreational_drug_use = 'Please assess recreational drug use';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSectionNext = () => {
    if (validateCurrentSection()) {
      const sections: ('A' | 'B')[] = ['A', 'B'];
      const currentIndex = sections.indexOf(currentSection);
      if (currentIndex < sections.length - 1) {
        setCurrentSection(sections[currentIndex + 1]);
      }
    }
  };

  const handleSectionPrevious = () => {
    const sections: ('A' | 'B')[] = ['A', 'B'];
    const currentIndex = sections.indexOf(currentSection);
    if (currentIndex > 0) {
      setCurrentSection(sections[currentIndex - 1]);
    }
  };

  const renderSectionA = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Section A: General Comments
      </h3>

      {/* A1. Medication Understanding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          A1. How would you rate the patient&apos;s understanding of why they were prescribed their medications? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            'Good - Patient demonstrates clear understanding of medication purposes',
            'Moderate - Patient has some understanding but needs clarification on some medications',
            'Poor - Patient has limited understanding of medication purposes'
          ].map((option) => (
            <label key={option} className="flex items-start">
              <input
                type="radio"
                name="medication_understanding"
                value={option}
                checked={formData.medication_understanding === option}
                onChange={(e) => handleInputChange('medication_understanding', e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.medication_understanding && (
          <p className="text-red-500 text-sm mt-1">{errors.medication_understanding}</p>
        )}
      </div>

      {/* A2. Medication Administration Method */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          A2. How does the patient currently manage their medication administration? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            'Uses a Dose Administration Aid (DAA) packed by their local pharmacy',
            'Self-administers medications using their own DAA (Webster pack/pill organizer)',
            'Self-administers medications without using any DAA'
          ].map((option) => (
            <label key={option} className="flex items-start">
              <input
                type="radio"
                name="medication_administration"
                value={option}
                checked={formData.medication_administration === option}
                onChange={(e) => handleInputChange('medication_administration', e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.medication_administration && (
          <p className="text-red-500 text-sm mt-1">{errors.medication_administration}</p>
        )}
      </div>

      {/* A3. Medication Adherence */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          A3. How would you assess the patient&apos;s medication adherence? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            'Good compliance - Medications are taken at the same time each day',
            'Poor compliance suspected due to varying dosing times and lifestyle factors',
            'Medications taken at consistent times, but dose discrepancies have been identified'
          ].map((option) => (
            <label key={option} className="flex items-start">
              <input
                type="radio"
                name="medication_adherence"
                value={option}
                checked={formData.medication_adherence === option}
                onChange={(e) => handleInputChange('medication_adherence', e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.medication_adherence && (
          <p className="text-red-500 text-sm mt-1">{errors.medication_adherence}</p>
        )}
      </div>

      {/* A4. Additional Adherence Comments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          A4. Additional Adherence Comments
        </label>
        <textarea
          value={formData.adherence_comments || ''}
          onChange={(e) => handleInputChange('adherence_comments', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Document any specific adherence issues, missed doses, or patient concerns..."
        />
      </div>
    </div>
  );

  const renderSectionB = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">
        Section B: Lifestyle Considerations
      </h3>

      {/* B1. Fluid Intake Assessment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          B1. Assess the patient&apos;s daily fluid intake <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            'Adequate fluid intake (~approximately 2 litres per day)',
            'Inadequate fluid intake - Limited water intake (less than 2 litres per day)'
          ].map((option) => (
            <label key={option} className="flex items-start">
              <input
                type="radio"
                name="fluid_intake"
                value={option}
                checked={formData.fluid_intake === option}
                onChange={(e) => handleInputChange('fluid_intake', e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.fluid_intake && (
          <p className="text-red-500 text-sm mt-1">{errors.fluid_intake}</p>
        )}

        {/* B1a. Other Fluid Consumption (Show if "Inadequate" selected) */}
        {formData.fluid_intake === 'Inadequate fluid intake - Limited water intake (less than 2 litres per day)' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700 mb-3">B1a. Other Fluid Consumption</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tea Consumption (cups per day)
                </label>
                <input
                  type="number"
                  value={formData.tea_cups_daily || ''}
                  onChange={(e) => handleInputChange('tea_cups_daily', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coffee Consumption (cups per day)
                </label>
                <input
                  type="number"
                  value={formData.coffee_cups_daily || ''}
                  onChange={(e) => handleInputChange('coffee_cups_daily', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Fluids
                </label>
                <input
                  type="text"
                  value={formData.other_fluids || ''}
                  onChange={(e) => handleInputChange('other_fluids', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., soft drinks, juice"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* B2. Eating Habits Assessment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          B2. Assess the patient&apos;s eating habits and dietary patterns <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {[
            'Good eating habits - Regular meals, balanced diet',
            'Poor eating habits - Irregular meals, dietary concerns identified'
          ].map((option) => (
            <label key={option} className="flex items-start">
              <input
                type="radio"
                name="eating_habits"
                value={option}
                checked={formData.eating_habits === option}
                onChange={(e) => handleInputChange('eating_habits', e.target.value)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {errors.eating_habits && (
          <p className="text-red-500 text-sm mt-1">{errors.eating_habits}</p>
        )}

        {/* B2a. Dietary Concerns (Show if "Poor eating habits" selected) */}
        {formData.eating_habits === 'Poor eating habits - Irregular meals, dietary concerns identified' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-gray-700 mb-3">B2a. Dietary Concerns (Multiple selection allowed)</h4>
            <div className="space-y-2">
              {[
                'Poor dietary choices - Rarely cooks at home, relies on pre-made meals (Lite n&apos; Easy, etc.)',
                'Irregular meal times affecting medication timing',
                'Dietary restrictions affecting medication absorption',
                'Consider referral to dietician'
              ].map((concern) => (
                <label key={concern} className="flex items-start">
                  <input
                    type="checkbox"
                    checked={(formData.dietary_concerns || '').includes(concern)}
                    onChange={(e) => {
                      const currentConcerns = formData.dietary_concerns ? formData.dietary_concerns.split(', ') : [];
                      if (e.target.checked) {
                        currentConcerns.push(concern);
                      } else {
                        const index = currentConcerns.indexOf(concern);
                        if (index > -1) currentConcerns.splice(index, 1);
                      }
                      handleInputChange('dietary_concerns', currentConcerns.join(', '));
                    }}
                    className="mt-1 mr-3"
                  />
                  <span className="text-sm">{concern}</span>
                </label>
              ))}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={(formData.dietary_concerns || '').includes('Other:')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleInputChange('dietary_concerns', (formData.dietary_concerns || '') + ', Other: ');
                    } else {
                      handleInputChange('dietary_concerns', (formData.dietary_concerns || '').replace(/, Other:.*/, ''));
                    }
                  }}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <span className="text-sm">Other dietary concerns:</span>
                  <input
                    type="text"
                    placeholder="Specify other concerns"
                    className="w-full mt-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    onChange={(e) => {
                      const otherConcerns = formData.dietary_concerns?.replace(/, Other:.*/, '') || '';
                      handleInputChange('dietary_concerns', otherConcerns + ', Other: ' + e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* B3. Substance Use Assessment */}
      <div>
        <h4 className="font-medium text-gray-700 mb-4">B3. Document the patient&apos;s smoking, alcohol, and recreational drug use</h4>
        
        {/* B3a. Smoking Status */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            B3a. Smoking Status <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {['Non-smoker', 'Current smoker', 'Ex-smoker'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="smoking_status"
                  value={option}
                  checked={formData.smoking_status === option}
                  onChange={(e) => handleInputChange('smoking_status', e.target.value)}
                  className="mr-3"
                />
                <span className="text-sm">{option}</span>
                {option === 'Current smoker' && formData.smoking_status === option && (
                  <div className="ml-4 flex items-center">
                    <input
                      type="number"
                      value={formData.cigarettes_daily || ''}
                      onChange={(e) => handleInputChange('cigarettes_daily', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="0"
                      min="0"
                    />
                    <span className="ml-2 text-sm">cigarettes per day</span>
                  </div>
                )}
                {option === 'Ex-smoker' && formData.smoking_status === option && (
                  <div className="ml-4 flex items-center">
                    <span className="text-sm mr-2">Quit date:</span>
                    <input
                      type="date"
                      value={formData.quit_date || ''}
                      onChange={(e) => handleInputChange('quit_date', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                )}
              </label>
            ))}
          </div>
          {errors.smoking_status && (
            <p className="text-red-500 text-sm mt-1">{errors.smoking_status}</p>
          )}
        </div>

        {/* B3b. Alcohol Consumption */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            B3b. Alcohol Consumption <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              'No alcohol consumption',
              'Minimal alcohol consumption (occasional social drinking)',
              'Regular alcohol consumption',
              'Excessive alcohol consumption requiring intervention'
            ].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="alcohol_consumption"
                  value={option}
                  checked={formData.alcohol_consumption === option}
                  onChange={(e) => handleInputChange('alcohol_consumption', e.target.value)}
                  className="mr-3"
                />
                <span className="text-sm">{option}</span>
                {option === 'Regular alcohol consumption' && formData.alcohol_consumption === option && (
                  <div className="ml-4 flex items-center">
                    <input
                      type="number"
                      value={formData.alcohol_drinks_weekly || ''}
                      onChange={(e) => handleInputChange('alcohol_drinks_weekly', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="0"
                      min="0"
                    />
                    <span className="ml-2 text-sm">standard drinks per week</span>
                  </div>
                )}
              </label>
            ))}
          </div>
          {errors.alcohol_consumption && (
            <p className="text-red-500 text-sm mt-1">{errors.alcohol_consumption}</p>
          )}
        </div>

        {/* B3c. Recreational Drug Use */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            B3c. Recreational Drug Use <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              'No recreational drug use',
              'Occasional recreational drug use',
              'Regular recreational drug use'
            ].map((option) => (
              <label key={option} className="flex items-start">
                <input
                  type="radio"
                  name="recreational_drug_use"
                  value={option}
                  checked={formData.recreational_drug_use === option}
                  onChange={(e) => handleInputChange('recreational_drug_use', e.target.value)}
                  className="mt-1 mr-3"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
          {errors.recreational_drug_use && (
            <p className="text-red-500 text-sm mt-1">{errors.recreational_drug_use}</p>
          )}

          {(formData.recreational_drug_use === 'Occasional recreational drug use' || 
            formData.recreational_drug_use === 'Regular recreational drug use') && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Substance type
                  </label>
                  <input
                    type="text"
                    value={formData.drug_type || ''}
                    onChange={(e) => handleInputChange('drug_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Specify substance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={formData.drug_frequency || ''}
                    onChange={(e) => handleInputChange('drug_frequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How often"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Patient Interview - {currentPatient?.name || 'Unknown Patient'}
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Interview Date:</strong> 
              <input
                type="date"
                value={formData.interview_date}
                onChange={(e) => handleInputChange('interview_date', e.target.value)}
                className="ml-2 px-2 py-1 border border-blue-300 rounded"
              />
            </span>
            <span><strong>Pharmacist:</strong> {formData.pharmacist_name}</span>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {['A', 'B'].map((section) => (
          <button
            key={section}
            onClick={() => setCurrentSection(section as 'A' | 'B')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentSection === section
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Section {section}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-8">
        {/* Render Current Section */}
        {currentSection === 'A' && renderSectionA()}
        {currentSection === 'B' && renderSectionB()}

        {/* Section Navigation Buttons */}
        <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={onPrevious}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Medications
            </button>
            {currentSection !== 'A' && (
              <button
                onClick={handleSectionPrevious}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Previous Section
              </button>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Save Draft
            </button>
            {currentSection !== 'B' ? (
              <button
                onClick={handleSectionNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Next Section →
              </button>
            ) : (
              <button
                onClick={onNext}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Continue to Recommendations →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 