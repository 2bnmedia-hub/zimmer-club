'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'cookie_consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const respond = (value: 'accepted' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      dir="rtl"
      className="fixed bottom-0 inset-x-0 z-[999998] p-4 md:p-5"
      role="dialog"
      aria-live="polite"
      aria-label="הודעה על שימוש בעוגיות"
    >
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4">
        <p className="text-sm text-gray-700 leading-relaxed flex-1">
          אתר zimmer.club משתמש בעוגיות (Cookies) לשמירת הגדרות, שיפור חוויית הגלישה וניתוח תנועה באתר.
          בהמשך הגלישה באתר אתם מסכימים לשימוש בעוגיות בהתאם ל
          <Link href="/privacy" className="underline font-semibold hover:text-yellow-700" style={{ color: '#8B6914' }}>
            {' '}מדיניות הפרטיות שלנו
          </Link>.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => respond('declined')}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            דחיה
          </button>
          <button
            type="button"
            onClick={() => respond('accepted')}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f5d078 0%,#C8960C 50%,#8B6914 100%)' }}
          >
            אישור
          </button>
        </div>
      </div>
    </div>
  )
}
