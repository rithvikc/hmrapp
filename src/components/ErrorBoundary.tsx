'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Handle specific authentication errors
    const errorMessage = error.message || ''
    const isAuthError = errorMessage.includes('refresh_token_not_found') || 
                       errorMessage.includes('Invalid Refresh Token') ||
                       errorMessage.includes('Refresh Token Not Found') ||
                       errorMessage.includes('AuthApiError') ||
                       errorMessage.includes('invalid_grant')

    if (isAuthError) {
      console.log('ErrorBoundary: Authentication error detected, clearing all auth storage...')
      
      try {
        // Clear all potential auth storage
        localStorage.removeItem('sb-prcqfrmocyrbiqbbytcd-auth-token')
        localStorage.removeItem('supabase.auth.token')
        localStorage.removeItem('hmr-draft')
        localStorage.removeItem('hmr-store')
        sessionStorage.removeItem('selectedPlan')
        
        // Clear any other Supabase auth keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear session storage as well
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (storageError) {
        console.error('Error clearing storage:', storageError)
      }
      
      // Redirect to login after a short delay
      setTimeout(() => {
        // Only redirect if we're still on the same page and the error persists
        if (this.state.hasError) {
          window.location.href = '/login?error=session_expired'
        }
      }, 2000) // Reduced delay to 2 seconds for better UX
    }
    
    this.setState({ errorInfo })
  }

  handleRefresh = () => {
    // Clear potentially corrupted data
    try {
      localStorage.removeItem('hmr-draft')
      localStorage.removeItem('hmr-store')
      sessionStorage.removeItem('selectedPlan')
      
      // Clear auth storage if it's an auth error
      const isAuthError = this.state.error?.message?.includes('refresh_token_not_found') || 
                         this.state.error?.message?.includes('Invalid Refresh Token') ||
                         this.state.error?.message?.includes('Refresh Token Not Found') ||
                         this.state.error?.message?.includes('AuthApiError') ||
                         this.state.error?.message?.includes('invalid_grant')
      
      if (isAuthError) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
            localStorage.removeItem(key)
          }
        })
      }
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
    
    // Reload the page
    window.location.reload()
  }

  handleGoHome = () => {
    // Clear potentially corrupted data
    try {
      localStorage.removeItem('hmr-draft')
      localStorage.removeItem('hmr-store')
      sessionStorage.removeItem('selectedPlan')
      
      // Clear auth storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('supabase.auth') || key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
    
    // Go to login page
    window.location.href = '/login'
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || ''
      const isAuthError = errorMessage.includes('refresh_token_not_found') || 
                         errorMessage.includes('Invalid Refresh Token') ||
                         errorMessage.includes('Refresh Token Not Found') ||
                         errorMessage.includes('AuthApiError') ||
                         errorMessage.includes('invalid_grant')

      if (isAuthError) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
                  Session Expired
                </h2>
                <p className="text-gray-600 mb-6">
                  Your authentication session has expired. You will be redirected to the login page automatically.
                </p>
                <div className="flex items-center justify-center text-blue-600">
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                  <span className="font-medium">Redirecting to login...</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Login Now
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-8">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Error Details (Development):</h3>
                <p className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                    <pre className="text-xs text-red-600 mt-1 whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleRefresh}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                <Home className="h-4 w-4 mr-2" />
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 