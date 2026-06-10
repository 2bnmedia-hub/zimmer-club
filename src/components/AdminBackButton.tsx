'use client'
import { useSearchParams } from 'next/navigation'

export function AdminBackButton() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  if (from !== 'dashboard') return null

  return (
    <a
      href="/dashboard/admin"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold text-white shadow-xl animate-pulse"
      style={{
        background: 'linear-gradient(135deg, #dc2626, #ef4444)',
        boxShadow: '0 0 20px rgba(220,38,38,0.5)',
      }}
    >
      ← חזרה ללוח הבקרה
    </a>
  )
}
