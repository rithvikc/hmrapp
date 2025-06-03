'use client'

import Header from '@/components/Header'
import LandingPage from '@/components/LandingPage'
import MainApp from '@/components/MainApp'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Simple error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const errorHandler = (error: ErrorEvent) => {
      console.error('[DEBUG] Error caught by boundary:', error)
      console.error('[DEBUG] Error message:', error.message)
      console.error('[DEBUG] Error filename:', error.filename)
      console.error('[DEBUG] Error lineno:', error.lineno)
      console.error('[DEBUG] Error stack:', error.error?.stack)
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
              The application encountered an error. Check the browser console for details.
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
  const router = useRouter()

  // Navigation protection - prevent accidental logout on back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (user) {
        // User is logged in, prevent navigation away
        event.preventDefault()
        window.history.pushState(null, '', window.location.href)
      }
    }

    // Add popstate listener
    window.addEventListener('popstate', handlePopState)
    
    // Push initial state to prevent back navigation
    if (user) {
      window.history.pushState(null, '', window.location.href)
    }

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [user])

  useEffect(() => {
    console.log('[DEBUG] HomePage: Auth state changed - user:', !!user, 'loading:', loading)
    
    if (!loading && !user) {
      console.log('[DEBUG] HomePage: No user found, redirecting to signin')
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  // If user is authenticated, show app immediately without loading screen
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainApp />
      </div>
    )
  }

  // Only show loading screen during initial authentication check
  if (loading) {
    console.log('[DEBUG] HomePage: Showing loading spinner')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // User is not authenticated and not loading - will redirect to signin
  return null
}
