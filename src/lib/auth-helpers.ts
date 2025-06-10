import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function getAuthenticatedUser(request?: NextRequest) {
  try {
    console.log('Auth helpers: Starting authentication check...');
    
    // Method 1: Try with cookies() from next/headers (for API routes)
    if (!request) {
      console.log('Auth helpers: Using cookies() method...');
      const cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              const cookie = cookieStore.get(name)?.value
              console.log(`Auth helpers: Getting cookie ${name}:`, cookie ? 'present' : 'missing')
              return cookie
            },
            set(name: string, value: string, options: CookieOptions) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: CookieOptions) {
              cookieStore.set({ name, value: '', ...options })
            },
          },
        }
      )
      
      console.log('Auth helpers: Checking user session...')
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.log('Auth helpers: Error getting user:', error.message)
        return { user: null, error: error.message }
      }
      
      if (!user) {
        console.log('Auth helpers: No user found in session')
        return { user: null, error: 'No user found' }
      }
      
      console.log('Auth helpers: User found:', user.id)
      return { user, error: null }
    }
    
    // Method 2: Try with request cookies (for middleware)
    console.log('Auth helpers: Using request cookies method...')
    
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = request.cookies.get(name)?.value
            console.log(`Auth helpers: Getting request cookie ${name}:`, cookie ? 'present' : 'missing')
            return cookie
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            request.cookies.set({ name, value: '', ...options })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    console.log('Auth helpers: Checking user session with request cookies...')
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Auth helpers: Error getting user from request:', error.message)
      return { user: null, error: error.message }
    }
    
    if (!user) {
      console.log('Auth helpers: No user found in request session')
      return { user: null, error: 'No user found' }
    }
    
    console.log('Auth helpers: User found from request:', user.id)
    return { user, error: null }
    
  } catch (error) {
    console.error('Auth helpers: Exception during authentication:', error)
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Authentication failed' 
    }
  }
}

// Enhanced auth helper that also fetches pharmacist data
export async function getAuthenticatedUserWithPharmacist(request?: NextRequest) {
  try {
    console.log('Auth helpers: Starting enhanced authentication check...');
    
    const authResult = await getAuthenticatedUser(request);
    
    if (!authResult.user) {
      return { user: null, pharmacist: null, error: authResult.error };
    }
    
    // Create Supabase client to fetch pharmacist data
    const supabase = createAuthenticatedSupabaseClient(request);
    
    console.log('Auth helpers: Fetching pharmacist data for user:', authResult.user.id);
    
    const { data: pharmacist, error: pharmacistError } = await supabase
      .from('pharmacists')
      .select('*')
      .eq('user_id', authResult.user.id)
      .single();
    
    if (pharmacistError) {
      console.log('Auth helpers: Error fetching pharmacist:', pharmacistError.message);
      return { 
        user: authResult.user, 
        pharmacist: null, 
        error: `Pharmacist data not found: ${pharmacistError.message}` 
      };
    }
    
    if (!pharmacist) {
      console.log('Auth helpers: No pharmacist record found for user');
      return { 
        user: authResult.user, 
        pharmacist: null, 
        error: 'Pharmacist profile not found' 
      };
    }
    
    console.log('Auth helpers: Pharmacist found:', pharmacist.name);
    return { user: authResult.user, pharmacist, error: null };
    
  } catch (error) {
    console.error('Auth helpers: Exception during enhanced authentication:', error);
    return { 
      user: null, 
      pharmacist: null,
      error: error instanceof Error ? error.message : 'Authentication failed' 
    };
  }
}

export function createAuthenticatedSupabaseClient(request?: NextRequest) {
  if (request) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set() {
            // No-op for request-based client
          },
          remove() {
            // No-op for request-based client
          },
        },
      }
    )
  }

  // For API routes without request object
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
} 