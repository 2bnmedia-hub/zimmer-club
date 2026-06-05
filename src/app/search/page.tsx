'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { Search, SlidersHorizontal, X, Star } from 'lucide-react'
import { REGIONS } from '@/lib/constants'

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

function SearchContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    minPrice: '',
    maxPrice: '',
    guests: searchParams.get('guests') || '',
    instant_book: false,
  })

  useEffect(() => { fetchProperties() }, [filters])

  async function fetchProperties() {
    setLoading(true)
    let query = supabase
      .from('properties')
      .select('*, property_images(url, "order")')
      .eq('status', 'active')
    if (filters.category) query = query.contains('category', [filters.category])
    if (filters.region) query = query.eq('region', filters.region)
    if (filters.minPrice) query = query.gte('price_per_night', parseInt(filters.minPrice))
    if (filters.maxPrice) query = query.lte('price_per_night', parseInt(filters.maxPrice))
    if (filters.guests) query = query.gte('max_guests', parseInt(filters.guests))
    if (filters.instant_book) query = query.eq('instant_book', true)
    const { data } = await query.order('avg_rating', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  const clearFilters = () => setFilters({ category: '', region: '', minPrice: '', maxPrice: '', guests: '', instant_book: false })
  const activeFiltersCount = Object.values(filters).filter(v => v !== '' && v !== false).length

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-24" dir="rtl">
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="חיפוש לפי שם או מיקום..." className="flex-1 bg-transparent text-sm outline-none text-gray-700" dir="rtl" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              פילטרים
              {activeFiltersCount > 0 && <span className="bg-yellow-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
          </div>
          {showFilters && (
            <div className="max-w-7xl mx-auto mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <select value={filters.category} onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" style={{backgroundColor: '#D4C4A8'}}>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select value={filters.region} onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" style={{backgroundColor: '#D4C4A8'}}>
<option value="">כל האיזורים</option>
                <option value="galil_north">צימרים בצפון</option>
                <option value="galil_west">צימרים בגליל המערבי</option>
                <option value="galil_upper">צימרים בגליל העליון</option>
                <option value="galil_lower">צימרים בגליל התחתון</option>
                <option value="kinneret">צימרים בכנרת</option>
                <option value="hermon">צימרים בחרמון</option>
                <option value="center">צימרים במרכז</option>
                <option value="jerusalem">צימרים בירושלים</option>
                <option value="dead_sea">צימרים בים המלח</option>
                <option value="negev">צימרים בדרום</option>
                <option value="eilat">צימרים באילת</option>

              </select>
              <input type="number" placeholder="מחיר מינימום" value={filters.minPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <input type="number" placeholder="מחיר מקסימום" value={filters.maxPrice}
                onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <input type="number" placeholder="מספר אורחים" value={filters.guests}
                onChange={(e) => setFilters(prev => ({ ...prev, guests: e.target.value }))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none" />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.instant_book}
                    onChange={(e) => setFilters(prev => ({ ...prev, instant_book: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-600" />
                  הזמנה מיידית
                </label>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500">
                    <X className="w-3 h-3" />נקה
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-sm text-gray-500 mb-6">{loading ? 'מחפש...' : `נמצאו ${properties.length} נכסים`}</p>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">לא נמצאו נכסים</p>
              <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: '#8B6914' }}>נקה פילטרים</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const firstImage = p.property_images?.[0]?.url
                return (
                  <Link key={p.id} href={`/properties/${p.id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      {firstImage ? (
                        <img src={firstImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">אין תמונה</div>
                      )}
                      {p.instant_book && (
                        <span className="absolute top-3 right-3 bg-white text-xs font-bold px-2 py-1 rounded-full text-yellow-700">הזמנה מיידית</span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-base group-hover:text-yellow-700 transition-colors">{p.name}</h3>
                        {p.avg_rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span>{p.avg_rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{p.city || REGIONS[p.region as keyof typeof REGIONS]?.label}</p>
                      {p.short_description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.short_description}</p>}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-gray-900">₪{p.price_per_night}</span>
                          <span className="text-xs text-gray-500"> / לילה</span>
                        </div>
                        <span className="text-xs text-gray-400">עד {p.max_guests} אורחים</span>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>}>
      <SearchContent />
    </Suspense>
  )
}
