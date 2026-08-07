import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  let metaRedirect: string | undefined

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // If user came from the register page (pending_role cookie set) but account already
      // existed (created_at > 2 minutes ago), block as duplicate registration.
      const pendingRole = request.cookies.get('pending_role')?.value
      const isFromRegisterPage = pendingRole === 'guest' || pendingRole === 'owner'
      const ageMs = user.created_at
        ? Date.now() - new Date(user.created_at).getTime()
        : Infinity
      const isExistingUser = ageMs > 120_000

      if (isFromRegisterPage && isExistingUser) {
        await supabase.auth.signOut()
        const res = NextResponse.redirect(
          new URL('/auth/login?notice=already_registered', request.url)
        )
        res.cookies.set('pending_role', '', { maxAge: 0, path: '/' })
        res.cookies.set('pending_redirect', '', { maxAge: 0, path: '/' })
        return res
      }

      const meta = user.user_metadata
      const updates: Record<string, string> = {}

      if (user.email) updates.email = user.email

      if (meta?.full_name) updates.full_name = meta.full_name
      else if (meta?.name) updates.full_name = meta.name

      // Pull profile photo from Google/Facebook automatically
      if (meta?.avatar_url) updates.avatar_url = meta.avatar_url
      else if (meta?.picture) updates.avatar_url = meta.picture

      if (isFromRegisterPage) updates.role = pendingRole as string

      if (Object.keys(updates).length > 0) {
        const adminClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } }
        )
        await adminClient.from('profiles').upsert({ id: user.id, ...updates })
      }

      // Read pending_redirect from user metadata (set at email signup for owners)
      if (typeof meta?.pending_redirect === 'string' && meta.pending_redirect) {
        metaRedirect = meta.pending_redirect
        await supabase.auth.updateUser({ data: { pending_redirect: null } })
      }
    }
  }

  const redirectParam = requestUrl.searchParams.get('redirect')
  const pendingRedirect = request.cookies.get('pending_redirect')?.value
  const destination = redirectParam || pendingRedirect || metaRedirect || '/'

  const response = NextResponse.redirect(new URL(destination, request.url))
  response.cookies.set('pending_role', '', { maxAge: 0, path: '/' })
  response.cookies.set('pending_redirect', '', { maxAge: 0, path: '/' })
  return response
}
