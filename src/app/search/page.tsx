'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { Heart } from 'lucide-react'
import { REGIONS } from '@/lib/constants'
import { useWishlist } from '@/hooks/useWishlist'

type Property = {
  id: string
  name: string
  short_description: string
  category: string[]
  region: string
  city: string
  price_per_night: number
  max_guests: number
  avg_rating: number
  total_reviews: number
  instant_book: boolean
  accepts_miluim?: boolean
  has_shelter?: boolean
  property_images: { url: string }[]
}

const PROPERTY_TYPES = [
  { value: '', label: 'הכל' },
  { value: 'zimmer', label: 'צימרים' },
  { value: 'villa', label: 'וילות' },
  { value: 'hotel', label: 'מלונות' },
  { value: 'camping', label: 'קמפינג' },
  { value: 'caravan', label: 'קרוואנים' },
]

const AMENITY_LABELS: Record<string, string> = {
  pool: 'בריכה', jacuzzi: "ג'קוזי", wifi: 'WiFi', parking: 'חניה', bbq: 'ברביקיו',
  ac: 'מיזוג אוויר', kitchen: 'מטבח', fireplace: 'קמין', garden: 'גינה',
  sea_view: 'נוף לים', mountain_view: 'נוף להרים', sauna: 'סאונה', gym: 'חדר כושר',
  baby_cot: 'עריסה לתינוק', wheelchair: 'נגיש לנכים', shelter: 'מרחב מוגן',
  heated_pool: 'בריכה מחוממת', pets: 'ידידותי לכלבים', spa: 'ספא צמוד',
  private_pool: 'בריכה פרטית', snooker: 'שולחן סנוקר', private_jacuzzi: "ג'קוזי פרטי",
  suite: 'סוויטה', treehouse: 'בקתת עץ', cave: 'צימר מערה',
  mobile: 'צימר מבודד', longstay: 'לטווח ארוך', vacation: 'דירת נופש',
  shelter_nearby: 'מרחב מוגן קרוב',
}

const AUDIENCE_AMENITIES: Record<string, string> = {
  couples: 'זוגות', families: 'משפחות', groups: 'קבוצות',
  religious: 'דתיים', animals: 'בע״ח', accessible: 'נגישות', guests: 'אירועים',
}

const FEATURE_AMENITIES = Object.keys(AMENITY_LABELS)

