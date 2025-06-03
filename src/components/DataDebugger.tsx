'use client';

import React, { useState } from 'react';
import { useHMRSelectors } from '@/store/hmr-store';
import { Bug, ChevronUp, ChevronDown } from 'lucide-react';

export default function DataDebugger() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    clearAllData, 
    currentPatient, 
    extractedData, 
    currentMedications,
    resetWorkflow 
  } = useHMRSelectors();

  const handleClearAll = () => {
    clearAllData();
    window.location.reload(); // Force page reload to clear component state
  };

  const handleResetWorkflow = () => {
    resetWorkflow();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-w-xs">
      {/* Header - Always visible */}
      <div 
        className="flex items-center justify-between p-2 bg-gray-50 rounded-t-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <Bug className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-medium text-gray-700">Debug</span>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        )}
      </div>
      
      {/* Expandable content */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-200">
          <div className="space-y-1 text-xs mb-3 text-gray-600">
            <div><strong>Patient:</strong> {currentPatient?.name || 'None'}</div>
            <div><strong>Extracted:</strong> {extractedData?.name || 'None'}</div>
            <div><strong>Doctor:</strong> {extractedData?.referringDoctor || 'None'}</div>
            <div><strong>Medications:</strong> {currentMedications.length}</div>
          </div>
          
          <div className="space-y-1">
            <button
              onClick={handleResetWorkflow}
              className="block w-full px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600 transition-colors"
            >
              Reset Workflow
            </button>
            <button
              onClick={handleClearAll}
              className="block w-full px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 