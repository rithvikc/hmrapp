'use client'

import Header from '@/components/Header'
import LandingPage from '@/components/LandingPage'
import MainApp from '@/components/MainApp'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('[DEBUG] Error caught by boundary:', error)
      setHasError(true)
    }

    window.addEventListener('error', errorHandler)
    return () => window.removeEventListener('error', errorHandler)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please try refreshing the page.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [forceRender, setForceRender] = useState(false)
  
  // Force render after 5 seconds regardless of loading state
  useEffect(() => {
    console.log("[DEBUG] HomePage: Initial render, loading =", loading, "user =", !!user)
    
    const timer = setTimeout(() => {
      console.log("[DEBUG] HomePage: Forcing render after timeout")
      setForceRender(true)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [])

  // Either loading is done OR we're forcing the render
  if (loading && !forceRender) {
    console.log("[DEBUG] HomePage: Showing loading spinner")
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  console.log("[DEBUG] HomePage: Rendering main content, user =", !!user)
  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        <ErrorBoundary>
          <MainApp />
        </ErrorBoundary>
      ) : (
        <>
          <Header />
          <LandingPage />
        </>
      )}
    </div>
  )
}
