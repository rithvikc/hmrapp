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

    // Get the current user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.log('Middleware: Auth error:', error.message)
    }
    
    // Only block API routes if authentication is required
    if (request.nextUrl.pathname.startsWith('/api/')) {
      // Allow these API routes without authentication
      const publicApiRoutes = [
        '/api/auth/',
        '/api/generate-hmr-pdf',
        '/api/process-pdf',
        '/api/send-hmr-report'
      ]
      
      const isPublicRoute = publicApiRoutes.some(route => 
        request.nextUrl.pathname.startsWith(route)
      )
      
      if (!isPublicRoute && !user) {
        console.log('Middleware: Blocking unauthenticated API request to:', request.nextUrl.pathname)
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      if (user) {
        console.log('Middleware: Authenticated user accessing:', request.nextUrl.pathname)
      }
    }

    // For dashboard routes, redirect to login if not authenticated
    if (request.nextUrl.pathname === '/dashboard' && !user && !error) {
      console.log('Middleware: Redirecting unauthenticated user to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }

  } catch (error) {
    console.error('Middleware error:', error)
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