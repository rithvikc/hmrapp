import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    // Check if we have the required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Middleware: Missing Supabase environment variables')
      return response
    }

    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Log the request path for debugging
    console.log('Middleware: Processing request for:', request.nextUrl.pathname);
    
    // Get the current user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Middleware: Auth error:', error.message);
      // Add debug headers if in development mode
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('X-Auth-Error', error.message);
      }
    } else if (user) {
      console.log('Middleware: Authenticated user:', user.id, 'accessing:', request.nextUrl.pathname);
      // Add debug headers if in development mode
      if (process.env.NODE_ENV === 'development') {
        response.headers.set('X-Auth-User-Id', user.id);
      }
    } else {
      console.log('Middleware: No authenticated user for:', request.nextUrl.pathname);
    }
    
    // Only block API routes if authentication is required
    if (request.nextUrl.pathname.startsWith('/api/')) {
      // Allow these API routes without authentication
      const publicApiRoutes = [
        '/api/auth/',
        '/api/process-pdf',
        '/api/send-hmr-report'
      ]
      
      const isPublicRoute = publicApiRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      )
      
      if (!isPublicRoute && !user) {
        console.log('Middleware: Blocking unauthenticated API request to:', request.nextUrl.pathname)
        return NextResponse.json(
          { 
            error: 'Authentication required',
            message: 'Please log in to access this resource' 
          }, 
          { status: 401 }
        )
      }
    }

    // For dashboard routes, redirect to login if not authenticated
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user && !error) {
      console.log('Middleware: Redirecting unauthenticated user to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

  } catch (error) {
    console.error('Middleware error:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error && error.stack) {
      console.error('Middleware error stack:', error.stack)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 