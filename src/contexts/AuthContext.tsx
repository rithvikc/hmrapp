'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
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
  
  // Always complete loading after 10 seconds max
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.log('AuthContext: Forcing loading state to complete after timeout');
        setLoading(false);
      }
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  // Check for required environment variables
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('AuthContext: Missing Supabase environment variables');
      setLoading(false);
      return;
    }
  }, []);
  
  const supabase = createClient()

  useEffect(() => {
    setLoading(true); // Explicitly set loading to true at the start of the effect
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchPharmacist(session.user.id);
        } else {
          // If no session, ensure pharmacist is also null
          setPharmacist(null);
        }
      } catch (error) {
        console.error("AuthContext: Error during initial session fetch:", error);
        // setUser(null); // This was incorrect, user state is set based on session above
        setPharmacist(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true); // Set loading to true when auth state changes
        try {
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchPharmacist(session.user.id);
          } else {
            setPharmacist(null);
          }
        } catch (error) {
          console.error("AuthContext: Error during auth state change:", error);
          // Reset user and pharmacist on error during auth state change
          setPharmacist(null);
        } finally {
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      setLoading(false); // Ensure loading is false on cleanup if component unmounts
    }
  }, [])

  const fetchPharmacist = async (userId: string) => {
    // Create a timeout promise that resolves after 5 seconds
    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('AuthContext: fetchPharmacist timed out');
        resolve();
      }, 5000);
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