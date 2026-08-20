import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function sanitize(val: unknown, maxLen = 500): string {
  if (typeof val !== 'string') return ''
  return escapeHtml(val.trim().slice(0, maxLen))
}

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ ok: false, error: 'invalid body' }, { status: 400 })
  }

  const raw = body as Record<string, unknown>
  const full_name    = sanitize(raw.full_name, 120)
  const phone        = sanitize(raw.phone, 20)
  const email        = sanitize(raw.email, 200)
  const property_type = sanitize(raw.property_type, 50)
  const message      = sanitize(raw.message, 1000)

  if (!full_name || !phone) {
    return NextResponse.json({ ok: false, error: 'missing required fields' }, { status: 400 })
  }

  const { data: contacts } = await supabase
    .from('admin_contacts')
    .select('type, value, label')
    .eq('active', true)

  const emailContacts = contacts?.filter(c => c.type === 'email') || []

  const htmlBody = `
    <div dir="rtl" style="font-family:Arial;padding:20px;max-width:600px">
      <h2 style="color:#8B6914">פנייה חדשה מדף פרסמו אצלנו</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;font-weight:bold">שם:</td><td style="padding:8px">${full_name}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">טלפון:</td><td style="padding:8px">${phone}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">אימייל:</td><td style="padding:8px">${email || 'לא הוזן'}</td></tr>
        <tr style="background:#f9f9f9"><td style="padding:8px;font-weight:bold">סוג נכס:</td><td style="padding:8px">${property_type || 'לא הוזן'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold">הערות:</td><td style="padding:8px">${message || 'אין'}</td></tr>
      </table>
    </div>
  `

  const BUSINESS_EMAILS = ['2bnbussiness@gmail.com', 'zimmer.club.israel@gmail.com']

  const extraEmails = emailContacts
    .map(c => c.value)
    .filter((v: string) => !BUSINESS_EMAILS.includes(v))

  const allRecipients = [...BUSINESS_EMAILS, ...extraEmails]

  try {
    await resend.emails.send({
      from: 'noreply@zimmer.club',
      to: allRecipients,
      subject: 'התקבלה פניה מלקוח המעוניין לפרסם באתר',
      html: htmlBody,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
