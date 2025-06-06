'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  pharmacist: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata: any) => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [pharmacist, setPharmacist] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  
  // Always complete loading after 3 seconds max (reduced from 5)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && initialLoad) {
        console.log('AuthContext: Forcing initial loading state to complete after timeout');
        setLoading(false);
        setInitialLoad(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading, initialLoad]);
  
  // Check for required environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('AuthContext: Missing Supabase environment variables');
      setLoading(false);
      setInitialLoad(false);
      return;
    }
  }, []);
  
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('AuthContext: Initial session exists:', !!session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchPharmacist(session.user.id);
        } else {
          setPharmacist(null);
        }
      } catch (error) {
        console.error("AuthContext: Error during initial session fetch:", error);
        setUser(null);
        setPharmacist(null);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('AuthContext: Auth state changed:', event, 'Session exists:', !!session);
        
        // Only set loading for actual sign-in/sign-out events, not for token refreshes
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(true);
        }
        
        try {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchPharmacist(session.user.id);
          } else {
            setPharmacist(null);
          }
        } catch (error) {
          console.error("AuthContext: Error during auth state change:", error);
          setPharmacist(null);
        } finally {
          // Only set loading to false for sign-in/sign-out events
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    }
  }, [])

  const fetchPharmacist = async (userId: string) => {
    // Create a timeout promise that resolves after 3 seconds (reduced from 5)
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('AuthContext: fetchPharmacist timed out');
        resolve();
      }, 3000);
    });
    
    try {
      // Race between the actual fetch and the timeout
      await Promise.race([
        (async () => {
          const { data, error } = await supabase
            .from('pharmacists')
            .select('*')
            .eq('user_id', userId)
            .single()
          
          if (error) {
            console.warn('AuthContext: Error fetching pharmacist (this may be normal for new users):', error);
            setPharmacist(null);
            return;
          }
          
          if (data) {
            setPharmacist(data);
          } else {
            console.log('AuthContext: No pharmacist data found');
            setPharmacist(null);
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.error('AuthContext: Exception in fetchPharmacist:', error);
      setPharmacist(null);
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      pharmacist,
      loading,
      signIn,
      signUp,
      signOut,
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