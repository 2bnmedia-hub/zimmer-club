import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const DEV_PASSWORD = process.env.DEV_PASSWORD
  if (!DEV_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const password = typeof body === 'object' && body !== null
    ? (body as Record<string, unknown>).password
    : undefined

  if (typeof password !== 'string' || password !== DEV_PASSWORD) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('dev-auth', DEV_PASSWORD, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86400,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}
