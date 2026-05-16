'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Edit } from 'lucide-react'

type Property = {
  id: string
  name: string
  category: string[]
  region: string
  city: string
  price_per_night: number
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') { router.push('/dashboard/owner'); return }
      const { data } = await supabase.from('properties').select('*').order('created_at', { ascending: false })
      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('properties').update({ status }).eq('id', id)
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p))
  }

  const filtered = filter === 'all' ? properties : properties.filter(p => p.status === filter)

  const stats = {
    total: properties.length,
    pending: properties.filter(p => p.status === 'pending').length,
    active: properties.filter(p => p.status === 'active').length,
    rejected: properties.filter(p => p.status === 'rejected').length,
  }

  const statusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: 'ממתין', color: 'bg-yellow-100 text-yellow-700' },
      active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
      inactive: { label: 'לא פעיל', color: 'bg-gray-100 text-gray-500' },
      rejected: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
    }
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-500' }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">לוח בקרה - אדמין</h1>
            <p className="text-sm text-gray-500">ניהול כל הנכסים באתר</p>
          </div>
          <Link href="/dashboard/properties/new" className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#8B6914' }}>
            הוסף נכס חדש
          </Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'סה״כ נכסים', value: stats.total, color: 'text-gray-900' },
            { label: 'ממתינים לאישור', value: stats.pending, color: 'text-yellow-600' },
            { label: 'נכסים פעילים', value: stats.active, color: 'text-green-600' },
            { label: 'נדחו', value: stats.rejected, color: 'text-red-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <h2 className="font-bold text-gray-900 ml-auto">כל הנכסים</h2>
            {['all', 'pending', 'active', 'rejected'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {f === 'all' ? 'הכל' : f === 'pending' ? 'ממתינים' : f === 'active' ? 'פעילים' : 'נדחו'}
              </button>
            ))}
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3 text-right">שם הנכס</th>
                <th className="px-6 py-3 text-right">סוג</th>
                <th className="px-6 py-3 text-right">איזור</th>
                <th className="px-6 py-3 text-right">מחיר/לילה</th>
                <th className="px-6 py-3 text-right">סטטוס</th>
                <th className="px-6 py-3 text-right">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const s = statusLabel(p.status)
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.category?.[0]}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{p.city || p.region}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₪{p.price_per_night}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(p.id, 'active')} className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100"><Check className="w-4 h-4 text-green-600" /></button>
                            <button onClick={() => updateStatus(p.id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100"><X className="w-4 h-4 text-red-600" /></button>
                          </>
                        )}
                        <Link href={`/dashboard/properties/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit className="w-4 h-4 text-gray-500" /></Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="px-6 py-16 text-center text-gray-400">אין נכסים להצגה</div>}
        </div>
      </main>
    </div>
  )
}
