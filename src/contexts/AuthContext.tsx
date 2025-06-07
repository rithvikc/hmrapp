'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
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
  const [pharmacist, setPharmacist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  
  // Ensure we're on the client side before initializing Supabase
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    let mounted = true
    let supabase: any = null
    
    try {
      supabase = createClient()
    } catch (error) {
      console.error('AuthContext: Failed to create Supabase client:', error)
      if (mounted) {
        setLoading(false)
      }
      return
    }
    
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        
        // Add timeout to prevent hanging
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
        )
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
        
        if (error) {
          console.error('AuthContext: Error getting session:', error)
        }
        
        if (mounted) {
          console.log('AuthContext: Initial session exists:', !!session)
          setUser(session?.user ?? null)
          setLoading(false) // Set loading to false first
          
          // Fetch pharmacist data asynchronously (don't block login)
          if (session?.user) {
            fetchPharmacist(session.user.id)
          } else {
            setPharmacist(null)
          }
        }
      } catch (error) {
        console.error('AuthContext: Error during initial session fetch:', error)
        if (mounted) {
          setUser(null)
          setPharmacist(null)
          setLoading(false)
        }
      }
    }

    const fetchPharmacist = async (userId: string) => {
      try {
        console.log('AuthContext: Fetching pharmacist for user:', userId)
        
        // Add timeout for pharmacist fetch
        const fetchPromise = supabase
          .from('pharmacists')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Pharmacist fetch timeout')), 3000)
        )
        
        const { data: existingPharmacist, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise])
        
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
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('AuthContext: Auth state changed:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id)
        
        if (!mounted) return
        
        // Handle different auth events
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setPharmacist(null)
          return
        }
        
        // For SIGNED_IN events, update user state immediately
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user ?? null)
          
          // Fetch pharmacist data asynchronously (don't block)
          if (session?.user) {
            fetchPharmacist(session.user.id)
          } else {
            setPharmacist(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [isClient])

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
      
      // Add timeout to sign in
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign in timeout')), 10000)
      )
      
      const { data, error } = await Promise.race([signInPromise, timeoutPromise])
      return { data, error }
    } catch (error) {
      console.error('AuthContext: Sign in failed:', error)
      return { 
        data: null, 
        error: { 
          message: error instanceof Error ? error.message : 'Sign in failed' 
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