'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Supabase auth
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-charcoal">
            zimmer<span className="text-gold">.</span>club
          </Link>
          <h1 className="text-xl font-bold text-charcoal mt-4 mb-1">ברוכים הבאים בחזרה</h1>
          <p className="text-sm text-taupe">התחברו לחשבון שלכם</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">כתובת אימייל</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field pr-10"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label">סיסמה</label>
                <Link href="/auth/forgot-password" className="text-xs text-gold-deep hover:underline">
                  שכחתם סיסמה?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הזינו סיסמה"
                  className="input-field pr-10 pl-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3 mt-2"
            >
              {loading ? 'מתחבר...' : 'כניסה לחשבון'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="divider" />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-warm-white px-3 text-xs text-taupe">
              או
            </span>
          </div>

          {/* Google */}
          <button className="w-full btn-outline flex items-center justify-center gap-3 py-3">
            <span className="text-lg">🔵</span>
            המשיכו עם Google
          </button>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-taupe mt-6">
          אין לכם חשבון עדיין?{' '}
          <Link href="/auth/register" className="font-semibold text-gold-deep hover:underline">
            הרשמו בחינם
          </Link>
        </p>
      </div>
    </div>
  )
}
