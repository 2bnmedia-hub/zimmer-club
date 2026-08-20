'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconArrowRight, IconTrash, IconPhone, IconMail, IconCheck, IconRefresh, IconUser } from '@/components/icons'

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  zimmer: 'צימר', villa: 'וילה/בקתה', hotel: 'מלון',
  camping: 'קמפינג', caravan: 'קרוואן', attraction: 'אטרקציה',
}

type Lead = {
  id: string
  full_name: string
  phone: string
  email: string | null
  property_type: string | null
  message: string | null
  contacted: boolean
  created_at: string
}

export default function AdminLeadsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') { router.push('/'); return }

      const { data } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleContacted = async (id: string, current: boolean) => {
    await supabase.from('leads').update({ contacted: !current }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, contacted: !current } : l))
  }

  const deleteLead = async (id: string) => {
    if (!confirm('למחוק פנייה זו?')) return
    await supabase.from('leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  const filtered = leads.filter(l => {
    if (filter === 'new') return !l.contacted
    if (filter === 'contacted') return l.contacted
    return true
  })

  const newCount = leads.filter(l => !l.contacted).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* כותרת */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push('/dashboard/admin')}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <IconArrowRight className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">פניות פרסום</h1>
            <p className="text-sm text-gray-500">לקוחות שמעוניינים לפרסם נכס באתר</p>
          </div>
          {newCount > 0 && (
            <span className="mr-auto bg-red-500 text-white text-xs font-bold rounded-full px-3 py-1">
              {newCount} חדשות
            </span>
          )}
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'סה"כ פניות', value: leads.length, color: '#8B6914', bg: '#FDF3DC' },
            { label: 'לא טופלו', value: newCount, color: '#dc2626', bg: '#fef2f2' },
            { label: 'טופלו', value: leads.length - newCount, color: '#16a34a', bg: '#f0fdf4' },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
              <p className="text-3xl font-bold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-sm text-gray-500 mt-1">{k.label}</p>
            </div>
          ))}
        </div>

        {/* פילטר */}
        <div className="flex gap-2 mb-4">
          {(['all', 'new', 'contacted'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all"
              style={{
                background: filter === f ? '#8B6914' : '#fff',
                color: filter === f ? '#fff' : '#555',
                borderColor: filter === f ? '#8B6914' : '#e5e7eb',
              }}>
              {f === 'all' ? 'הכל' : f === 'new' ? 'חדשות' : 'טופלו'}
            </button>
          ))}
        </div>

        {/* רשימת פניות */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400 text-sm">אין פניות להצגה</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(lead => (
              <div key={lead.id}
                className="bg-white rounded-2xl p-5 shadow-sm border transition-all"
                style={{ borderColor: lead.contacted ? '#e5e7eb' : '#fbbf24', opacity: lead.contacted ? 0.85 : 1 }}>
                <div className="flex items-start justify-between gap-4">

                  {/* פרטי הלקוח */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: '#FDF3DC' }}>
                        <IconUser className="w-4 h-4" style={{ color: '#8B6914' }} />
                      </div>
                      <span className="font-bold text-gray-900">{lead.full_name}</span>
                      {lead.property_type && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {PROPERTY_TYPE_LABELS[lead.property_type] || lead.property_type}
                        </span>
                      )}
                      {!lead.contacted && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">חדשה</span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-yellow-700">
                        <IconPhone className="w-3.5 h-3.5" />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-yellow-700">
                          <IconMail className="w-3.5 h-3.5" />
                          {lead.email}
                        </a>
                      )}
                    </div>

                    {lead.message && (
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-3 py-2 leading-relaxed">
                        {lead.message}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-2">{formatDate(lead.created_at)}</p>
                  </div>

                  {/* פעולות */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => toggleContacted(lead.id, lead.contacted)}
                      title={lead.contacted ? 'סמן כלא טופל' : 'סמן כטופל'}
                      className="p-2 rounded-xl border transition-all"
                      style={{
                        background: lead.contacted ? '#f0fdf4' : '#fff',
                        borderColor: lead.contacted ? '#86efac' : '#e5e7eb',
                        color: lead.contacted ? '#16a34a' : '#9ca3af',
                      }}>
                      <IconCheck className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteLead(lead.id)}
                      title="מחק פנייה"
                      className="p-2 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all text-gray-400 hover:text-red-500">
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
