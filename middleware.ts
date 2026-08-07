import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const DEV_PASSWORD = process.env.DEV_PASSWORD
  // If no DEV_PASSWORD is set, gate is disabled (production)
  if (!DEV_PASSWORD) return NextResponse.next()

  const auth = request.cookies.get('dev-auth')?.value
  if (auth === DEV_PASSWORD) return NextResponse.next()

  const url = request.nextUrl.clone()
  if (url.pathname === '/dev-login' || url.pathname.startsWith('/api/dev-auth')) {
    return NextResponse.next()
  }

  url.pathname = '/dev-login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
