import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect old category URLs to new ones
  if (pathname === '/kategoria/deti-vesmir') {
    const redirectUrl = new URL('/kategoria/deti-a-vesmir', request.url)
    return NextResponse.redirect(redirectUrl, 301)
  }

  // Redirect non-existent category
  if (pathname === '/kategoria/vysvetlenia') {
    const redirectUrl = new URL('/kategoria/objav-dna', request.url)
    return NextResponse.redirect(redirectUrl, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
