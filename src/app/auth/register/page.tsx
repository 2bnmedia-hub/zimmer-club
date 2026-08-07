'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IconEye, IconEyeOff } from '@/components/icons'
import { createClient } from '@/lib/supabase/client'

/* ── Luci character ── */
function LuciFloat({ size = 180 }: { size?: number }) {
  const h = Math.round(size * 220 / 190)
  return (
    <div className="luci-float luci-entrance" style={{ width: size, height: h, position: 'relative', flexShrink: 0 }}>
      <img src="/luci.png" alt="לוסי" draggable={false}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center top',
          borderRadius: 20, userSelect: 'none', pointerEvents: 'none' }} />
    </div>
  )
}

function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="luci-bubble relative bg-white rounded-2xl px-4 py-2.5 shadow-md text-sm text-gray-700 font-medium text-right"
      style={{ border: '1.5px solid #f0e8d6', maxWidth: 180 }} dir="rtl">
      {text}
      {/* tail pointing down-left toward Luci */}
      <div style={{
        position: 'absolute', bottom: -9, right: 28,
        width: 0, height: 0,
        borderLeft: '8px solid transparent', borderRight: '8px solid transparent',
        borderTop: '10px solid #f0e8d6',
      }} />
      <div style={{
        position: 'absolute', bottom: -7, right: 29,
        width: 0, height: 0,
        borderLeft: '7px solid transparent', borderRight: '7px solid transparent',
        borderTop: '9px solid white',
      }} />
    </div>
  )
}

