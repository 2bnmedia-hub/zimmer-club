import { NextRequest, NextResponse } from 'next/server'

// כל הנתיבים הקיימים באתר שלא נגע בהם
const RESERVED_PATHS = [
  'search', 'hotels', 'camping', 'deals', 'advertise', 'find',
  'wishlist', 'auth', 'dashboard', 'properties', 'api',
  '_next', 'favicon.ico', 'logo.png', 'robots.txt', 'sitemap.xml',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // רק נתיבים בשורש (ללא / נוסף)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return NextResponse.next()

  const slug = segments[0]

  // דלג על נתיבים שמורים
  if (RESERVED_PATHS.some(p => slug.startsWith(p))) return NextResponse.next()

  // הפנה לדף הנכס
  return NextResponse.rewrite(new URL(`/properties/${slug}`, request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
