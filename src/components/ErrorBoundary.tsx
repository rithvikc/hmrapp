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
    
    // Handle specific authentication errors - but only if they're actual errors
    if (error.message?.includes('refresh_token_not_found') || 
        error.message?.includes('Invalid Refresh Token') ||
        error.message?.includes('AuthApiError')) {
      console.log('ErrorBoundary: Authentication error detected, clearing storage...')
      
      // Clear potentially corrupted auth data
      localStorage.removeItem('sb-prcqfrmocyrbiqbbytcd-auth-token')
      localStorage.removeItem('hmr-draft')
      localStorage.removeItem('hmr-store')
      
      // Redirect to login after a longer delay to avoid interfering with normal navigation
      setTimeout(() => {
        // Only redirect if we're still on the same page and the error persists
        if (this.state.hasError) {
          window.location.href = '/login'
        }
      }, 5000) // Increased delay to 5 seconds
    }
    
    this.setState({ errorInfo })
  }

  handleRefresh = () => {
    // Clear potentially corrupted data
    localStorage.removeItem('hmr-draft')
    localStorage.removeItem('hmr-store')
    
    // Reload the page
    window.location.reload()
  }

  handleGoHome = () => {
    // Clear potentially corrupted data
    localStorage.removeItem('hmr-draft')
    localStorage.removeItem('hmr-store')
    
    // Go to login page
    window.location.href = '/login'
  }

  render() {
    if (this.state.hasError) {
      const isAuthError = this.state.error?.message?.includes('refresh_token_not_found') || 
                         this.state.error?.message?.includes('Invalid Refresh Token') ||
                         this.state.error?.message?.includes('AuthApiError')

      if (isAuthError) {
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <div className="mb-4">
                <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Authentication Session Expired
                </h2>
                <p className="text-gray-600 mb-6">
                  Your session has expired. You will be redirected to the login page automatically.
                </p>
                <div className="flex items-center justify-center text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span>Redirecting...</span>
                </div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Error Details:</h3>
                <p className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRefresh}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
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