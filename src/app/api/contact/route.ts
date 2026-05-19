import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { full_name, phone, email, property_type, message } = body
  try {
    await resend.emails.send({
      from: 'noreply@zimmer.club',
      to: '2bnbussiness@gmail.com',
      subject: `פנייה חדשה מ-zimmer.club — ${full_name}`,
      html: `<div dir="rtl" style="font-family:Arial;padding:20px"><h2>פנייה חדשה מדף פרסמו אצלנו</h2><p><strong>שם:</strong> ${full_name}</p><p><strong>טלפון:</strong> ${phone}</p><p><strong>אימייל:</strong> ${email || 'לא הוזן'}</p><p><strong>סוג נכס:</strong> ${property_type || 'לא הוזן'}</p><p><strong>הערות:</strong> ${message || 'אין'}</p></div>`,
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
