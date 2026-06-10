'use client'

import Image from 'next/image'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function PasswordInput({ name, value, onChange, placeholder }: {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleToggle = () => {
    if (show) {
      setShow(false)
      if (timerRef.current) clearTimeout(timerRef.current)
    } else {
      setShow(true)
      timerRef.current = setTimeout(() => setShow(false), 2000)
    }
  }

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        dir="ltr"
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 pr-10"
      />
      <button
        type="button"
        onClick={handleToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const handleFacebookSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('form')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'guest',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) { setError('הסיסמאות אינן תואמות'); return }
    if (form.password.length < 6) { setError('הסיסמה חייבת להכיל לפחות 6 תווים'); return }
    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, phone: form.phone, role: form.role } }
    })
    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: form.fullName,
        phone: form.phone,
        role: form.role,
      })
    }
    setStep('confirm')
    setLoading(false)
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 pt-8" dir="rtl">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-start justify-center mx-auto mb-4">
            <span className="text-3xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">בדוק את האימייל שלך</h2>
          <p className="text-gray-500 text-sm mb-6">שלחנו לך אימייל אימות לכתובת <strong>{form.email}</strong>.</p>
          <Link href="/auth/login" className="block w-full py-3 rounded-xl font-bold text-white text-sm text-center" style={{ backgroundColor: '#8B6914' }}>
            עבור לדף הכניסה
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center px-4 py-4 pt-8" dir="rtl">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/"><Image src="/logo.png" alt="Zimmer Club" width={400} height={160} className="h-12 w-auto mx-auto mb-4" priority /></Link>
          <h1 className="text-2xl font-bold text-gray-900">הרשמה חינם</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" placeholder="ישראל ישראלי" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
            <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אני מצטרף כ</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600">
              <option value="guest">גולש / מחפש אירוח</option>
              <option value="owner">בעל נכס</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <PasswordInput name="password" value={form.password} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימות סיסמה</label>
            <PasswordInput name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-start justify-center gap-2"
            style={{ backgroundColor: '#8B6914', opacity: loading ? 0.8 : 1 }}>
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                נרשם...
              </>
            ) : 'הרשמה חינם'}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs text-gray-400 bg-white px-2 w-fit mx-auto">או</div>
        </div>

        <button type="button" onClick={handleGoogleSignIn}
          className="w-full py-3 rounded-xl font-medium text-sm border border-gray-200 flex items-start justify-center gap-3 hover:bg-gray-50 transition mb-6">
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"/></svg>
          המשך עם Google
        </button>

        <button type="button" onClick={handleFacebookSignIn}
          className="w-full py-3 rounded-xl font-medium text-sm border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 transition mb-6"
          style={{ borderColor: '#1877F2' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          המשך עם Facebook
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          כבר יש לך חשבון?{' '}
          <Link href="/auth/login" className="font-medium text-yellow-700 hover:underline">כניסה</Link>
        </p>
      </div>
    </div>
  )
}
