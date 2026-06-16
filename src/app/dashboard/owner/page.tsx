'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { IconEye, IconEdit, IconPlus, IconArrowRight } from '@/components/icons'

type Property = { id: string; name: string; slug: string; category: string[]; region: string; price_per_night: number; status: string; avg_rating: number; total_reviews: number }
type Caravan = { id: string; name: string; slug: string; caravan_type: string; region: string; price_per_night: number; status: string; avg_rating: number }
type Attraction = { id: string; name: string; slug: string; activity_type: string[]; region: string; price_per_person: number; status: string; avg_rating: number }

const STATUS: Record<string, { label: string; dot: string }> = {
  active:   { label: 'פעיל',            dot: 'bg-emerald-400' },
  pending:  { label: 'ממתין לאישור',    dot: 'bg-amber-400' },
  inactive: { label: 'לא פעיל',         dot: 'bg-gray-300' },
  rejected: { label: 'נדחה',            dot: 'bg-red-400' },
}

const CARAVAN_TYPE: Record<string, string> = {
  auto: 'אוטו קרוואן', trailer: 'נגרר', stationed: 'מוצב', truck: 'משאית'
}

const REGION: Record<string, string> = {
  north: 'צפון', galil_west: 'גליל מערבי', galil_upper: 'גליל עליון',
  galil_lower: 'גליל תחתון', kinneret: 'כנרת', hermon: 'חרמון',
  center: 'מרכז', jerusalem: 'ירושלים', dead_sea: 'ים המלח',
  negev: 'דרום', eilat: 'אילת', golan: 'גולן',
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
      const [{ data: p }, { data: a }, { data: c }] = await Promise.all([
        supabase.from('properties').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('attractions').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('caravans').select('*').eq('owner_id', user.id).order('created_at', { ascending: false }),
      ])
      setProperties(p || []); setAttractions(a || []); setCaravans(c || [])
      setLoading(false)
    }
    load()
  }, [])

  const total = properties.length + attractions.length + caravans.length
  const active = [...properties, ...attractions, ...caravans].filter(x => x.status === 'active').length
  const pending = [...properties, ...attractions, ...caravans].filter(x => x.status === 'pending').length

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-gray-200 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f7]" dir="rtl">

      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <IconArrowRight className="w-3.5 h-3.5" />
            zimmer.club
          </Link>
          <span className="text-sm font-medium text-gray-800">{userName}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-1">שלום, {userName.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 text-sm">הנה סיכום העסקים שלך</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'סה״כ עסקים', value: total },
            { label: 'פעילים', value: active, accent: true },
            { label: 'ממתינים לאישור', value: pending, warn: pending > 0 },
          ].map(({ label, value, accent, warn }) => (
            <div key={label} className="bg-white rounded-2xl px-6 py-5 shadow-sm">
              <p className={`text-3xl font-bold tracking-tight ${accent ? 'text-emerald-500' : warn && value > 0 ? 'text-amber-500' : 'text-gray-900'}`}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Add buttons */}
        <div className="flex gap-3 mb-10">
          {[
            { href: '/dashboard/properties/new', label: 'נכס חדש', emoji: '🏠' },
            { href: '/dashboard/caravans/new', label: 'קרוואן חדש', emoji: '🚐' },
            { href: '/dashboard/attractions/new', label: 'אטרקציה חדשה', emoji: '🎯' },
          ].map(({ href, label, emoji }) => (
            <Link key={href} href={href}
              className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all border border-black/5">
              <span>{emoji}</span>{label}
              <IconPlus className="w-3.5 h-3.5 text-gray-400" />
            </Link>
          ))}
        </div>

        {/* Tables */}
        {[
          {
            title: 'נכסים', emoji: '🏠',
            items: properties,
            cols: ['שם', 'אזור', 'מחיר/לילה', 'דירוג', 'סטטוס', ''],
            row: (p: Property) => [
              <span className="font-medium text-gray-900">{p.name}</span>,
              <span className="text-gray-400">{REGION[p.region] || p.region}</span>,
              <span className="text-gray-700">₪{p.price_per_night?.toLocaleString()}</span>,
              <span className="text-gray-400">{p.avg_rating ? `${p.avg_rating} ⭐` : '—'}</span>,
              <StatusBadge status={p.status} />,
              <Actions viewHref={`/properties/${p.slug}`} editHref={`/dashboard/properties/${p.id}/edit`} />,
            ],
            addHref: '/dashboard/properties/new',
          },
          {
            title: 'אטרקציות', emoji: '🎯',
            items: attractions,
            cols: ['שם', 'אזור', 'מחיר/אדם', 'דירוג', 'סטטוס', ''],
            row: (a: Attraction) => [
              <span className="font-medium text-gray-900">{a.name}</span>,
              <span className="text-gray-400">{REGION[a.region] || a.region}</span>,
              <span className="text-gray-700">החל מ ₪{a.price_per_person?.toLocaleString()}</span>,
              <span className="text-gray-400">{a.avg_rating ? `${a.avg_rating} ⭐` : '—'}</span>,
              <StatusBadge status={a.status} />,
              <Actions viewHref={`/attractions/${a.slug}`} editHref={`/dashboard/attractions/${a.id}/edit`} />,
            ],
            addHref: '/dashboard/attractions/new',
          },
          {
            title: 'קרוואנים', emoji: '🚐',
            items: caravans,
            cols: ['שם', 'סוג', 'מחיר/לילה', 'דירוג', 'סטטוס', ''],
            row: (c: Caravan) => [
              <span className="font-medium text-gray-900">{c.name}</span>,
              <span className="text-gray-400">{CARAVAN_TYPE[c.caravan_type] || c.caravan_type}</span>,
              <span className="text-gray-700">₪{c.price_per_night?.toLocaleString()}</span>,
              <span className="text-gray-400">{c.avg_rating ? `${c.avg_rating} ⭐` : '—'}</span>,
              <StatusBadge status={c.status} />,
              <Actions viewHref={`/caravans/${c.slug}`} editHref={`/dashboard/caravans/${c.id}/edit`} />,
            ],
            addHref: '/dashboard/caravans/new',
          },
        ].map(({ title, emoji, items, cols, row, addHref }) => (
          <div key={title} className="bg-white rounded-2xl shadow-sm overflow-hidden mb-5">
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
                <span className="text-xs text-gray-300 font-normal">({items.length})</span>
              </div>
              <Link href={addHref} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors">
                <IconPlus className="w-3.5 h-3.5" />הוסף
              </Link>
            </div>
            {items.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-gray-300">אין {title} עדיין</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    {cols.map((col, i) => (
                      <th key={i} className="px-6 py-3 text-right text-xs text-gray-300 font-medium">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id} className={`border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors`}>
                      {row(item).map((cell, i) => (
                        <td key={i} className="px-6 py-3.5 text-sm">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] || { label: status, dot: 'bg-gray-300' }
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      <span className="text-xs text-gray-500">{s.label}</span>
    </span>
  )
}

function Actions({ viewHref, editHref }: { viewHref: string; editHref: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Link href={viewHref} target="_blank" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="צפה">
        <IconEye className="w-4 h-4 text-gray-300 hover:text-gray-500" />
      </Link>
      <Link href={editHref} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }} title="עריכה">
        <IconEdit className="w-3.5 h-3.5" />
        עריכה
      </Link>
    </span>
  )
}
