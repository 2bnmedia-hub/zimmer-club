'use client'

import { useState, useRef } from 'react'
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

export default function LoginPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('אימייל או סיסמה שגויים. אם שכחת את הסיסמה, לחץ על "שכחת סיסמה?"')
      setLoading(false)
      return
    }

    setSuccess('מתחבר... מיד תועבר לחשבונך')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      window.location.href = '/dashboard/admin'
    } else if (profile?.role === 'owner') {
      window.location.href = '/dashboard/owner'
    } else {
      window.location.href = '/'
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) { setError('הכנס אימייל כדי לאפס סיסמה'); return }
    await supabase.auth.resetPasswordForEmail(form.email)
    setSuccess('נשלח אימייל לאיפוס סיסמה — בדוק את תיבת הדואר שלך')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-24" dir="rtl">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/"><img src="/logo.png" alt="Zimmer Club" className="h-12 w-auto mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-bold text-gray-900">כניסה לחשבון</h1>
          <p className="text-sm text-gray-500 mt-1">ברוך השב!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
              placeholder="israel@example.com" dir="ltr" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">סיסמה</label>
              <button type="button" onClick={handleForgotPassword} className="text-xs text-yellow-700 hover:underline">
                שכחת סיסמה?
              </button>
            </div>
            <PasswordInput name="password" value={form.password} onChange={handleChange} placeholder="הכנס סיסמה" />
          </div>

          {error && <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700">{success}</div>}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
            style={{ backgroundColor: '#8B6914', opacity: loading ? 0.8 : 1 }}>
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                מתחבר...
              </>
            ) : 'כניסה'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          אין לך חשבון עדיין?{' '}
          <Link href="/auth/register" className="font-medium text-yellow-700 hover:underline">הרשמה חינם</Link>
        </p>
      </div>
    </div>
  )
}
