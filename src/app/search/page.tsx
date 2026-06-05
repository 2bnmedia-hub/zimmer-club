'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { Search, SlidersHorizontal, X, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { REGIONS } from '@/lib/constants'
import { useWishlist } from '@/hooks/useWishlist'
import { Heart } from 'lucide-react'

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
  accessible: 'נגישות', couples: 'מתאים לזוגות', families: 'מתאים למשפחות',
  groups: 'מתאים לקבוצות', animals: 'מקבלים בע״ח', guests: 'מתאים לאירועים',
  religious: 'מתאים לדתיים', suite: 'סוויטה', treehouse: 'בקתת עץ',
  cave: 'צימר מערה', mobile: 'צימר מבודד', longstay: 'לטווח ארוך',
  vacation: 'דירת נופש', shelter_nearby: 'מרחב מוגן קרוב',
}

const AUDIENCE_AMENITIES = ['couples', 'families', 'groups', 'religious', 'animals', 'accessible', 'guests', 'longstay']
const FEATURE_AMENITIES = Object.keys(AMENITY_LABELS).filter(k => !AUDIENCE_AMENITIES.includes(k))

function SearchContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toggle, isLiked } = useWishlist()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showAmenities, setShowAmenities] = useState(false)
  const [showAudience, setShowAudience] = useState(false)
  const [priceRange, setPriceRange] = useState([200, 35000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    guests: searchParams.get('guests') || '',
    instant_book: false,
    accepts_miluim: false,
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

    const { data } = await query.order('avg_rating', { ascending: false })
    let results = data || []

    // פילטר amenities בצד לקוח
    if (selectedAmenities.length > 0) {
      const amenityIds = await getAmenityIds(selectedAmenities)
      if (amenityIds.length > 0) {
        const { data: paData } = await supabase
          .from('property_amenities')
          .select('property_id, amenity_id')
          .in('amenity_id', amenityIds)

        const propertyAmenityMap: Record<string, string[]> = {}
        paData?.forEach((pa: any) => {
          if (!propertyAmenityMap[pa.property_id]) propertyAmenityMap[pa.property_id] = []
          propertyAmenityMap[pa.property_id].push(pa.amenity_id)
        })

        results = results.filter(p => {
          const pAmenities = propertyAmenityMap[p.id] || []
          return amenityIds.every(id => pAmenities.includes(id))
        })
      }
    }

    setProperties(results)
    setLoading(false)
  }

  async function getAmenityIds(keys: string[]) {
    const { data } = await supabase.from('amenities').select('id').in('key', keys)
    return data?.map((a: any) => a.id) || []
  }

  const clearFilters = () => {
    setFilters({ category: '', region: '', guests: '', instant_book: false, accepts_miluim: false })
    setPriceRange([200, 35000])
    setSelectedAmenities([])
  }

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const activeFiltersCount = [
    filters.category, filters.region, filters.guests,
    filters.instant_book, filters.accepts_miluim,
    selectedAmenities.length > 0,
    priceRange[0] > 200 || priceRange[1] < 35000
  ].filter(Boolean).length

  return (
    <>
      <main className="min-h-screen bg-gray-50 pt-24" dir="rtl">

        {/* סרגל חיפוש עליון */}
        <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
              <Search className="w-4 h-4 text-gray-400" />
              <input type="text" placeholder="חיפוש לפי שם או מיקום..." className="flex-1 bg-transparent text-sm outline-none text-gray-700" dir="rtl" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${showFilters ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
              <SlidersHorizontal className="w-4 h-4" />
              חיפוש מתקדם
              {activeFiltersCount > 0 && <span className="bg-yellow-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        {/* פאנל פילטרים */}
        {showFilters && (
          <div className="bg-white border-b border-gray-100 shadow-sm" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

              {/* שורה 1: סוג נכס + איזור + אורחים */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">סוג נכס</label>
                  <div className="flex flex-wrap gap-2">
                    {PROPERTY_TYPES.map(t => (
                      <button key={t.value} onClick={() => setFilters(prev => ({ ...prev, category: t.value }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${filters.category === t.value ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">אזור בארץ</label>
                  <select value={filters.region} onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-500">
                    <option value="">כל הארץ</option>
                    <option value="הצפון">הצפון</option>
                    <option value="גליל המערבי">גליל המערבי</option>
                    <option value="גליל העליון">גליל העליון</option>
                    <option value="גליל התחתון">גליל התחתון</option>
                    <option value="כנרת">כנרת</option>
                    <option value="חרמון">חרמון</option>
                    <option value="מרכז">מרכז</option>
                    <option value="ירושלים">ירושלים</option>
                    <option value="ים המלח">ים המלח</option>
                    <option value="דרום">דרום</option>
                    <option value="אילת">אילת</option>
                    <option value="רמת הגולן">רמת הגולן</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">מספר אורחים</label>
                  <select value={filters.guests} onChange={(e) => setFilters(prev => ({ ...prev, guests: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-500">
                    <option value="">כל הגדלים</option>
                    {[1,2,3,4,5,6,8,10,12,15,20].map(n => (
                      <option key={n} value={n}>{n}+ אורחים</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* טווח מחירים */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-3">
                  טווח מחיר ללילה: <span className="text-yellow-700">₪{priceRange[0].toLocaleString()} — ₪{priceRange[1].toLocaleString()}</span>
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400 whitespace-nowrap">₪200</span>
                  <div className="flex-1 space-y-2">
                    <input type="range" min={200} max={35000} step={100}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange(prev => [Math.min(Number(e.target.value), prev[1] - 100), prev[1]])}
                      className="w-full accent-yellow-600" />
                    <input type="range" min={200} max={35000} step={100}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange(prev => [prev[0], Math.max(Number(e.target.value), prev[0] + 100)])}
                      className="w-full accent-yellow-600" />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">₪35,000</span>
                </div>
              </div>

              {/* מה יש בנכס */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setShowAmenities(!showAmenities)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-bold text-gray-700">
                    מה יש בנכס
                    {selectedAmenities.filter(k => FEATURE_AMENITIES.includes(k)).length > 0 &&
                      <span className="mr-2 bg-yellow-600 text-white text-xs rounded-full px-2 py-0.5">
                        {selectedAmenities.filter(k => FEATURE_AMENITIES.includes(k)).length}
                      </span>}
                  </span>
                  {showAmenities ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showAmenities && (
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {FEATURE_AMENITIES.map(key => (
                      <button key={key} onClick={() => toggleAmenity(key)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors text-right ${selectedAmenities.includes(key) ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-300'}`}>
                        {AMENITY_LABELS[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* קהל יעד */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button onClick={() => setShowAudience(!showAudience)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-bold text-gray-700">
                    קהל יעד
                    {selectedAmenities.filter(k => AUDIENCE_AMENITIES.includes(k)).length > 0 &&
                      <span className="mr-2 bg-yellow-600 text-white text-xs rounded-full px-2 py-0.5">
                        {selectedAmenities.filter(k => AUDIENCE_AMENITIES.includes(k)).length}
                      </span>}
                  </span>
                  {showAudience ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {showAudience && (
                  <div className="p-4 flex flex-wrap gap-2">
                    {AUDIENCE_AMENITIES.map(key => (
                      <button key={key} onClick={() => toggleAmenity(key)}
                        className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${selectedAmenities.includes(key) ? 'bg-yellow-50 border-yellow-500 text-yellow-800' : 'bg-white border-gray-200 text-gray-600 hover:border-yellow-300'}`}>
                        {AMENITY_LABELS[key]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* checkboxes */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.instant_book}
                    onChange={(e) => setFilters(prev => ({ ...prev, instant_book: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">הזמנה מיידית בלבד</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.accepts_miluim}
                    onChange={(e) => setFilters(prev => ({ ...prev, accepts_miluim: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">🪖 מקבלים שובר מילואים</span>
                </label>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
                    <X className="w-4 h-4" /> נקה הכל
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* תוצאות */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-sm text-gray-500 mb-6">
            {loading ? 'מחפש...' : `נמצאו ${properties.length} נכסים`}
          </p>

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
              <p className="text-gray-400 text-sm mb-6">נסה לשנות את הפילטרים</p>
              <button onClick={clearFilters} className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ backgroundColor: '#8B6914' }}>נקה פילטרים</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((p) => {
                const firstImage = p.property_images?.[0]?.url
                return (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative">
                    <Link href={`/properties/${p.id}`}>
                      <div className="h-48 bg-gray-200 relative overflow-hidden">
                        {firstImage ? (
                          <img src={firstImage} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">אין תמונה</div>
                        )}
                        <div className="absolute top-3 right-3 flex flex-col gap-1">
                          {p.instant_book && <span className="bg-white text-xs font-bold px-2 py-1 rounded-full text-yellow-700">⚡ מיידית</span>}
                          {p.accepts_miluim && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">🪖 מילואים</span>}
                          {p.has_shelter && <span className="bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">🛡️ מרחב מוגן</span>}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-bold text-gray-900 text-base group-hover:text-yellow-700 transition-colors">{p.name}</h3>
                          {p.avg_rating > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 shrink-0">
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
                    <button onClick={() => toggle(p.id)}
                      className="absolute top-3 left-3 bg-white/90 hover:bg-white p-1.5 rounded-full shadow-md transition-all hover:scale-110">
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>}>
      <SearchContent />
    </Suspense>
  )
}
