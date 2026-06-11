'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function BackButton() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')
  if (from !== 'dashboard') return null

  return (
    <a
      href="/dashboard/admin"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
      style={{
        background: 'linear-gradient(135deg, #006039 0%, #004D2E 100%)',
        boxShadow: '0 4px 16px rgba(0,96,57,0.4)',
      }}
    >
      ← לוח הבקרה
    </a>
  )
}

export function AdminBackButton() {
  return (
    <Suspense fallback={null}>
      <BackButton />
    </Suspense>
  )
}
