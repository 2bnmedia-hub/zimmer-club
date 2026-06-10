'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
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
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    region: searchParams.get('region') || '',
    guests: searchParams.get('guests') || '',
    instant: searchParams.get('instant') === 'true',
    relocate: searchParams.get('relocate') === 'true',
  })

  useEffect(() => { fetchCaravans() }, [filters])

  async function fetchCaravans() {
    setLoading(true)
    let query = supabase
      .from('caravans')
      .select('*, caravan_images(url, "order")')
      .eq('status', 'active')
      .order('avg_rating', { ascending: false })

    if (filters.type) query = query.eq('caravan_type', filters.type)
    if (filters.region) query = query.eq('region', filters.region)
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

        {/* Hero */}
        <div className="relative overflow-hidden mb-8" style={{ background: 'linear-gradient(135deg, #2D1E0F 0%, #4A2E12 50%, #2D1E0F 100%)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #C4956A 0%, transparent 60%), radial-gradient(circle at 80% 50%, #8B6914 0%, transparent 60%)' }} />
          <div className="max-w-7xl mx-auto px-6 py-12 relative">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C4956A', letterSpacing: '0.18em' }}>zimmer.club</p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: '#FAF7F2' }}>קרוואנים להשכרה</h1>
            <p className="text-sm" style={{ color: 'rgba(250,247,242,0.6)' }}>אוטו קרוואן, נגרר, ממוקם — חוויית טיול שלא תשכחו</p>
          </div>
        </div>

        {/* Filters */}
        <div className="sticky top-16 z-40 bg-white border-b px-4 py-3" style={{ borderColor: 'rgba(139,105,20,0.10)', boxShadow: '0 2px 12px rgba(139,105,20,0.06)' }}>
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>

            {/* Type filter */}
            <div className="flex items-center gap-1.5 shrink-0">
              {[{ value: '', label: 'הכל' }, ...CARAVAN_TYPES].map(t => (
                <button key={t.value}
                  onClick={() => setFilters(p => ({ ...p, type: t.value }))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap"
                  style={{
                    background: filters.type === t.value ? '#8B6914' : '#fff',
                    color: filters.type === t.value ? '#fff' : '#6b7280',
                    borderColor: filters.type === t.value ? '#8B6914' : '#e5e7eb',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="w-px h-5 shrink-0" style={{ background: 'rgba(139,105,20,0.15)' }} />

            {/* Region */}
            <select
              value={filters.region}
              onChange={e => setFilters(p => ({ ...p, region: e.target.value }))}
              className="text-xs border rounded-full px-3 py-1.5 outline-none shrink-0"
              style={{ borderColor: '#e5e7eb', color: '#374151' }}>
              <option value="">כל האזורים</option>
              {Object.entries(REGION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>

            {/* Guests */}
            <select
              value={filters.guests}
              onChange={e => setFilters(p => ({ ...p, guests: e.target.value }))}
              className="text-xs border rounded-full px-3 py-1.5 outline-none shrink-0"
              style={{ borderColor: '#e5e7eb', color: '#374151' }}>
              <option value="">כל הגדלים</option>
              {[2,3,4,5,6,8].map(n => <option key={n} value={n}>{n}+ אורחים</option>)}
            </select>

            <div className="w-px h-5 shrink-0" style={{ background: 'rgba(139,105,20,0.15)' }} />

            {/* Toggles */}
            {[
              { key: 'instant', label: '⚡ מיידי' },
              { key: 'relocate', label: '🚐 כולל הצבה' },
            ].map(({ key, label }) => (
              <button key={key}
                onClick={() => setFilters(p => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0"
                style={{
                  background: filters[key as keyof typeof filters] ? 'rgba(139,105,20,0.08)' : '#fff',
                  color: filters[key as keyof typeof filters] ? '#8B6914' : '#6b7280',
                  borderColor: filters[key as keyof typeof filters] ? '#8B6914' : '#e5e7eb',
                }}>
                {label}
              </button>
            ))}

            <span className="text-xs mr-auto shrink-0" style={{ color: '#9ca3af' }}>
              {loading ? 'טוען...' : `${caravans.length} קרוואנים`}
            </span>
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
                  <Link key={c.id} href={`/caravans/${c.slug || c.id}`}>
                    <div className="bg-white rounded-2xl overflow-hidden group transition-all hover:shadow-lg" style={{ border: '1px solid rgba(139,105,20,0.08)' }}>
                      <div className="h-52 bg-gray-100 relative overflow-hidden">
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
      <Footer />
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