function PriceRangeSlider({ min, max, value, onChange }: {
  min: number, max: number, value: [number, number],
  onChange: (v: [number, number]) => void
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">₪{min.toLocaleString()}</span>
        <div className="flex items-center gap-2">
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm font-bold text-amber-800">
            ₪{value[0].toLocaleString()}
          </div>
          <span className="text-gray-300">—</span>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-sm font-bold text-amber-800">
            ₪{value[1].toLocaleString()}
          </div>
        </div>
        <span className="text-xs text-gray-400">₪{max.toLocaleString()}</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-gray-100 rounded-full" />
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            background: 'linear-gradient(90deg, #C4956A, #8B6914)',
            left: `${pct(value[0])}%`,
            right: `${100 - pct(value[1])}%`,
          }}
        />
        <input type="range" min={min} max={max} step={100} value={value[0]}
          onChange={e => onChange([Math.min(Number(e.target.value), value[1] - 100), value[1]])}
          className="absolute w-full h-1.5 opacity-0 cursor-pointer z-10" />
        <input type="range" min={min} max={max} step={100} value={value[1]}
          onChange={e => onChange([value[0], Math.max(Number(e.target.value), value[0] + 100)])}
          className="absolute w-full h-1.5 opacity-0 cursor-pointer z-20" />
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-amber-600 shadow-md pointer-events-none"
          style={{ left: `calc(${pct(value[0])}% - 8px)` }} />
        <div className="absolute w-4 h-4 rounded-full bg-white border-2 border-amber-600 shadow-md pointer-events-none"
          style={{ left: `calc(${pct(value[1])}% - 8px)` }} />
      </div>
    </div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toggle, isLiked } = useWishlist()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showAmenities, setShowAmenities] = useState(false)
  const [showAudience, setShowAudience] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 35000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    guests: searchParams.get('guests') || '',
    instant_book: false,
    accepts_miluim: false,
    has_shelter: false,
  })

  useEffect(() => { fetchProperties() }, [filters, priceRange, selectedAmenities])

  async function fetchProperties() {
    setLoading(true)
    let query = supabase
      .from('properties')
      .select('*, property_images(url, "order")')
      .eq('status', 'active')
      .gte('price_per_night', priceRange[0])
      .lte('price_per_night', priceRange[1])

    if (filters.category) query = query.contains('category', [filters.category])
    if (filters.region) query = query.eq('region', filters.region)
    if (filters.guests) query = query.gte('max_guests', parseInt(filters.guests))
    if (filters.instant_book) query = query.eq('instant_book', true)
    if (filters.accepts_miluim) query = query.eq('accepts_miluim', true)
    if (filters.has_shelter) query = query.eq('has_shelter', true)

    const { data } = await query.order('avg_rating', { ascending: false })
    let results = data || []

    if (selectedAmenities.length > 0) {
      const { data: amenData } = await supabase.from('amenities').select('id, key').in('key', selectedAmenities)
      const amenIds = amenData?.map((a: any) => a.id) || []
      if (amenIds.length > 0) {
        const { data: paData } = await supabase.from('property_amenities').select('property_id, amenity_id').in('amenity_id', amenIds)
        const map: Record<string, string[]> = {}
        paData?.forEach((pa: any) => {
          if (!map[pa.property_id]) map[pa.property_id] = []
          map[pa.property_id].push(pa.amenity_id)
        })
        results = results.filter(p => amenIds.every((id: string) => (map[p.id] || []).includes(id)))
      }
    }

    setProperties(results)
    setLoading(false)
  }

  const clearFilters = () => {
    setFilters({ category: '', region: '', guests: '', instant_book: false, accepts_miluim: false, has_shelter: false })
    setPriceRange([200, 35000])
    setSelectedAmenities([])
  }

  const toggleAmenity = (key: string) =>
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const activeCount = [
    filters.category, filters.region, filters.guests,
    filters.instant_book, filters.accepts_miluim, filters.has_shelter,
    selectedAmenities.length > 0, priceRange[0] > 200 || priceRange[1] < 35000,
  ].filter(Boolean).length

  const labelClass = "block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2"
  const selectClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-amber-400 bg-white"

  return (
    <>
      <main className="min-h-screen bg-[#FAF7F2] pt-24" dir="rtl">

        {/* סרגל עליון */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="w-64 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input type="text" placeholder="שם או מיקום..." className="flex-1 bg-transparent text-sm outline-none text-gray-700" dir="rtl" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${showFilters ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              חיפוש מתקדם
              {activeCount > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{activeCount}</span>}
            </button>
            <span className="text-sm text-gray-400 mr-auto">
              {loading ? 'מחפש...' : `${properties.length} נכסים`}
            </span>
          </div>
        </div>

        {/* פאנל פילטרים */}
        {showFilters && (
          <div className="bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 py-6 space-y-6" dir="rtl">

              {/* שורה 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClass}>סוג נכס</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PROPERTY_TYPES.map(t => (
                      <button key={t.value} onClick={() => setFilters(p => ({ ...p, category: t.value }))}
                        className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                        style={{
                          background: filters.category === t.value ? '#8B6914' : '#fff',
                          color: filters.category === t.value ? '#fff' : '#6b7280',
                          borderColor: filters.category === t.value ? '#8B6914' : '#e5e7eb',
                        }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>אזור בארץ</label>
                  <select value={filters.region} onChange={e => setFilters(p => ({ ...p, region: e.target.value }))} className={selectClass}>
                    <option value="">כל הארץ</option>
                    {['הצפון','גליל המערבי','גליל העליון','גליל התחתון','כנרת','חרמון','מרכז','ירושלים','ים המלח','דרום','אילת','רמת הגולן'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>מספר אורחים</label>
                  <select value={filters.guests} onChange={e => setFilters(p => ({ ...p, guests: e.target.value }))} className={selectClass}>
                    <option value="">כל הגדלים</option>
                    {[1,2,3,4,5,6,8,10,12,15,20].map(n => <option key={n} value={n}>{n}+ אורחים</option>)}
                  </select>
                </div>
              </div>

              {/* מחיר */}
              <div>
                <label className={labelClass}>מחיר ללילה</label>
                <PriceRangeSlider min={200} max={35000} value={priceRange} onChange={setPriceRange} />
              </div>

              {/* מה יש בנכס */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setShowAmenities(!showAmenities)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    מה יש בנכס
                    {selectedAmenities.filter(k => FEATURE_AMENITIES.includes(k)).length > 0 &&
                      <span className="bg-amber-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                        {selectedAmenities.filter(k => FEATURE_AMENITIES.includes(k)).length}
                      </span>}
                  </span>
                  {showAmenities ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showAmenities && (
                  <div className="p-4 grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
                    {FEATURE_AMENITIES.map(key => (
                      <button key={key} onClick={() => toggleAmenity(key)}
                        className="py-2 px-2 rounded-xl text-xs font-medium border transition-all text-center"
                        style={{
                          background: selectedAmenities.includes(key) ? '#FEF3C7' : '#fff',
                          borderColor: selectedAmenities.includes(key) ? '#D97706' : '#e5e7eb',
                          color: selectedAmenities.includes(key) ? '#92400E' : '#6b7280',
                        }}>
                        {AMENITY_LABELS[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* קהל יעד */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setShowAudience(!showAudience)}
                  className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    קהל יעד
                    {selectedAmenities.filter(k => Object.keys(AUDIENCE_AMENITIES).includes(k)).length > 0 &&
                      <span className="bg-amber-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                        {selectedAmenities.filter(k => Object.keys(AUDIENCE_AMENITIES).includes(k)).length}
                      </span>}
                  </span>
                  {showAudience ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showAudience && (
                  <div className="p-4 flex flex-wrap gap-2">
                    {Object.entries(AUDIENCE_AMENITIES).map(([key, label]) => (
                      <button key={key} onClick={() => toggleAmenity(key)}
                        className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                        style={{
                          background: selectedAmenities.includes(key) ? '#FEF3C7' : '#fff',
                          borderColor: selectedAmenities.includes(key) ? '#D97706' : '#e5e7eb',
                          color: selectedAmenities.includes(key) ? '#92400E' : '#6b7280',
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* checkboxes + נקה */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-6">
                  {[
                    { key: 'instant_book', label: '⚡ הזמנה מיידית' },
                    { key: 'accepts_miluim', label: '🪖 שובר מילואים' },
                    { key: 'has_shelter', label: '🛡️ מרחב מוגן' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${(filters as any)[key] ? 'bg-amber-600 border-amber-600' : 'border-gray-300 group-hover:border-amber-400'}`}>
                        {(filters as any)[key] && <span className="text-white text-xs">✓</span>}
                      </div>
                      <input type="checkbox" checked={(filters as any)[key]}
                        onChange={e => setFilters(p => ({ ...p, [key]: e.target.checked }))}
                        className="sr-only" />
                      <span className="text-sm text-gray-700 font-medium">{label}</span>
                    </label>
                  ))}
                </div>
                {activeCount > 0 && (
                  <button onClick={clearFilters}
                    className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 font-medium transition-colors">
                    <X className="w-4 h-4" /> נקה הכל
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

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
                    <div className="h-3 bg-gray-100 rounded-lg w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">לא נמצאו נכסים</p>
              <p className="text-gray-400 text-sm mb-6">נסה לשנות את הפילטרים</p>
              <button onClick={clearFilters}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
                style={{ backgroundColor: '#8B6914' }}>
                נקה פילטרים
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const firstImage = p.property_images?.[0]?.url
                return (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative">
                    <Link href={`/${p.slug || p.id}`}>
                      <div className="h-52 bg-gray-100 relative overflow-hidden">
                        {firstImage ? (
                          <img src={firstImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">אין תמונה</div>
                        )}
                        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                          {p.instant_book && <span className="bg-white/95 backdrop-blur-sm text-xs font-bold px-2.5 py-1 rounded-full text-amber-700 shadow-sm">⚡ מיידית</span>}
                          {p.accepts_miluim && <span className="bg-green-600/95 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">🪖 מילואים</span>}
                          {p.has_shelter && <span className="bg-orange-400/95 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">🛡️ מרחב מוגן</span>}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">{p.city || REGIONS[p.region as keyof typeof REGIONS]?.label}</p>
                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-amber-800 transition-colors">{p.name}</h3>
                          </div>
                          {p.avg_rating > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-amber-800">{p.avg_rating}</span>
                            </div>
                          )}
                        </div>
                        {p.short_description && <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{p.short_description}</p>}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div>
                            <span className="font-bold text-gray-900 text-base">₪{p.price_per_night.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 mr-1">/ לילה</span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">עד {p.max_guests} אורחים</span>
                        </div>
                      </div>
                    </Link>
                    <button onClick={() => toggle(p.id)}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all hover:scale-110">
                      <Heart className={`w-4 h-4 transition-colors ${isLiked(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><div className="text-gray-400">טוען...</div></div>}>
      <SearchContent />
    </Suspense>
  )
}
