'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function AdminBackButton() {
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (data?.role === 'admin') setIsAdmin(true)
    }
    check()
  }, [])

  if (!isAdmin) return null

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
