import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function getAuthenticatedUser(request?: NextRequest) {
  try {
    // Method 1: Try with cookies() from next/headers (for API routes)
    if (!request) {
      const cookieStore = await cookies()
      
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
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

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && !error) {
        return { user, error: null }
      }
    }

    // Method 2: Try with request cookies (for middleware)
    if (request) {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set() {
              // No-op for request-based auth check
            },
            remove() {
              // No-op for request-based auth check
            },
          },
        }
      )

      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && !error) {
        return { user, error: null }
      }
    }

    // Method 3: Try with authorization header as fallback
    if (request) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7)
        
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
          return { user, error: null }
        }
      }
    }

    return { user: null, error: 'No valid authentication found' }
  } catch (error) {
    console.error('Authentication error:', error)
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