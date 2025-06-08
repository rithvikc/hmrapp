'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  pharmacist: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signUp: (email: string, password: string, metadata: any) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pharmacist, setPharmacist] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const fetchPharmacist = useCallback(async (userId: string) => {
    try {
      console.log('AuthContext: Fetching pharmacist for user:', userId)
      const supabase = createClient()
      
      const { data: existingPharmacist, error: fetchError } = await supabase
        .from('pharmacists')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" - which is expected for new users
        console.error('AuthContext: Error fetching pharmacist:', fetchError)
        setPharmacist(null)
        return
      }
      
      if (existingPharmacist) {
        console.log('AuthContext: Found existing pharmacist:', existingPharmacist.name)
        setPharmacist(existingPharmacist)
      } else {
        console.log('AuthContext: No pharmacist record found for user')
        setPharmacist(null)
      }
    } catch (error) {
      console.error('AuthContext: Exception in fetchPharmacist:', error)
      setPharmacist(null)
    }
  }, [])

  useEffect(() => {
    if (!isClient) return

    let mounted = true
    const supabase = createClient()

    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
          
          // Handle specific refresh token errors
          if (error.message?.includes('refresh_token_not_found') || 
              error.message?.includes('Invalid Refresh Token')) {
            console.log('AuthContext: Invalid refresh token detected, clearing session...')
            try {
              await supabase.auth.signOut()
            } catch (signOutError) {
              console.error('AuthContext: Error signing out after refresh token error:', signOutError)
            }
          }
        }
        
        if (mounted) {
          console.log('AuthContext: Initial session check complete. Session exists:', !!session)
          setUser(session?.user ?? null)
          
          // Fetch pharmacist data asynchronously (don't block loading state)
          if (session?.user) {
            fetchPharmacist(session.user.id)
          } else {
            setPharmacist(null)
          }
          
          // Always set loading to false after initial check
          console.log('AuthContext: Setting loading to false after initial session check')
          setLoading(false)
        }
      } catch (error) {
        console.error('AuthContext: Error during initial session fetch:', error)
        if (mounted) {
          setUser(null)
          setPharmacist(null)
          console.log('AuthContext: Setting loading to false after error')
          setLoading(false)
        }
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('AuthContext: Auth state changed:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id)
        
        if (!mounted) return
        
        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setPharmacist(null)
          setLoading(false) // Ensure loading is false
          return
        }
        
        // Handle token refresh errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.log('AuthContext: Token refresh failed, clearing session...')
          setUser(null)
          setPharmacist(null)
          setLoading(false)
          return
        }
        
        // For SIGNED_IN events, update user state immediately
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          setLoading(false) // Ensure loading is false
          
          // Fetch pharmacist data asynchronously (don't block)
          if (session?.user) {
            fetchPharmacist(session.user.id)
          }
        }
        
        // For any other events, ensure loading is false
        if (event === 'INITIAL_SESSION') {
          setLoading(false)
        }
      }
    )

    // Get initial session
    getInitialSession()

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isClient, fetchPharmacist])

  const createPharmacistRecord = async (user: User, metadata: any) => {
    try {
      console.log('AuthContext: Creating pharmacist record for user:', user.id)
      const supabase = createClient()
      
      const { data: pharmacist, error } = await supabase
        .from('pharmacists')
        .insert({
          user_id: user.id,
          email: user.email!,
          name: metadata.name || user.user_metadata?.full_name || user.email,
          registration_number: metadata.registration_number || null,
          phone: metadata.phone || null,
          practice_name: metadata.practice || null,
          practice_address: metadata.location || null,
        })
        .select()
        .single()

      if (error) {
        console.error('AuthContext: Error creating pharmacist record:', error)
        throw error
      }

      console.log('AuthContext: Pharmacist record created successfully')
      setPharmacist(pharmacist)
      return pharmacist
    } catch (error) {
      console.error('AuthContext: Exception creating pharmacist record:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Signing in with email/password')
    
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('AuthContext: Sign in error:', error)
        return { data, error }
      }
      
      console.log('AuthContext: Sign in successful')
      return { data, error: null }
      
    } catch (error) {
      console.error('AuthContext: Sign in failed:', error)
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'Sign in failed - please try again' 
        } 
      }
    }
  }

  const signInWithGoogle = async () => {
    console.log('AuthContext: Signing in with Google')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      })
      return { data, error }
    } catch (error) {
      console.error('AuthContext: Google sign in failed:', error)
      return { 
        data: null, 
        error: { 
          message: 'Google sign in failed' 
        } 
      }
    }
  }

  const signUp = async (email: string, password: string, metadata: any) => {
    console.log('AuthContext: Starting signup process...')
    
    try {
      const supabase = createClient()
      // Step 1: Create the auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.name,
            ...metadata
          }
        }
      })
      
      // If there was an auth error, return it immediately
      if (error) {
        console.error('AuthContext: Auth signup failed:', error)
        return { data, error }
      }
      
      // If signup was successful and we have a user, create the pharmacist record
      if (data.user && !data.user.email_confirmed_at) {
        console.log('AuthContext: User signup successful, awaiting email confirmation')
        // For email confirmation flow, we'll create the pharmacist record after confirmation
        return { data, error: null }
      } else if (data.user) {
        console.log('AuthContext: User signup successful, creating pharmacist record')
        try {
          await createPharmacistRecord(data.user, metadata)
          return { data, error: null }
        } catch (createError) {
          console.error('AuthContext: Failed to create pharmacist record:', createError)
          // Don't delete the user here as it's handled by Supabase Auth
          return { 
            data: null, 
            error: { 
              message: 'Account created but profile setup failed. Please contact support.'
            } 
          }
        }
      }
      
      return { data, error }
      
    } catch (error) {
      console.error('AuthContext: Unexpected error during signup:', error)
      return { 
        data: null, 
        error: { 
          message: 'An unexpected error occurred. Please try again.'
        } 
      }
    }
  }

  const resetPassword = async (email: string) => {
    console.log('AuthContext: Sending password reset email')
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      return { data, error }
    } catch (error) {
      console.error('AuthContext: Password reset failed:', error)
      return { 
        data: null, 
        error: { 
          message: 'Password reset failed' 
        } 
      }
    }
  }

  const signOut = async () => {
    console.log('AuthContext: Signing out')
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('AuthContext: Sign out failed:', error)
    }
  }

  // Show loading state until client-side initialization is complete
  if (!isClient) {
    return (
      <AuthContext.Provider value={{
        user: null,
        pharmacist: null,
        loading: true,
        signIn: async () => ({ data: null, error: { message: 'Initializing...' } }),
        signInWithGoogle: async () => ({ data: null, error: { message: 'Initializing...' } }),
        signUp: async () => ({ data: null, error: { message: 'Initializing...' } }),
        signOut: async () => {},
        resetPassword: async () => ({ data: null, error: { message: 'Initializing...' } }),
      }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{
      user,
      pharmacist,
      loading,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 