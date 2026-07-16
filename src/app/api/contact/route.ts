import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await req.json()
  const { full_name, phone, email, property_type, message } = body

  const { data: contacts } = await supabase
    .from('admin_contacts')
    .select('type, value, label')
    .eq('active', true)

  const emailContacts = contacts?.filter(c => c.type === 'email') || []
  const whatsappContacts = contacts?.filter(c => c.type === 'whatsapp') || []

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

  try {
    if (emailContacts.length > 0) {
      await resend.emails.send({
        from: 'noreply@zimmer.club',
        to: emailContacts.map(c => c.value),
        subject: `פנייה חדשה מ-zimmer.club — ${full_name}`,
        html: htmlBody,
      })
    }

    for (const wa of whatsappContacts) {
      const text = encodeURIComponent(`פנייה חדשה מ-zimmer.club\nשם: ${full_name}\nטלפון: ${phone}\nאימייל: ${email || 'לא הוזן'}\nסוג נכס: ${property_type || 'לא הוזן'}\nהערות: ${message || 'אין'}`)
      console.log(`WhatsApp ${wa.value}: https://wa.me/${wa.value}?text=${text}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('contact error:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
