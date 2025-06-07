import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
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

    // This will refresh the session if needed
    const { data: { user } } = await supabase.auth.getUser()
    
    // For API routes, ensure user is authenticated
    if (request.nextUrl.pathname.startsWith('/api/') && 
        !request.nextUrl.pathname.startsWith('/api/auth/') &&
        !request.nextUrl.pathname.startsWith('/api/generate-hmr-pdf') && 
        !user) {
      console.log('Middleware: Blocking unauthenticated API request to:', request.nextUrl.pathname)
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
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