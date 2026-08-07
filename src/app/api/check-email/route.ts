import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ exists: false })
    }

    const normalized = email.trim().toLowerCase()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!serviceRoleKey) {
      console.error('[check-email] SUPABASE_SERVICE_ROLE_KEY is missing')
      return NextResponse.json({ exists: false })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    // Layer 1: RPC (if SQL function was created in Supabase)
    const { data: rpcResult, error: rpcError } = await adminClient.rpc(
      'check_email_registered',
      { email_input: normalized }
    )
    if (!rpcError) {
      console.log(`[check-email] RPC result for ${normalized}: ${rpcResult}`)
      return NextResponse.json({ exists: rpcResult === true })
    }
    console.log(`[check-email] RPC not available (${rpcError.message}), falling back to listUsers`)

    // Layer 2: admin.listUsers reads directly from auth.users
    const { data: listData, error: listError } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    })

    if (listError) {
      console.error(`[check-email] listUsers error: ${listError.message}`)
      return NextResponse.json({ exists: false })
    }

    const users = listData?.users ?? []
    console.log(`[check-email] listUsers returned ${users.length} users, searching for ${normalized}`)
    const found = users.some(u => u.email?.toLowerCase() === normalized)
    console.log(`[check-email] found=${found}`)
    return NextResponse.json({ exists: found })

  } catch (err) {
    console.error('[check-email] unexpected error:', err)
    return NextResponse.json({ exists: false })
  }
}
