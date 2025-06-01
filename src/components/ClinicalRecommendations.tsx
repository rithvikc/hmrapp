'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { ClinicalRecommendation } from '@/store/hmr-store';
import { Plus, X, Save, FileText, AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface ClinicalRecommendationsProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ISSUE_CATEGORIES = [
  'Medication Adherence Issues',
  'Drug Interactions', 
  'Inappropriate Dosing',
  'Side Effects/Adverse Reactions',
  'Therapeutic Duplication',
  'Contraindications',
  'Drug-Disease Interactions',
  'Monitoring Requirements',
  'Cost/Access Issues',
  'Administration Problems',
  'Medication Storage Issues',
  'Polypharmacy Concerns',
  'Other Clinical Issue'
];

const PRIORITY_LEVELS = [
  { value: 'High', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  { value: 'Medium', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
  { value: 'Low', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
];

interface Template {
  issueTemplate: string;
  actionTemplate: string;
  counsellingTemplate: string;
}

const SMART_TEMPLATES: Record<string, Template[]> = {
  'Medication Adherence Issues': [
    {
      issueTemplate: 'Poor medication adherence suspected due to complex dosing schedule. Patient is taking medications irregularly which may compromise therapeutic effectiveness.',
      actionTemplate: 'Consider simplifying medication regimen where possible. Recommend dose administration aid (DAA) packing by local pharmacy to improve compliance. Review at next consultation.',
      counsellingTemplate: 'Explained importance of regular medication dosing. Discussed advantages of DAA packing to improve medication organization and adherence.'
    },
    {
      issueTemplate: 'Patient demonstrates poor understanding of medication purposes and dosing instructions. Confusion identified regarding specific medications.',
      actionTemplate: 'Recommend comprehensive medication review with patient. Consider providing written medication list with clear instructions. May benefit from pharmacy-based medication management services.',
      counsellingTemplate: 'Provided detailed explanation of each medication\'s purpose and correct dosing schedule. Gave written medication list for reference.'
    }
  ],
  'Drug Interactions': [
    {
      issueTemplate: 'Potential drug interaction identified between concurrent medications. This combination may increase risk of adverse effects or reduce effectiveness.',
      actionTemplate: 'Review concurrent medication use. Consider alternative medication, dose adjustment, timing separation, or enhanced monitoring parameters.',
      counsellingTemplate: 'Explained potential interaction and importance of taking medications as directed. Advised to report any unusual symptoms.'
    }
  ],
  'Inappropriate Dosing': [
    {
      issueTemplate: 'Current medication dose appears excessive for patient\'s age, weight, or kidney function. Risk of adverse effects may be increased.',
      actionTemplate: 'Consider reducing medication dose and monitor specific parameters. Review efficacy and tolerability at next consultation.',
      counsellingTemplate: 'Explained dosing considerations and importance of regular monitoring. Advised to report any side effects immediately.'
    },
    {
      issueTemplate: 'Current medication dose may be suboptimal for adequate condition control. Patient continues to experience symptoms despite treatment.',
      actionTemplate: 'Consider increasing medication dose if tolerated. Monitor relevant parameters and reassess efficacy in specified time period.',
      counsellingTemplate: 'Discussed treatment goals and importance of optimal dosing. Explained signs of improvement to monitor.'
    }
  ],
  'Side Effects/Adverse Reactions': [
    {
      issueTemplate: 'Patient reports symptoms which may be related to current medication. Temporal relationship suggests possible adverse drug reaction.',
      actionTemplate: 'Consider discontinuing medication and monitor for symptom resolution. If medication essential, consider alternative therapy. Consider adverse drug reaction reporting if appropriate.',
      counsellingTemplate: 'Explained possible connection between symptoms and medication. Advised to monitor symptoms and report changes immediately.'
    }
  ],
  'Monitoring Requirements': [
    {
      issueTemplate: 'Patient taking medication requires regular monitoring due to risk of adverse effects. Recent monitoring results not available or overdue.',
      actionTemplate: 'Arrange specific blood test within recommended time frame. Establish regular monitoring schedule. Review results and adjust therapy as needed.',
      counsellingTemplate: 'Explained importance of regular blood monitoring for medication safety. Provided schedule for future tests.'
    }
  ]
};

export default function ClinicalRecommendations({ onNext, onPrevious }: ClinicalRecommendationsProps) {
  const { 
    currentPatient,
    currentMedications,
    currentClinicalRecommendations, 
    setCurrentClinicalRecommendations,
    setLoading,
    saveDraft
  } = useHMRSelectors();

  const [recommendations, setRecommendations] = useState<ClinicalRecommendation[]>([]);
  const [autoSuggestions, setAutoSuggestions] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState<{ [key: number]: boolean }>({});

  const addNewRecommendation = useCallback(() => {
    const newRecommendation: ClinicalRecommendation = {
      id: Date.now(),
      patient_id: currentPatient?.id,
      category: 'Other Clinical Issue',
      issue_identified: '',
      suggested_action: '',
      priority_level: 'Medium',
      order_number: recommendations.length + 1
    };
    
    const updatedRecommendations = [...recommendations, newRecommendation];
    setRecommendations(updatedRecommendations);
    setCurrentClinicalRecommendations(updatedRecommendations);
  }, [currentPatient?.id, recommendations, setCurrentClinicalRecommendations]);

  const generateAutoSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    // Age-based suggestions
    if (currentPatient?.dob) {
      const age = new Date().getFullYear() - new Date(currentPatient.dob).getFullYear();
      if (age > 65 && currentMedications.length > 5) {
        suggestions.push('Consider polypharmacy review for elderly patient with multiple medications');
      }
      if (age > 65) {
        suggestions.push('Review medications against Beers Criteria for potentially inappropriate medications in elderly');
      }
    }

    // Medication count suggestions
    if (currentMedications.length > 5) {
      suggestions.push('Polypharmacy identified - consider medication reconciliation and optimization');
    }

    // Specific medication alerts
    const medicationNames = currentMedications.map(med => med.name.toLowerCase());
    if (medicationNames.some(name => name.includes('warfarin'))) {
      suggestions.push('Warfarin therapy requires regular INR monitoring');
    }
    if (medicationNames.some(name => name.includes('metformin'))) {
      suggestions.push('Consider renal function monitoring for metformin therapy');
    }

    setAutoSuggestions(suggestions);
  }, [currentPatient?.dob, currentMedications]);

  useEffect(() => {
    if (currentClinicalRecommendations.length > 0) {
      setRecommendations(currentClinicalRecommendations);
    } else {
      // Start with one empty recommendation
      addNewRecommendation();
    }
    
    // Generate auto-suggestions based on patient data
    generateAutoSuggestions();
  }, [currentClinicalRecommendations, addNewRecommendation, generateAutoSuggestions]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate recommendations
      const validRecommendations = recommendations.filter(rec => 
        rec.issue_identified.trim() && rec.suggested_action.trim()
      );

      if (validRecommendations.length === 0) {
        alert('Please add at least one complete recommendation before saving.');
        setLoading(false);
        return;
      }

      await saveDraft();
      alert('Recommendations saved successfully!');
    } catch (error) {
      console.error('Error saving recommendations:', error);
      alert('Error saving recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (recommendations.length === 0 || !recommendations.some(rec => rec.issue_identified && rec.suggested_action)) {
      alert('Please complete at least one recommendation before continuing.');
      return;
    }

    setLoading(true);
    try {
      await saveDraft();
      onNext();
    } catch (error) {
      console.error('Error saving before continuing:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'High': return <AlertTriangle className="w-4 h-4" />;
      case 'Medium': return <Clock className="w-4 h-4" />;
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityConfig = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority) || PRIORITY_LEVELS[1];
  };

  const removeRecommendation = (index: number) => {
    if (recommendations.length <= 1) {
      alert('At least one recommendation is required');
      return;
    }
    
    const updatedRecommendations = recommendations
      .filter((_, i) => i !== index)
      .map((rec, i) => ({ ...rec, order_number: i + 1 }));
    
    setRecommendations(updatedRecommendations);
    setCurrentClinicalRecommendations(updatedRecommendations);
  };

  const updateRecommendation = (index: number, field: keyof ClinicalRecommendation, value: string) => {
    const updatedRecommendations = recommendations.map((rec, i) => 
      i === index ? { ...rec, [field]: value } : rec
    );
    setRecommendations(updatedRecommendations);
    setCurrentClinicalRecommendations(updatedRecommendations);
  };

  const applyTemplate = (index: number, template: Template) => {
    const updatedRecommendations = recommendations.map((rec, i) => 
      i === index ? { 
        ...rec, 
        issue_identified: template.issueTemplate,
        suggested_action: template.actionTemplate,
        patient_counselling: template.counsellingTemplate
      } : rec
    );
    setRecommendations(updatedRecommendations);
    setCurrentClinicalRecommendations(updatedRecommendations);
    setShowTemplates({ ...showTemplates, [index]: false });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Clinical Recommendations
        </h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span><strong>Patient:</strong> {currentPatient?.name || 'Unknown Patient'}</span>
            <span><strong>Total Recommendations:</strong> {recommendations.length}</span>
            <span><strong>High Priority:</strong> {recommendations.filter(r => r.priority_level === 'High').length}</span>
            <span><strong>Medium Priority:</strong> {recommendations.filter(r => r.priority_level === 'Medium').length}</span>
            <span><strong>Low Priority:</strong> {recommendations.filter(r => r.priority_level === 'Low').length}</span>
          </div>
        </div>
      </div>

      {/* Auto-suggestions */}
      {autoSuggestions.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Suggested Areas for Review
          </h3>
          <ul className="text-sm text-amber-700 space-y-1">
            {autoSuggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {/* Recommendations */}
        {recommendations.map((recommendation, index) => {
          const priorityConfig = getPriorityConfig(recommendation.priority_level);
          const availableTemplates = SMART_TEMPLATES[recommendation.category] || [];

          return (
            <div 
              key={index} 
              className={`bg-white border-2 rounded-lg p-6 ${priorityConfig.borderColor} ${priorityConfig.bgColor}`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-semibold text-gray-900">
                    Issue #{index + 1}
                  </span>
                  {getPriorityIcon(recommendation.priority_level)}
                  <span className={`text-sm font-medium ${priorityConfig.color}`}>
                    {recommendation.priority_level} Priority
                  </span>
                </div>
                <div className="flex space-x-2">
                  {availableTemplates.length > 0 && (
                    <button
                      onClick={() => setShowTemplates({ ...showTemplates, [index]: !showTemplates[index] })}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Load Template
                    </button>
                  )}
                  {recommendations.length > 1 && (
                    <button
                      onClick={() => removeRecommendation(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Templates */}
              {showTemplates[index] && availableTemplates.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Templates:</p>
                  <div className="space-y-2">
                    {availableTemplates.map((template, templateIndex) => (
                      <button
                        key={templateIndex}
                        onClick={() => applyTemplate(index, template)}
                        className="block w-full text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        <p className="font-medium text-gray-800 truncate">
                          {template.issueTemplate.substring(0, 80)}...
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Issue Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Category
                  </label>
                  <select
                    value={recommendation.category}
                    onChange={(e) => updateRecommendation(index, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ISSUE_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Issue Identified */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Identified <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recommendation.issue_identified || ''}
                    onChange={(e) => updateRecommendation(index, 'issue_identified', e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Describe the medication-related problem..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(recommendation.issue_identified || '').length}/500 characters
                  </p>
                </div>

                {/* Suggested Action */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Action <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={recommendation.suggested_action || ''}
                    onChange={(e) => updateRecommendation(index, 'suggested_action', e.target.value)}
                    rows={4}
                    maxLength={1000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Recommend specific actions for the GP..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {(recommendation.suggested_action || '').length}/1000 characters
                  </p>
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex space-x-4">
                    {PRIORITY_LEVELS.map(priority => (
                      <label key={priority.value} className="flex items-center">
                        <input
                          type="radio"
                          name={`priority-${index}`}
                          value={priority.value}
                          checked={recommendation.priority_level === priority.value}
                          onChange={(e) => updateRecommendation(index, 'priority_level', e.target.value)}
                          className="mr-2"
                        />
                        <span className={`text-sm font-medium ${priority.color}`}>
                          {priority.value}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Patient Counselling Provided */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Counselling Provided
                  </label>
                  <textarea
                    value={(recommendation as ClinicalRecommendation & { patient_counselling?: string }).patient_counselling || ''}
                    onChange={(e) => updateRecommendation(index, 'patient_counselling' as keyof ClinicalRecommendation, e.target.value)}
                    rows={3}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="What education was provided to the patient..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {((recommendation as ClinicalRecommendation & { patient_counselling?: string }).patient_counselling || '').length}/500 characters
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add New Recommendation Button */}
        <button
          onClick={addNewRecommendation}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Issue/Recommendation</span>
        </button>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200">
          <button
            onClick={onPrevious}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Interview
          </button>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Recommendations</span>
            </button>
            <button
              onClick={handleContinue}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Continue to Review →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 