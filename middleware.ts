import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Admin routes: require isAdmin, redirect to /admin/sign-in otherwise
    if (pathname.startsWith('/admin') && pathname !== '/admin/sign-in') {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin/sign-in', req.url))
      }
      return NextResponse.next()
    }

    // Authenticated user without a birthdate or username → force profile completion
    if (token && (!token.birthDate || !token.username) && pathname !== '/profile') {
      return NextResponse.redirect(new URL('/profile?required=1', req.url))
    }

    return NextResponse.next()
  },
  {
    pages: { signIn: '/sign-in' },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Admin routes are handled in the middleware function above
        if (pathname.startsWith('/admin')) return true
        // These routes require a logged-in user
        if (pathname.startsWith('/create') || pathname.startsWith('/edit')) {
          return !!token
        }
        // All other matched routes are publicly accessible
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/', '/create', '/edit/:path*', '/profile', '/explore', '/how-to', '/admin', '/admin/:path*'],
}
