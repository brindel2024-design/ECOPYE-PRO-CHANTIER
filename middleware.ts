import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirection admin : non-admin tentant /admin -> /app/dashboard
    if (pathname.startsWith('/admin') && token?.role !== 'ECOPYE_ADMIN') {
      return NextResponse.redirect(new URL('/app/dashboard', req.url))
    }

    const res = NextResponse.next()
    // Empêcher l'indexation des zones privées
    res.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    return res
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname
        if (pathname.startsWith('/app') || pathname.startsWith('/admin')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/app/:path*', '/admin/:path*'],
}
