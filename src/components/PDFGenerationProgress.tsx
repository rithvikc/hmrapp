'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Zap, CheckCircle, Star, Pill, Heart, Activity, AlertTriangle } from 'lucide-react'

interface PDFGenerationProgressProps {
  isVisible: boolean
  onComplete?: () => void
  duration?: number // Allow custom duration in milliseconds
}

const PDFGenerationProgress: React.FC<PDFGenerationProgressProps> = ({ 
  isVisible, 
  onComplete,
  duration = 18000 // Default 18 seconds
}) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnimationPaused, setIsAnimationPaused] = useState(false)

  const steps = [
    { label: 'Analyzing patient data', icon: Heart, color: 'text-red-500', duration: 0.2 },
    { label: 'Processing medications', icon: Pill, color: 'text-blue-500', duration: 0.25 },
    { label: 'Generating recommendations', icon: Activity, color: 'text-green-500', duration: 0.25 },
    { label: 'Formatting document', icon: FileText, color: 'text-purple-500', duration: 0.2 },
    { label: 'Finalizing PDF', icon: Zap, color: 'text-yellow-500', duration: 0.1 }
  ]

  // Reset error state when component becomes visible
  useEffect(() => {
    if (isVisible) {
      setError(null)
      setIsAnimationPaused(false)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      setCurrentStep(0)
      setShowSuccess(false)
      setError(null)
      return
    }

    // Always start with at least 5% progress to avoid the appearance of being stuck
    setProgress(5)
    
    let timeElapsed = duration * 0.05 // Start at 5% of total time
    const updateInterval = 100 // Update every 100ms
    const totalDuration = duration
    let isPaused = false

    const interval = setInterval(() => {
      if (isPaused) return
      
      timeElapsed += updateInterval
      // Calculate new progress, ensuring we don't reach 100% until explicitly set
      const newProgress = Math.min((timeElapsed / totalDuration) * 100, 95) // Cap at 95% until success
      
      // Update current step based on progress with step durations
      let cumulativeDuration = 0
      let stepIndex = 0
      
      for (let i = 0; i < steps.length; i++) {
        cumulativeDuration += steps[i].duration
        if (newProgress / 100 <= cumulativeDuration) {
          stepIndex = i
          break
        }
        stepIndex = i + 1
      }
      
      setCurrentStep(Math.min(stepIndex, steps.length - 1))
      setProgress(newProgress)
      
      // If we're near the end but still waiting, slow down the progress
      if (newProgress > 80 && timeElapsed > totalDuration * 0.8) {
        isPaused = true
        setIsAnimationPaused(true)
        
        // Resume with slower progression after a short pause
        setTimeout(() => {
          isPaused = false
          setIsAnimationPaused(false)
        }, 1000)
      }
    }, updateInterval)

    // Cleanup interval on unmount
    return () => clearInterval(interval)
  }, [isVisible, duration, steps])

  // Function to handle successful PDF generation
  const handleSuccess = () => {
    setProgress(100)
    setShowSuccess(true)
    setTimeout(() => {
      onComplete?.()
    }, 2000) // Show success for 2 seconds
  }

  // Function to handle errors
  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setIsAnimationPaused(true)
  }

  // Expose these functions to parent components
  useEffect(() => {
    if (isVisible) {
      // Attach these functions to window for parent component access
      (window as any).__pdfProgressHandlers = {
        success: handleSuccess,
        error: handleError
      }
    }
    
    return () => {
      // Clean up when component unmounts
      delete (window as any).__pdfProgressHandlers
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {error ? (
          // Error state
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Error Generating PDF
            </h3>
            <p className="text-gray-600 mb-4">
              {error || "An error occurred during PDF generation."}
            </p>
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Close
            </button>
          </div>
        ) : !showSuccess ? (
          <>
            {/* Animated PDF Icon */}
            <div className="relative mb-8">
              <div className={`w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform ${isAnimationPaused ? '' : 'animate-pulse'}`}>
                <FileText className="w-10 h-10 text-white" />
              </div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 ${isAnimationPaused ? '' : 'animate-ping'}`}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: `${1.5 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative ${isAnimationPaused ? 'animate-pulse' : ''}`}
                  style={{ width: `${Math.max(5, progress)}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-2 font-medium">
                {Math.round(progress)}% Complete
              </div>
            </div>

            {/* Current Step */}
            <div className="mb-6">
              <div className="flex items-center justify-center space-x-3 mb-4">
                {React.createElement(steps[currentStep]?.icon || FileText, {
                  className: `w-6 h-6 ${steps[currentStep]?.color || 'text-blue-500'} ${isAnimationPaused ? 'animate-pulse' : 'animate-bounce'}`
                })}
                <span className="text-lg font-medium text-gray-800">
                  {steps[currentStep]?.label || 'Processing...'}
                </span>
              </div>
              
              {/* Step indicators */}
              <div className="flex justify-center space-x-2">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index <= currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125' 
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Dynamic medical tips based on progress */}
            <div className="text-sm text-gray-500 italic">
              {progress < 20 && "Analyzing patient demographics and medical history..."}
              {progress >= 20 && progress < 40 && "Cross-referencing medications for interactions and contraindications..."}
              {progress >= 40 && progress < 60 && "Applying clinical guidelines and evidence-based recommendations..."}
              {progress >= 60 && progress < 80 && "Generating Medicare-compliant documentation..."}
              {progress >= 80 && progress < 95 && "Finalizing professional report formatting..."}
              {progress >= 95 && "Quality assurance complete - preparing download..."}
            </div>
          </>
        ) : (
          /* Success Animation */
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              
              {/* Success particles */}
              {[...Array(12)].map((_, i) => (
                <Star
                  key={i}
                  className={`absolute w-4 h-4 text-yellow-400 animate-ping`}
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              PDF Generated Successfully! 🎉
            </h3>
            <p className="text-gray-600">
              Your professional medication review report is ready for download.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

export default PDFGenerationProgress 