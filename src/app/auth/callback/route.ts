import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

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
      const meta = user.user_metadata
      const updates: Record<string, string> = {}

      if (meta?.full_name) updates.full_name = meta.full_name
      else if (meta?.name) updates.full_name = meta.name

      if (meta?.avatar_url) updates.avatar_url = meta.avatar_url
      else if (meta?.picture) updates.avatar_url = meta.picture

      if (Object.keys(updates).length > 0) {
        await supabase.from('profiles').update(updates).eq('id', user.id)
      }
    }
  }

  return NextResponse.redirect(new URL('/', request.url))
}