function PasswordInput({ id, name, value, onChange }: {
  id?: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const [show, setShow] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toggle = () => {
    if (show) { setShow(false); if (timer.current) clearTimeout(timer.current) }
    else { setShow(true); timer.current = setTimeout(() => setShow(false), 2000) }
  }
  return (
    <div className="relative">
      <input id={id} name={name} type={show ? 'text' : 'password'} value={value} onChange={onChange}
        required dir="ltr"
        autoComplete={name === 'password' ? 'new-password' : 'new-password'}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 pr-10" />
      <button type="button" onClick={toggle}
        aria-label={show ? 'הסתר סיסמה' : 'הצג סיסמה'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <IconEyeOff className="w-4 h-4" aria-hidden="true" /> : <IconEye className="w-4 h-4" aria-hidden="true" />}
      </button>
    </div>
  )
}

/* ── Role card ── */
function RoleCard({ icon, title, desc, onClick, loading }: {
  icon: React.ReactNode; title: string; desc: string; onClick: () => void; loading: boolean
}) {
  return (
    <button onClick={onClick} disabled={loading}
      className="w-full rounded-2xl bg-white border-2 border-transparent p-5 text-right shadow-sm hover:shadow-md hover:border-yellow-500 transition-all duration-200 disabled:opacity-60 group"
      style={{ boxShadow: '0 2px 16px rgba(200,150,12,0.07)' }}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#fdf3dd,#f5e8bf)', color: '#8B6914' }}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-900">{title}</div>
          <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
        </div>
        <svg className="w-5 h-5 text-gray-300 group-hover:text-yellow-500 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </div>
    </button>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'role' | 'methods' | 'confirm'>('role')
  const [role, setRole] = useState<'guest' | 'owner' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState('')
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })

  const chooseRole = (r: 'guest' | 'owner') => {
    setRole(r)
    setStep('methods')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const ownerRedirect = '/dashboard/properties/new'

  const handleGoogleSignIn = async () => {
    if (!role) return
    setError('')
    document.cookie = `pending_role=${role}; path=/; max-age=300; SameSite=Lax`
    if (role === 'owner') document.cookie = `pending_redirect=${ownerRedirect}; path=/; max-age=300; SameSite=Lax`
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
    if (oauthError) setError('שגיאה בהתחברות עם Google — נסו שנית')
  }

  const handleFacebookSignIn = async () => {
    if (!role) return
    setError('')
    document.cookie = `pending_role=${role}; path=/; max-age=300; SameSite=Lax`
    if (role === 'owner') document.cookie = `pending_redirect=${ownerRedirect}; path=/; max-age=300; SameSite=Lax`
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback`, scopes: 'public_profile' }
    })
    if (oauthError) setError('שגיאה בהתחברות עם Facebook — נסו שנית')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('הסיסמאות אינן תואמות'); return }
    if (form.password.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return }
    setLoading(true)

    // Server-side email existence check (reliable — uses admin API)
    try {
      const checkRes = await fetch('/api/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })
      if (checkRes.ok) {
        const { exists } = await checkRes.json()
        if (exists) {
          setError('כתובת האימייל הזו כבר רשומה במערכת. נסו להתחבר.')
          setLoading(false)
          return
        }
      }
    } catch {
      // If check fails, continue — signUp identities check acts as fallback
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          phone: form.phone,
          role: role ?? 'guest',
          ...(role === 'owner' && { pending_redirect: ownerRedirect }),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })
    if (signUpError) {
      const msg = signUpError.message.toLowerCase()
      setError(msg.includes('already') || msg.includes('registered') || msg.includes('taken')
        ? 'כתובת האימייל הזו כבר רשומה. נסו להתחבר.'
        : signUpError.message)
      setLoading(false)
      return
    }
    // Fallback: ghost-signup returns identities:[] or identities:null
    const identities = data.user?.identities
    if (!data.user || !identities || (Array.isArray(identities) && identities.length === 0)) {
      setError('כתובת האימייל הזו כבר רשומה במערכת. נסו להתחבר.')
      setLoading(false)
      return
    }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email: form.email.trim().toLowerCase(),
        full_name: form.fullName,
        phone: form.phone,
        role: role ?? 'guest',
      })
    }
    setConfirmedEmail(form.email)
    setLoading(false)
    setStep('confirm')
  }

  const bgStyle = { background: 'linear-gradient(160deg,#fdf8ef 0%,#f0e5cf 100%)' }
  const goldBar = <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg,#C8960C,#8B6914)' }} />
  const goldBtn = { background: 'linear-gradient(135deg,#C8960C,#8B6914)' }

  /* ── Step: confirm email ── */
  if (step === 'confirm') return (
    <div className="min-h-screen flex items-center justify-center px-4" dir="rtl" style={bgStyle}>
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm overflow-hidden luci-entrance">
        {goldBar}
        <div className="p-8 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#fdf3dd,#f5e8bf)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#8B6914" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">בדקו את תיבת הדואר</h2>
          <p className="text-sm text-gray-500 mb-1">שלחנו אימייל אימות לכתובת</p>
          <p className="text-sm font-semibold text-gray-800 mb-3" dir="ltr">{confirmedEmail}</p>
          {role === 'owner' && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
              אחרי האישור תועברו ישירות לדף הוספת הנכס הראשון שלכם
            </p>
          )}
          <Link href="/auth/login" className="block w-full py-3 rounded-xl font-bold text-white text-sm text-center" style={goldBtn}>
            עבור לדף הכניסה
          </Link>
          <p className="text-xs text-gray-400 mt-4">לא קיבלתם? בדקו תיקיית הספאם</p>
        </div>
      </div>
    </div>
  )

  /* ── Step: choose role ── */
  if (step === 'role') return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 pt-4 pb-8" dir="rtl" style={bgStyle}>
      {/* Luci + bubble */}
      <div className="flex flex-col items-center mb-6">
        <SpeechBubble text="אשמח לעזור — מה תפקידך?" />
        <div className="mt-3">
          <LuciFloat size={190} />
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">הצטרפו ל-zimmer.club</h1>
        <p className="text-sm text-gray-500 mt-1">ראשית, בחרו את סוג החשבון שלכם</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <RoleCard
          onClick={() => chooseRole('guest')} loading={false}
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
          title="גולש / מחפש אירוח"
          desc="חיפוש צימרים, וילות וקרוואנים בכל הארץ"
        />
        <RoleCard
          onClick={() => chooseRole('owner')} loading={false}
          icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>}
          title="בעל נכס תיירותי"
          desc="פרסום וניהול נכסים — צימרים, וילות, קרוואנים ואטרקציות"
        />
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        כבר יש לך חשבון?{' '}
        <Link href="/auth/login" className="font-medium text-yellow-700 hover:underline">כניסה</Link>
      </p>
    </div>
  )

  /* ── Step: registration methods ── */
  const roleLabel = role === 'owner' ? 'בעל נכס תיירותי' : 'גולש / מחפש אירוח'

  return (
    <div className="min-h-screen flex items-start justify-center px-4 pt-4 pb-6" dir="rtl" style={bgStyle}>
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-sm overflow-hidden">
        {goldBar}
        <div className="p-6">
          {/* Header: back + Luci + role badge */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setStep('role')}
              className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              חזרה
            </button>
            <span className="text-xs font-semibold rounded-full px-3 py-1" style={{ background: 'linear-gradient(135deg,#fdf3dd,#f5e8bf)', color: '#8B6914' }}>
              {roleLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <LuciFloat size={80} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">הרשמה חינם</h1>
              <p className="text-xs text-gray-400 mt-0.5">הצטרפו לאלפי מטיילים בישראל</p>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-2.5 mb-4">
            <button type="button" onClick={handleGoogleSignIn}
              className="w-full py-2.5 rounded-xl font-medium text-sm border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition text-gray-700">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/>
              </svg>
              המשך עם Google
            </button>
            <button type="button" onClick={handleFacebookSignIn}
              className="w-full py-2.5 rounded-xl font-medium text-sm border flex items-center justify-center gap-3 hover:bg-blue-50 transition"
              style={{ borderColor: '#1877F2', color: '#1877F2' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              המשך עם Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"/></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2 w-fit mx-auto">או הרשמה עם אימייל</div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="reg-fullName" className="block text-xs font-medium text-gray-600 mb-1">שם מלא</label>
              <input id="reg-fullName" name="fullName" value={form.fullName} onChange={handleChange} required
                placeholder="ישראל ישראלי" autoComplete="name"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"/>
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-xs font-medium text-gray-600 mb-1">אימייל</label>
              <input id="reg-email" name="email" type="email" value={form.email} onChange={handleChange} required
                dir="ltr" autoComplete="email" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"/>
            </div>
            <div>
              <label htmlFor="reg-phone" className="block text-xs font-medium text-gray-600 mb-1">טלפון</label>
              <input id="reg-phone" name="phone" type="tel" value={form.phone} onChange={handleChange}
                dir="ltr" autoComplete="tel" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"/>
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-xs font-medium text-gray-600 mb-1">סיסמה</label>
              <PasswordInput id="reg-password" name="password" value={form.password} onChange={handleChange}/>
            </div>
            <div>
              <label htmlFor="reg-confirmPassword" className="block text-xs font-medium text-gray-600 mb-1">אימות סיסמה</label>
              <PasswordInput id="reg-confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}/>
            </div>
            {error && <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 mt-1"
              style={{ ...goldBtn, opacity: loading ? 0.8 : 1 }}>
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>נרשם...</>
              ) : 'הרשמה חינם'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            כבר יש לך חשבון?{' '}
            <Link href="/auth/login" className="font-medium text-yellow-700 hover:underline">כניסה</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
