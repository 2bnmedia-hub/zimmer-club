'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function LuciHero() {
  return (
    <div className="relative" style={{ width: 220, height: Math.round(220 * 220 / 190) }}>
      {/* Float + entrance wrapper */}
      <div className="luci-float luci-entrance" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <img
          src="/luci.png"
          alt="לוסי"
          draggable={false}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center top',
            borderRadius: 24,
            userSelect: 'none', pointerEvents: 'none',
          }}
        />
      </div>

      {/* Speech bubble */}
      <div
        className="luci-bubble absolute"
        style={{
          top: 12, right: -130,
          background: 'white',
          borderRadius: 16,
          padding: '10px 14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
          width: 140,
          border: '1.5px solid #f0e8d6',
        }}
      >
        <p className="text-xs text-gray-700 font-medium leading-snug text-right" dir="rtl">
          ברוכים הבאים!<br />
          <span className="text-gray-500 font-normal">איך אוכל לעזור לכם?</span>
        </p>
        {/* Tail */}
        <div style={{
          position: 'absolute', left: -8, top: 18,
          width: 0, height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderRight: '9px solid #f0e8d6',
        }} />
        <div style={{
          position: 'absolute', left: -6, top: 18,
          width: 0, height: 0,
          borderTop: '7px solid transparent',
          borderBottom: '7px solid transparent',
          borderRight: '9px solid white',
        }} />
      </div>
    </div>
  )
}

function IconGuest() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      <path d="M8 11h6M11 8v6"/>
    </svg>
  )
}

function IconOwner() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  )
}

function RoleSelectContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromEmail = searchParams.get('source') === 'email'
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')

  const choose = async (role: 'guest' | 'owner') => {
    setLoading(role)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ role }).eq('id', user.id)
      setEmail(user.email ?? '')
    }
    setLoading(null)
    if (fromEmail) setDone(true)
    else router.push('/')
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" dir="rtl"
        style={{ background: 'linear-gradient(160deg,#fdf8ef 0%,#f0e5cf 100%)' }}>
        <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm overflow-hidden luci-entrance">
          <div className="h-1.5" style={{ background: 'linear-gradient(90deg,#C8960C,#8B6914)' }} />
          <div className="p-8 text-center">
            {/* Animated mail icon */}
            <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#fdf3dd,#f5e8bf)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">בדקו את תיבת הדואר</h2>
            <p className="text-sm text-gray-500 mb-1">שלחנו אימייל אימות לכתובת</p>
            {email && <p className="text-sm font-semibold text-gray-800 mb-6" dir="ltr">{email}</p>}
            <Link href="/auth/login"
              className="block w-full py-3 rounded-xl font-bold text-white text-sm text-center"
              style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)' }}>
              עבור לדף הכניסה
            </Link>
            <p className="text-xs text-gray-400 mt-4">לא קיבלתם? בדקו תיקיית הספאם</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start px-4 pt-4 pb-10"
      dir="rtl"
      style={{ background: 'linear-gradient(160deg, #fdf8ef 0%, #f0e5cf 100%)' }}
    >
      {/* Progress stepper */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 7 5.5 10.5 12 4"/>
            </svg>
          </div>
          <span className="text-xs text-gray-400">הרשמה</span>
        </div>
        <div className="w-10 h-px" style={{ background: 'linear-gradient(90deg,#C8960C,#8B6914)' }}/>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm"
            style={{ background: 'linear-gradient(135deg,#C8960C,#8B6914)' }}>
            2
          </div>
          <span className="text-xs font-semibold" style={{ color: '#8B6914' }}>סוג חשבון</span>
        </div>
      </div>

      {/* Luci + bubble */}
      <div className="flex justify-center mb-6">
        <LuciHero />
      </div>

      {/* Headline */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">ברוכים הבאים ל-zimmer.club</h1>
        <p className="text-sm text-gray-500">בחרו את סוג החשבון שלכם להתחלה</p>
      </div>

      {/* Option cards */}
      <div className="w-full max-w-sm space-y-3">
        {/* Guest */}
        <button
          onClick={() => choose('guest')}
          disabled={loading !== null}
          className="w-full rounded-2xl bg-white border-2 border-transparent p-5 text-right shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 group"
          style={{ boxShadow: '0 2px 16px rgba(200,150,12,0.07)' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8960C')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg,#fdf3dd,#f5e8bf)', color: '#8B6914' }}
            >
              <IconGuest />
            </div>
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900 text-base">גולש / מחפש אירוח</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                חיפוש וסינון צימרים, וילות וקרוואנים בכל הארץ
              </div>
            </div>
            <div className="flex-shrink-0 text-gray-300">
              {loading === 'guest' ? <Spinner /> : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Owner */}
        <button
          onClick={() => choose('owner')}
          disabled={loading !== null}
          className="w-full rounded-2xl bg-white border-2 border-transparent p-5 text-right shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-60 group"
          style={{ boxShadow: '0 2px 16px rgba(200,150,12,0.07)' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#C8960C')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#fdf3dd,#f5e8bf)', color: '#8B6914' }}
            >
              <IconOwner />
            </div>
            <div className="flex-1 text-right">
              <div className="font-bold text-gray-900 text-base">בעל נכס תיירותי</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                פרסום וניהול נכסים — צימרים, וילות, קרוואנים ואטרקציות
              </div>
            </div>
            <div className="flex-shrink-0 text-gray-300">
              {loading === 'owner' ? <Spinner /> : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        ניתן לשנות את סוג החשבון בהגדרות הפרופיל בכל עת
      </p>
    </div>
  )
}

export default function RoleSelectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(160deg,#fdf8ef 0%,#f0e5cf 100%)' }} />
    }>
      <RoleSelectContent />
    </Suspense>
  )
}
