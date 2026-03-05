import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // If authenticated but birthDate not set, force them to complete profile
    if (token && !token.birthDate && pathname !== '/profile') {
      return NextResponse.redirect(new URL('/profile?required=1', req.url))
    }

    return NextResponse.next()
  },
  {
    pages: { signIn: '/sign-in' },
  }
)

export const config = {
  matcher: ['/create', '/edit/:path*', '/profile'],
}
