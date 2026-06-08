'use client'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-4" dir="rtl">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10 pt-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.png" alt="Zimmer Club" className="h-12 w-auto mx-auto mb-4" /></Link>
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
            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
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
        <p className="text-center text-sm text-gray-500 mt-6">
          כבר יש לך חשבון?{' '}
          <Link href="/auth/login" className="font-medium text-yellow-700 hover:underline">כניסה</Link>
        </p>
      </div>
    </div>
  )
}
