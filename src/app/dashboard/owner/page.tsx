'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

type Property = {
  id: string
  name: string
  category: string[]
  region: string
  price_per_night: number
  status: string
  avg_rating: number
  total_reviews: number
}

type Caravan = {
  id: string
  name: string
  caravan_type: string
  region: string
  price_per_night: number
  status: string
  avg_rating: number
}

type Attraction = {
  id: string
  name: string
  activity_type: string[]
  region: string
  price_per_person: number
  status: string
  avg_rating: number
}

export default function OwnerDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [caravans, setCaravans] = useState<Caravan[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single()
      if (profile?.role === 'admin') { router.push('/dashboard/admin'); return }
      setUserName(profile?.full_name || user.email || '')
      const { data } = await supabase.from('properties').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
      setProperties(data || [])
      const { data: attrData } = await supabase.from('attractions').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
      setAttractions(attrData || [])
      const { data: caravanData } = await supabase.from('caravans').select('*').eq('owner_id', user.id).order('created_at', { ascending: false })
      setCaravans(caravanData || [])
      setLoading(false)
    }
    load()
  }, [])

  const statusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: 'ממתין לאישור', color: 'bg-yellow-100 text-yellow-700' },
      active: { label: 'פעיל', color: 'bg-green-100 text-green-700' },
      inactive: { label: 'לא פעיל', color: 'bg-gray-100 text-gray-500' },
      rejected: { label: 'נדחה', color: 'bg-red-100 text-red-700' },
    }
    return map[status] || { label: status, color: 'bg-gray-100 text-gray-500' }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>

  return (
    <div className="min-h-screen bg-gray-50 pt-4" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#8B6914] transition-colors mb-1">
              <IconArrowRight className="w-4 h-4" />
              חזרה לדף הבית
            </Link>
            <h1 className="text-xl font-bold text-gray-900">לוח בקרה</h1>
            <p className="text-sm text-gray-500">שלום, {userName}</p>
          </div>
          <div className="bg-white border rounded-2xl px-5 py-4 shadow-sm" style={{ borderColor:'rgba(139,105,20,0.15)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color:'#8B6914' }}>הוספת עסקים ידנית</p>
            <div className="flex gap-2">
              <Link href="/dashboard/properties/new" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background:'linear-gradient(135deg, #C8960C, #8B6914)' }}>
                <IconPlus className="w-4 h-4" />
                צימר / וילה / בקתה
              </Link>
              <Link href="/dashboard/caravans/new" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background:'linear-gradient(135deg, #C8960C, #8B6914)' }}>
                <IconPlus className="w-4 h-4" />
                קרוואן
              </Link>
              <Link href="/dashboard/attractions/new" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background:'linear-gradient(135deg, #C8960C, #8B6914)' }}>
                <IconPlus className="w-4 h-4" />
                אטרקציה
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm mb-6 px-4 py-4 flex items-center justify-center gap-0 divide-x divide-x-reverse divide-gray-100">
          {[
            { label: 'סה״כ נכסים', value: properties.length, color: '#111827' },
            { label: 'נכסים פעילים', value: properties.filter(p => p.status === 'active').length, color: '#16a34a' },
            { label: 'אטרקציות', value: attractions.length, color: '#d97706' },
            { label: 'קרוואנים', value: caravans.length, color: '#92400e' },
            { label: 'ממתינים לאישור', value: properties.filter(p => p.status === 'pending').length + attractions.filter(a => a.status === 'pending').length, color: '#ca8a04' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex-1 text-center px-4 py-1">
              <p className="text-2xl font-bold" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">הנכסים שלי</h2>
          </div>
          {properties.length > 0 && (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-right">שם הנכס</th>
                  <th className="px-6 py-3 text-right">סוג</th>
                  <th className="px-6 py-3 text-right">מחיר/לילה</th>
                  <th className="px-6 py-3 text-right">סטטוס</th>
                  <th className="px-6 py-3 text-right">דירוג</th>
                  <th className="px-6 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {properties.map((p) => {
                  const s = statusLabel(p.status)
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.category?.[0]}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₪{p.price_per_night}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{p.avg_rating ? `⭐ ${p.avg_rating}` : '—'}</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Link href={`/${p.id}?from=dashboard`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 inline-block" title="צפה בנכס">
                          <IconEye className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href={`/dashboard/properties/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 inline-block" title="עריכה">
                          <IconEdit className="w-4 h-4 text-gray-500" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
        {/* אטרקציות */}
        {attractions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">האטרקציות שלי</h2>
              <Link href="/dashboard/attractions/new" className="flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700">
                <IconPlus className="w-4 h-4" />הוסף אטרקציה
              </Link>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-right">שם האטרקציה</th>
                  <th className="px-6 py-3 text-right">מחיר לאדם</th>
                  <th className="px-6 py-3 text-right">סטטוס</th>
                  <th className="px-6 py-3 text-right">דירוג</th>
                  <th className="px-6 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attractions.map((a) => {
                  const s = statusLabel(a.status)
                  return (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{a.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">החל מ ₪{a.price_per_person}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{a.avg_rating ? `⭐ ${a.avg_rating}` : '—'}</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Link href={`/attractions/${a.id}?from=dashboard`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 inline-block" title="צפה באטרקציה">
                          <IconEye className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href={`/dashboard/attractions/${a.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 inline-block" title="עריכה">
                          <IconEdit className="w-4 h-4 text-gray-500" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* קרוואנים */}
        {caravans.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">הקרוואנים שלי</h2>
              <Link href="/dashboard/caravans/new" className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800">
                <IconPlus className="w-4 h-4" />הוסף קרוואן
              </Link>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-right">שם</th>
                  <th className="px-6 py-3 text-right">סוג</th>
                  <th className="px-6 py-3 text-right">מחיר/לילה</th>
                  <th className="px-6 py-3 text-right">סטטוס</th>
                  <th className="px-6 py-3 text-right">דירוג</th>
                  <th className="px-6 py-3 text-right">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {caravans.map((c) => {
                  const s = statusLabel(c.status)
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{{ auto: 'אוטו קרוואן', trailer: 'נגרר', stationed: 'מוצב בשטח', truck: 'משאית' }[c.caravan_type] || c.caravan_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">₪{c.price_per_night}</td>
                      <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}>{s.label}</span></td>
                      <td className="px-6 py-4 text-sm text-gray-500">{c.avg_rating ? `⭐ ${c.avg_rating}` : '—'}</td>
                      <td className="px-6 py-4 flex items-center gap-1">
                        <Link href={`/caravans/${c.id}?from=dashboard`} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 inline-block" title="צפה בקרוואן">
                          <IconEye className="w-4 h-4 text-gray-400" />
                        </Link>
                        <Link href={`/dashboard/caravans/${c.id}/edit`} className="p-1.5 rounded-lg hover:bg-gray-100 inline-block" title="עריכה">
                          <IconEdit className="w-4 h-4 text-gray-500" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
