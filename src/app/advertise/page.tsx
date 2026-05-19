'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Users, Star, TrendingUp, Phone, Mail, User, Home, ArrowRight } from 'lucide-react'

const PROPERTY_TYPES = [
  { value: 'zimmer', label: 'צימר' },
  { value: 'villa', label: 'וילה / בקתה' },
  { value: 'hotel', label: 'מלון / בוטיק' },
  { value: 'camping', label: 'קמפינג / גלמפינג' },
  { value: 'other', label: 'אחר' },
]

const BENEFITS = [
  {
    icon: Users,
    title: 'קהל יעד ממוקד',
    desc: 'אלפי גולשים מחפשים צימרים ונכסי נופש בישראל בכל יום — ישירות אצלנו.',
  },
  {
    icon: TrendingUp,
    title: 'חשיפה מקסימלית',
    desc: 'הנכס שלך מופיע בתוצאות חיפוש, בדפי איזור, ובניוזלטר שלנו.',
  },
  {
    icon: Star,
    title: 'ניהול פשוט',
    desc: 'לוח בקרה נוח לניהול תאריכים, תמונות, מחירים וביקורות — הכל במקום אחד.',
  },
  {
    icon: CheckCircle,
    title: 'הרשמה חינמית',
    desc: 'הצטרפות ופרסום ראשוני ללא עלות. שדרוגים פרימיום זמינים בהמשך.',
  },
]

export default function AdvertisePage() {
  const supabase = createClient()
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    property_type: '',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    // שמירה ב-Supabase
    const { error: insertError } = await supabase.from('leads').insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      property_type: form.property_type || null,
      message: form.message || null,
    })

    if (insertError) {
      setError('אירעה שגיאה, נסה שוב.')
      setSubmitting(false)
      return
    }

    // שליחה לאימייל
    try {
      await fetch('https://formsubmit.co/ajax/2bnbussiness@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          שם: form.full_name,
          טלפון: form.phone,
          אימייל: form.email || 'לא הוזן',
          סוג_נכס: form.property_type || 'לא הוזן',
          הערות: form.message || 'אין',
          _subject: `פנייה חדשה מ-zimmer.club — ${form.full_name}`,
        }),
      })
    } catch (_) {}

    setSubmitted(true)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Hero קומפקטי */}
      <div className="relative bg-espresso text-white py-10 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'url(/hero-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-5xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white mb-4 transition-colors">
            <ArrowRight className="w-4 h-4" />
            חזרה לדף הבית
          </Link>
          <h1 className="text-3xl font-bold mb-2">פרסמו את הנכס שלכם</h1>
          <p className="text-base text-white/70 max-w-xl mx-auto">
            הצטרפו לרשת הצימרים והנכסים המובילה בישראל — וקבלו חשיפה לאלפי מטיילים בכל חודש
          </p>
        </div>
      </div>

      {/* תוכן ראשי — שתי עמודות */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* עמודה שמאל — 4 כרטיסים */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">למה לפרסם ב-zimmer.club?</h2>
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-5 shadow-sm flex gap-4 group cursor-default">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md"
                  style={{ backgroundColor: '#FDF3DC' }}
                >
                  <b.icon
                    className="w-5 h-5 transition-all duration-300 group-hover:rotate-12"
                    style={{ color: '#8B6914' }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* עמודה ימין — טופס */}
          <div className="w-full lg:w-1/2" id="form">
            <div className="bg-white rounded-2xl shadow-sm p-7">
              <h2 className="text-xl font-bold text-gray-900 mb-1">השאירו פרטים</h2>
              <p className="text-sm text-gray-500 mb-5">ניצור איתכם קשר תוך יום עסקים</p>

              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#FDF3DC' }}>
                    <CheckCircle className="w-8 h-8" style={{ color: '#8B6914' }} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">תודה! קיבלנו את הפרטים</h3>
                  <p className="text-sm text-gray-500">ניצור איתך קשר בהקדם כדי להעלות את הנכס שלך לאוויר.</p>
                  <Link href="/" className="inline-block mt-6 text-sm font-medium hover:underline"
                    style={{ color: '#8B6914' }}>
                    חזרה לדף הבית
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא *</label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="full_name" value={form.full_name} onChange={handleChange} required
                        placeholder="ישראל ישראלי"
                        className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">טלפון *</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="phone" value={form.phone} onChange={handleChange} required type="tel"
                        placeholder="050-0000000"
                        className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input name="email" value={form.email} onChange={handleChange} type="email"
                        placeholder="email@example.com"
                        className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-yellow-600" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">סוג הנכס</label>
                    <div className="relative">
                      <Home className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select name="property_type" value={form.property_type} onChange={handleChange}
                        className="w-full border border-gray-200 rounded-xl pr-10 pl-4 py-2.5 text-sm outline-none focus:border-yellow-600 appearance-none bg-white">
                        <option value="">בחר סוג נכס</option>
                        {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">הערות / שאלות</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={3}
                      placeholder="ספרו לנו קצת על הנכס..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none" />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
                  )}

                  <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-xl font-bold text-white text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ backgroundColor: '#8B6914' }}>
                    {submitting ? 'שולח...' : 'שלח פרטים'}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    הפרטים שלך מאובטחים ולא יועברו לצד שלישי
                  </p>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
