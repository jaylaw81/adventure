import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Authenticated user without a birthdate → force profile completion
    if (token && !token.birthDate && pathname !== '/profile') {
      return NextResponse.redirect(new URL('/profile?required=1', req.url))
    }

    return NextResponse.next()
  },
  {
    pages: { signIn: '/sign-in' },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // These routes require a logged-in user
        if (pathname.startsWith('/create') || pathname.startsWith('/edit')) {
          return !!token
        }
        // All other matched routes are publicly accessible;
        // the middleware function above handles the birthdate redirect for logged-in users
        return true
      },
    },
  }
)

export const config = {
  // Include every route that should enforce the birthdate gate for logged-in users,
  // plus the auth-required routes
  matcher: ['/', '/create', '/edit/:path*', '/profile', '/explore', '/how-to'],
}
