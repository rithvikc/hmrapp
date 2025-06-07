'use client'

import React, { useState, useEffect } from 'react'
import { FileText, Zap, CheckCircle, Star, Pill, Heart, Activity } from 'lucide-react'

interface PDFGenerationProgressProps {
  isVisible: boolean
  onComplete?: () => void
}

const PDFGenerationProgress: React.FC<PDFGenerationProgressProps> = ({ 
  isVisible, 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const steps = [
    { label: 'Analyzing patient data', icon: Heart, color: 'text-red-500' },
    { label: 'Processing medications', icon: Pill, color: 'text-blue-500' },
    { label: 'Generating recommendations', icon: Activity, color: 'text-green-500' },
    { label: 'Formatting document', icon: FileText, color: 'text-purple-500' },
    { label: 'Finalizing PDF', icon: Zap, color: 'text-yellow-500' }
  ]

  useEffect(() => {
    if (!isVisible) {
      setProgress(0)
      setCurrentStep(0)
      setShowSuccess(false)
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15 + 5
        
        // Update current step based on progress
        const stepIndex = Math.floor((newProgress / 100) * steps.length)
        setCurrentStep(Math.min(stepIndex, steps.length - 1))
        
        if (newProgress >= 100) {
          clearInterval(interval)
          setShowSuccess(true)
          setTimeout(() => {
            onComplete?.()
          }, 1500)
          return 100
        }
        
        return newProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [isVisible, onComplete, steps.length])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {!showSuccess ? (
          <>
            {/* Animated PDF Icon */}
            <div className="relative mb-8">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform animate-pulse">
                <FileText className="w-10 h-10 text-white" />
              </div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-ping`}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${progress}%` }}
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
                  className: `w-6 h-6 ${steps[currentStep]?.color || 'text-blue-500'} animate-bounce`
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

            {/* Fun medical facts */}
            <div className="text-sm text-gray-500 italic">
              {progress < 25 && "Did you know? The average person takes 4 different medications daily."}
              {progress >= 25 && progress < 50 && "Pharmacist tip: Medication reviews reduce adverse events by 70%."}
              {progress >= 50 && progress < 75 && "Quality assurance: Ensuring all clinical guidelines are met."}
              {progress >= 75 && "Almost ready! Your professional report is being finalized."}
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
              Your professional medication review report is ready.
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