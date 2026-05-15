'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (signInError) {
      setError('אימייל או סיסמה שגויים')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/dashboard/admin')
    } else if (profile?.role === 'owner') {
      router.push('/dashboard/owner')
    } else {
      router.push('/')
    }
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      setError('הכנס אימייל כדי לאפס סיסמה')
      return
    }
    await supabase.auth.resetPasswordForEmail(form.email)
    alert('נשלח אימייל לאיפוס סיסמה')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/logo.png" alt="Zimmer Club" className="h-12 w-auto mx-auto mb-4" />
          </Link>
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
              <button type="button" onClick={handleForgotPassword}
                className="text-xs text-yellow-700 hover:underline">
                שכחת סיסמה?
              </button>
            </div>
            <input name="password" type="password" value={form.password} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600"
              placeholder="הכנס סיסמה" dir="ltr" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white text-sm transition-colors"
            style={{ backgroundColor: '#8B6914' }}>
            {loading ? 'נכנס...' : 'כניסה'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          אין לך חשבון עדיין?{' '}
          <Link href="/auth/register" className="font-medium text-yellow-700 hover:underline">
            הרשמה חינם
          </Link>
        </p>
      </div>
    </div>
  )
}