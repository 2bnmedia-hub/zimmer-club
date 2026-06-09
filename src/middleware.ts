import { NextRequest, NextResponse } from 'next/server'

const RESERVED_PATHS = [
  'search', 'hotels', 'camping', 'deals', 'advertise', 'find',
  'wishlist', 'auth', 'dashboard', 'properties', 'attractions', 'api',
  '_next', 'favicon.ico', 'logo.png', 'robots.txt', 'sitemap.xml',
]

const STATIC_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.mp4', '.mov', '.pdf', '.txt', '.xml', '.json',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length !== 1) return NextResponse.next()

  const slug = segments[0]

  if (RESERVED_PATHS.some(p => slug.startsWith(p))) return NextResponse.next()
  if (STATIC_EXTENSIONS.some(ext => slug.endsWith(ext))) return NextResponse.next()

  return NextResponse.rewrite(new URL(`/properties/${slug}`, request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
