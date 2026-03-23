import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Skip auth if Supabase is not configured (dev/demo mode)
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes that don't require auth
  const publicRoutes = ['/login', '/api/auth/callback']
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login
  if (user && pathname === '/login') {
    // Fetch profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const redirectUrl = request.nextUrl.clone()
    if (profile?.role === 'cook') {
      redirectUrl.pathname = '/visita'
    } else {
      redirectUrl.pathname = '/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Role-based route protection
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const role = profile?.role

    // Cook trying to access client routes
    if (
      role === 'cook' &&
      (pathname.startsWith('/dashboard') ||
        pathname.startsWith('/menus') ||
        pathname.startsWith('/recipes'))
    ) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/visita'
      return NextResponse.redirect(redirectUrl)
    }

    // Client trying to access cook routes
    if (
      role === 'client' &&
      (pathname.startsWith('/visita') ||
        pathname.startsWith('/recetas') ||
        pathname.startsWith('/lista'))
    ) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
