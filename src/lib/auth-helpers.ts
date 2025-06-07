import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest } from 'next/server'
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
      
      console.log('Auth helpers: Checking user with cookies method...');
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && !error) {
        console.log('Auth helpers: User authenticated via cookies:', user.id);
        return { user, error: null }
      } else if (error) {
        console.log('Auth helpers: Cookies method error:', error.message);
      }
    }

    // Method 2: Try with request cookies (for middleware)
    if (request) {
      console.log('Auth helpers: Using request cookies method...');
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
            set() {},
            remove() {},
          },
        }
      )
      
      console.log('Auth helpers: Checking user with request method...');
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && !error) {
        console.log('Auth helpers: User authenticated via request cookies:', user.id);
        return { user, error: null }
      } else if (error) {
        console.log('Auth helpers: Request method error:', error.message);
      }
    }

    // Method 3: Try with authorization header as fallback
    if (request) {
      console.log('Auth helpers: Trying authorization header...');
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        console.log('Auth helpers: Found authorization header');
        
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              get() { return undefined },
              set() {},
              remove() {},
            },
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          }
        )
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (user && !error) {
          console.log('Auth helpers: User authenticated via header:', user.id);
          return { user, error: null }
        } else if (error) {
          console.log('Auth helpers: Header method error:', error.message);
        }
      } else {
        console.log('Auth helpers: No authorization header found');
      }
    }

    console.log('Auth helpers: No valid authentication found');
    return { user: null, error: 'No valid authentication found' }
  } catch (error) {
    console.error('Auth helpers: Exception in authentication:', error)
    return { user: null, error: error instanceof Error ? error.message : 'Authentication failed' }
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