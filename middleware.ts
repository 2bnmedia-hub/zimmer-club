import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PASSWORD = 'zimmer2024'

export function middleware(request: NextRequest) {
  const auth = request.cookies.get('dev-auth')?.value
  if (auth === PASSWORD) return NextResponse.next()

  const url = request.nextUrl.clone()
  if (url.pathname === '/dev-login') return NextResponse.next()

  url.pathname = '/dev-login'
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|dev-login).*)'],
}
