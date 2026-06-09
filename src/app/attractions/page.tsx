'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { Search, Star } from 'lucide-react'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'

const REGIONS = [
  { value: 'north', label: 'צפון' },
  { value: 'galil_west', label: 'גליל המערבי' },
  { value: 'galil_upper', label: 'גליל העליון' },
  { value: 'galil_lower', label: 'גליל התחתון' },
  { value: 'kinneret', label: 'כנרת' },
  { value: 'hermon', label: 'חרמון' },
  { value: 'center', label: 'מרכז' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'dead_sea', label: 'ים המלח' },
  { value: 'negev', label: 'דרום' },
  { value: 'eilat', label: 'אילת' },
  { value: 'golan', label: 'רמת הגולן' },
]

const AUDIENCE = [
  { value: 'couples', label: 'זוגות' },
  { value: 'families', label: 'משפחות' },
  { value: 'groups', label: 'קבוצות' },
  { value: 'kids', label: 'ילדים' },
]

type Attraction = {
  id: string
  slug?: string
  name: string
  short_description: string
  region: string
  city: string
  price_per_night: number
  max_guests: number
  avg_rating: number
  property_images: { url: string }[]
}

function AttractionsContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toggle, isLiked } = useWishlist()
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState(searchParams.get('region') || '')
  const [audience, setAudience] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchAttractions() }, [region, audience])

  async function fetchAttractions() {
    setLoading(true)
    let query = supabase
      .from('properties')
      .select('*, property_images(url, "order")')
      .eq('status', 'active')
      .contains('category', ['attraction'])

    if (region) query = query.eq('region', region)

    const { data } = await query.order('avg_rating', { ascending: false })
    let results = data || []

    if (audience) {
      const { data: amenData } = await supabase.from('amenities').select('id, key').eq('key', audience)
      const amenIds = amenData?.map((a: any) => a.id) || []
      if (amenIds.length > 0) {
        const { data: paData } = await supabase.from('property_amenities').select('property_id, amenity_id').in('amenity_id', amenIds)
        const propertyIds = new Set(paData?.map((pa: any) => pa.property_id))
        results = results.filter(p => propertyIds.has(p.id))
      }
    }

    setAttractions(results)
    setLoading(false)
  }

  const filtered = search
    ? attractions.filter(a => a.name.includes(search) || a.city?.includes(search) || a.short_description?.includes(search))
    : attractions

  return (
    <>
      <main className="min-h-screen bg-[#FAF7F2] pt-4" dir="rtl">

        {/* כותרת */}
        <div className="bg-white border-b border-gray-100 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">אטרקציות</h1>
            <p className="text-sm text-gray-400">חוויות ופעילויות בכל רחבי הארץ</p>
          </div>
        </div>

        {/* פילטרים */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

            {/* חיפוש חופשי */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input type="text" placeholder="חפש אטרקציה..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700" dir="rtl" />
            </div>

            {/* איזור */}
            <select value={region} onChange={e => setRegion(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none focus:border-amber-400 bg-white">
              <option value="">כל הארץ</option>
              {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>

            {/* קהל יעד */}
            <div className="flex gap-2 flex-wrap">
              {AUDIENCE.map(a => (
                <button key={a.value} onClick={() => setAudience(prev => prev === a.value ? '' : a.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: audience === a.value ? '#8B6914' : '#fff',
                    color: audience === a.value ? '#fff' : '#6b7280',
                    borderColor: audience === a.value ? '#8B6914' : '#e5e7eb',
                  }}>
                  {a.label}
                </button>
              ))}
            </div>

            <span className="text-sm text-gray-400 mr-auto">
              {loading ? 'מחפש...' : `${filtered.length} אטרקציות`}
            </span>
          </div>
        </div>

        {/* תוצאות */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">לא נמצאו אטרקציות</p>
              <p className="text-gray-400 text-sm">נסה לשנות את הפילטרים</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a) => {
                const firstImage = a.property_images?.[0]?.url
                return (
                  <div key={a.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative">
                    <Link href={`/${a.slug || a.id}`}>
                      <div className="h-52 bg-gray-100 relative overflow-hidden">
                        {firstImage ? (
                          <img src={firstImage} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">🎯</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">{a.city || REGIONS.find(r => r.value === a.region)?.label}</p>
                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-amber-800 transition-colors">{a.name}</h3>
                          </div>
                          {a.avg_rating > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-amber-800">{a.avg_rating}</span>
                            </div>
                          )}
                        </div>
                        {a.short_description && <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{a.short_description}</p>}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div>
                            <span className="font-bold text-gray-900 text-base">₪{a.price_per_night?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 mr-1">/ כניסה</span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">עד {a.max_guests} משתתפים</span>
                        </div>
                      </div>
                    </Link>
                    <button onClick={() => toggle(a.id)}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all hover:scale-110">
                      <Heart className={`w-4 h-4 transition-colors ${isLiked(a.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
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

export default function AttractionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><div className="text-gray-400">טוען...</div></div>}>
      <AttractionsContent />
    </Suspense>
  )
}
