'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CARAVAN_TYPES } from '@/lib/constants'

type Caravan = {
  id: string
  name: string
  slug: string
  short_description: string
  caravan_type: string
  region: string
  city: string
  price_per_night: number
  max_guests: number
  sleeping_capacity: number
  manufacture_year: number
  can_relocate: boolean
  instant_book: boolean
  avg_rating: number
  total_reviews: number
  caravan_images: { url: string }[]
}

const REGION_LABELS: Record<string, string> = {
  north: 'צפון', galil_upper: 'גליל עליון', galil_lower: 'גליל תחתון',
  galil_west: 'גליל מערבי', kinneret: 'כנרת', hermon: 'חרמון',
  golan: 'רמת הגולן', center: 'מרכז', jerusalem: 'ירושלים',
  dead_sea: 'ים המלח', negev: 'דרום', eilat: 'אילת',
}

const TYPE_LABELS: Record<string, string> = {
  auto: 'אוטו קרוואן', trailer: 'נגרר', stationed: 'ממוקם', truck: 'משאית',
}

function CaravansContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [caravans, setCaravans] = useState<Caravan[]>([])
  const [loading, setLoading] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    region: searchParams.get('region') || '',
    guests: searchParams.get('guests') || '',
    instant: searchParams.get('instant') === 'true',
    relocate: searchParams.get('relocate') === 'true',
  })

  // עדכן filters כשה-URL משתנה (למשל מה-Navbar)
  useEffect(() => {
    setFilters({
      type: searchParams.get('type') || '',
      region: searchParams.get('region') || '',
      guests: searchParams.get('guests') || '',
      instant: searchParams.get('instant') === 'true',
      relocate: searchParams.get('relocate') === 'true',
    })
  }, [searchParams])

  useEffect(() => { fetchCaravans() }, [filters])

  const regionGroups: Record<string, string[]> = {
    north: ['north', 'galil', 'galil_upper', 'galil_lower', 'galil_west', 'kinneret', 'hermon', 'golan'],
    negev: ['negev', 'south', 'arava'],
  }

  async function fetchCaravans() {
    setLoading(true)
    let query = supabase
      .from('caravans')
      .select('*, caravan_images(url, "order")')
      .eq('status', 'active')
      .order('avg_rating', { ascending: false })

    if (filters.type) query = query.eq('caravan_type', filters.type)
    if (filters.region) {
      const regions = regionGroups[filters.region] || [filters.region]
      if (regions.length > 1) query = query.in('region', regions)
      else query = query.eq('region', regions[0])
    }
    if (filters.guests) query = query.gte('max_guests', parseInt(filters.guests))
    if (filters.instant) query = query.eq('instant_book', true)
    if (filters.relocate) query = query.eq('can_relocate', true)

    const { data } = await query
    setCaravans(data || [])
    setLoading(false)
  }

  return (
    <>
      <main className="min-h-screen pt-4" dir="rtl" style={{ background: '#FAF7F2' }}>



        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#2D1E0F' }}>קרוואנים להשכרה</h1>
            <p className="text-sm mt-0.5" style={{ color: '#9ca3af' }}>אוטו קרוואן, נגרר, ממוקם — חוויית טיול שלא תשכחו</p>
          </div>
          <span className="text-sm font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(139,105,20,0.08)', color: '#8B6914' }}>
            {loading ? 'טוען...' : `${caravans.length} קרוואנים`}
          </span>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-white border-b" style={{ borderColor: 'rgba(139,105,20,0.10)', boxShadow: '0 2px 12px rgba(139,105,20,0.06)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3" dir="rtl">

            {/* סוג קרוואן */}
            <div className="relative">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#8B6914' }}>סוג קרוואן</label>
              <button onClick={() => setOpenDropdown(openDropdown === 'type' ? null : 'type')}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-white flex items-center justify-between"
                style={{ borderColor: openDropdown === 'type' || filters.type ? '#8B6914' : '#e5e7eb', color: '#374151' }}>
                <span>{CARAVAN_TYPES.find(t => t.value === filters.type)?.label || 'כל הסוגים'}</span>
                <span style={{ color: '#8B6914' }}>▾</span>
              </button>
              {openDropdown === 'type' && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                  style={{ borderColor: '#e5e7eb' }}>
                  {[{ value: '', label: 'כל הסוגים' }, ...CARAVAN_TYPES].map(t => (
                    <button key={t.value} onClick={() => { setFilters(p => ({ ...p, type: t.value })); setOpenDropdown(null) }}
                      className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                      style={{ color: filters.type === t.value ? '#8B6914' : '#374151', fontWeight: filters.type === t.value ? '700' : '400' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* אזור */}
            <div className="relative">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#8B6914' }}>מאיזה אזור?</label>
              <button onClick={() => setOpenDropdown(openDropdown === 'region' ? null : 'region')}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-white flex items-center justify-between"
                style={{ borderColor: openDropdown === 'region' || filters.region ? '#8B6914' : '#e5e7eb', color: '#374151' }}>
                <span>{REGION_LABELS[filters.region] || 'כל הארץ'}</span>
                <span style={{ color: '#8B6914' }}>▾</span>
              </button>
              {openDropdown === 'region' && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                  style={{ borderColor: '#e5e7eb', maxHeight: '220px', overflowY: 'auto' }}>
                  {[['', 'כל הארץ'], ...Object.entries(REGION_LABELS)].map(([k, v]) => (
                    <button key={k} onClick={() => { setFilters(p => ({ ...p, region: k })); setOpenDropdown(null) }}
                      className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                      style={{ color: filters.region === k ? '#8B6914' : '#374151', fontWeight: filters.region === k ? '700' : '400' }}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* אורחים */}
            <div className="relative">
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#8B6914' }}>עד כמה אנשים?</label>
              <button onClick={() => setOpenDropdown(openDropdown === 'guests' ? null : 'guests')}
                className="w-full text-sm border rounded-xl px-3 py-2 bg-white flex items-center justify-between"
                style={{ borderColor: openDropdown === 'guests' || filters.guests ? '#8B6914' : '#e5e7eb', color: '#374151' }}>
                <span>{filters.guests ? (filters.guests === '11' ? 'מעל 10 אנשים' : `עד ${filters.guests} אנשים`) : 'כל הגדלים'}</span>
                <span style={{ color: '#8B6914' }}>▾</span>
              </button>
              {openDropdown === 'guests' && (
                <div className="absolute top-full right-0 mt-1 w-full bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
                  style={{ borderColor: '#e5e7eb' }}>
                  {[{ value: '', label: 'כל הגדלים' }, ...[2,3,4,5,6,8,10].map(n => ({ value: String(n), label: `עד ${n} אנשים` })), { value: '11', label: 'מעל 10 אנשים' }].map(o => (
                    <button key={o.value} onClick={() => { setFilters(p => ({ ...p, guests: o.value })); setOpenDropdown(null) }}
                      className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                      style={{ color: filters.guests === o.value ? '#8B6914' : '#374151', fontWeight: filters.guests === o.value ? '700' : '400' }}>
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* הצבה */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: '#8B6914' }}>מעוניינים בהצבה?</label>
              <div className="flex gap-2">
                <button onClick={() => setFilters(p => ({ ...p, relocate: true }))}
                  className="flex-1 text-sm py-2 rounded-xl border font-medium transition-all"
                  style={{ background: filters.relocate === true ? '#8B6914' : '#fff', color: filters.relocate === true ? '#fff' : '#6b7280', borderColor: filters.relocate === true ? '#8B6914' : '#e5e7eb' }}>
                  כן
                </button>
                <button onClick={() => setFilters(p => ({ ...p, relocate: false }))}
                  className="flex-1 text-sm py-2 rounded-xl border font-medium transition-all"
                  style={{ background: filters.relocate === false && filters.relocate !== undefined ? 'rgba(139,105,20,0.06)' : '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
                  לא משנה
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : caravans.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-5xl mb-4">🚐</div>
              <p className="text-lg font-medium text-gray-500 mb-2">לא נמצאו קרוואנים</p>
              <p className="text-sm text-gray-400">נסה לשנות את הפילטרים</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {caravans.map(c => {
                const img = c.caravan_images?.[0]?.url
                return (
                  <Link key={c.id} href={`/caravans/${c.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden group transition-all hover:shadow-lg" style={{ border: '1px solid rgba(139,105,20,0.08)' }}>
                      <div className="h-52 bg-gray-100 relative overflow-hidden rounded-t-2xl">
                        {img ? (
                          <Image src={img} alt={c.name} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-4xl">🚐</div>
                        )}
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                          <span className="bg-white/95 text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: '#8B6914' }}>
                            {TYPE_LABELS[c.caravan_type] || c.caravan_type}
                          </span>
                          {c.instant_book && <span className="bg-white/95 text-xs font-bold px-2.5 py-1 rounded-full text-amber-700">⚡ מיידי</span>}
                          {c.can_relocate && <span className="text-white text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#8B6914' }}>🚐 הצבה</span>}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-xs mb-0.5" style={{ color: '#9A7C5E' }}>{c.city || REGION_LABELS[c.region]}</p>
                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-amber-800 transition-colors">{c.name}</h3>
                          </div>
                          {c.avg_rating > 0 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0" style={{ background: 'rgba(139,105,20,0.06)' }}>
                              <span className="text-amber-400 text-xs">★</span>
                              <span className="text-xs font-bold" style={{ color: '#8B6914' }}>{c.avg_rating}</span>
                            </div>
                          )}
                        </div>
                        {c.short_description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{c.short_description}</p>}
                        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                          {c.sleeping_capacity > 0 && <span>🛏 {c.sleeping_capacity} מיטות</span>}
                          {c.max_guests > 0 && <span>👥 עד {c.max_guests}</span>}
                          {c.manufacture_year > 0 && <span>📅 {c.manufacture_year}</span>}
                        </div>
                        <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(139,105,20,0.06)' }}>
                          <div>
                            <span className="font-bold text-gray-900">₪{c.price_per_night?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 mr-1">/ לילה</span>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(139,105,20,0.06)', color: '#8B6914' }}>
                            לפרטים ←
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function CaravansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF7F2' }}><div className="text-gray-400">טוען...</div></div>}>
      <CaravansContent />
    </Suspense>
  )
}
