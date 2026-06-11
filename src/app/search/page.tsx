'use client'

import { useEffect, useState, Suspense, useRef, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'

type Property = {
  slug?: string
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
  { value: 'zimmer', label: 'צימר' },
  { value: 'complex', label: 'מתחם צימרים' },
  { value: 'villa', label: 'וילות ובקתות' },
  { value: 'caravan', label: 'קרוואנים' },
  { value: 'hotel', label: 'מלונות' },
  { value: 'camping', label: 'קמפינג' },
  { value: 'attraction', label: 'אטרקציות' },
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
  const [textSearch, setTextSearch] = useState(searchParams.get('q') || '')
  const [suggestions, setSuggestions] = useState<{id:string, name:string, city:string, category:string[]}[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [showAmenities, setShowAmenities] = useState(false)
  const [showAudience, setShowAudience] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([200, 35000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: searchParams.get('available') || searchParams.get('category') || '',
    region: searchParams.get('region') || '',
    guests: searchParams.get('guests') || '',
    check_in: searchParams.get('check_in') || '',
    check_out: searchParams.get('check_out') || '',
    instant_book: searchParams.get('instant') === 'true',
    accepts_miluim: false,
    has_shelter: false,
    amenity: searchParams.get('amenity') || '',
  })

  // עדכן filters כשה-URL משתנה
  useEffect(() => {
    setFilters({
      category: searchParams.get('available') || searchParams.get('category') || '',
      region: searchParams.get('region') || '',
      guests: searchParams.get('guests') || '',
      check_in: searchParams.get('check_in') || '',
      check_out: searchParams.get('check_out') || '',
      instant_book: searchParams.get('instant') === 'true',
      accepts_miluim: false,
      has_shelter: false,
      amenity: searchParams.get('amenity') || '',
    })
  }, [searchParams])

  useEffect(() => { fetchProperties() }, [filters, priceRange, selectedAmenities, textSearch])

  // סגור הצעות בלחיצה מחוץ
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchSuggestions(q: string) {
    if (q.length < 2) { setSuggestions([]); return }
    const { data } = await supabase
      .from('properties')
      .select('id, name, city, category')
      .eq('status', 'active')
      .or(`name.ilike.%${q}%,city.ilike.%${q}%,short_description.ilike.%${q}%`)
      .limit(6)
    setSuggestions(data || [])
    setShowSuggestions(true)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps

  async function fetchProperties() {
    setLoading(true)

    // קרוואנים — שליפה מטבלה נפרדת
    if (filters.category === 'caravan') {
      let q = supabase.from('caravans').select('*, caravan_images(url, "order")').eq('status', 'active')
      if (filters.region) q = q.eq('region', filters.region)
      if (filters.guests) q = q.gte('max_guests', parseInt(filters.guests))
      const { data } = await q.order('avg_rating', { ascending: false })
      const results = (data || []).map((c: any) => ({
        ...c,
        category: ['caravan'],
        property_images: c.caravan_images || [],
        price_per_night: c.price_per_night,
      }))
      setProperties(results)
      setLoading(false)
      return
    }

    // אטרקציות — שליפה מטבלה נפרדת
    if (filters.category === 'attraction') {
      let q = supabase.from('attractions').select('*, attraction_images(url, "order")').eq('status', 'active')
      if (filters.region) q = q.eq('region', filters.region)
      const { data } = await q.order('avg_rating', { ascending: false })
      const results = (data || []).map((a: any) => ({
        ...a,
        category: ['attraction'],
        property_images: a.attraction_images || [],
        price_per_night: a.price_per_person || 0,
      }))
      setProperties(results)
      setLoading(false)
      return
    }

    let query = supabase
      .from('properties')
      .select('*, property_images(url, "order")')
      .eq('status', 'active')
      .gte('price_per_night', priceRange[0])
      .lte('price_per_night', priceRange[1])

    // קטגוריות קהל יעד — מגיעות מדף הבית דרך CATEGORIES
    const AUDIENCE_KEYS = ['romantic', 'family', 'families', 'luxury', 'nature', 'beach', 'desert', 'pet_friendly']
    // מיפוי קטגוריות דף הבית למפתחות amenities
    const categoryMap: Record<string, string> = { family: 'families', pet_friendly: 'pets' }
    const mappedCategory = filters.category ? (categoryMap[filters.category] || filters.category) : ''
    const SPECIAL_KEYS = ['weekend', 'last']
    const isAudienceCategory = filters.category && AUDIENCE_KEYS.includes(filters.category)
    const isSpecialCategory = filters.category && SPECIAL_KEYS.includes(filters.category)

    if (filters.category && !isAudienceCategory && !isSpecialCategory) query = query.contains('category', [filters.category])
    
    // מיפוי אזורים — אזור כללי כולל תת-אזורים
    const regionGroups: Record<string, string[]> = {
      north: ['north', 'galil', 'galil_upper', 'galil_lower', 'galil_west', 'kinneret', 'hermon', 'golan'],
      galil_upper: ['galil_upper'],
      galil_lower: ['galil_lower'],
      galil_west: ['galil_west'],
      kinneret: ['kinneret'],
      hermon: ['hermon'],
      golan: ['golan'],
      center: ['center'],
      jerusalem: ['jerusalem'],
      dead_sea: ['dead_sea'],
      negev: ['negev', 'south', 'arava'],
      eilat: ['eilat'],
    }
    if (filters.region) {
      const regions = regionGroups[filters.region] || [filters.region]
      if (regions.length === 1) {
        query = query.eq('region', regions[0])
      } else {
        query = query.in('region', regions)
      }
    }
    if (filters.guests) query = query.gte('max_guests', parseInt(filters.guests))
    if (filters.instant_book) query = query.eq('instant_book', true)
    if (filters.accepts_miluim) query = query.eq('accepts_miluim', true)
    if (filters.has_shelter) query = query.eq('has_shelter', true)

    const { data } = await query.order('avg_rating', { ascending: false })
    let results = data || []

    // מיזוג amenities לפי קהל יעד + פילטרים שנבחרו
    const amenityKeys = [
      ...(isAudienceCategory ? [mappedCategory] : []),
      ...(filters.amenity ? [filters.amenity] : []),
      ...selectedAmenities,
    ]

    if (amenityKeys.length > 0) {
      const { data: amenData } = await supabase.from('amenities').select('id, key').in('key', amenityKeys)
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

    // סינון לפי תאריכים
    if (filters.check_in && filters.check_out) {
      const checkIn = new Date(filters.check_in)
      const checkOut = new Date(filters.check_out)
      const dates: string[] = []
      for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }
      if (dates.length > 0) {
        const { data: blockedData } = await supabase
          .from('blocked_dates')
          .select('property_id, date')
          .in('date', dates)
          .eq('status', 'blocked')
        const blockedPropertyIds = new Set((blockedData || []).map((b: any) => b.property_id))
        results = results.filter(p => !blockedPropertyIds.has(p.id))
      }
    }

    // סופ״ש הקרוב — חמישי שישי שבת
    if (filters.category === 'weekend') {
      const today = new Date()
      const day = today.getDay()
      const daysUntilThu = (4 - day + 7) % 7 || 7
      const thursday = new Date(today)
      thursday.setDate(today.getDate() + daysUntilThu)
      const friday = new Date(thursday)
      friday.setDate(thursday.getDate() + 1)
      const saturday = new Date(thursday)
      saturday.setDate(thursday.getDate() + 2)
      const thuStr = thursday.toISOString().split('T')[0]
      const friStr = friday.toISOString().split('T')[0]
      const satStr = saturday.toISOString().split('T')[0]
      const { data: blockedWeekend } = await supabase
        .from('blocked_dates')
        .select('property_id')
        .in('date', [thuStr, friStr, satStr])
        .eq('status', 'blocked')
      const blockedIds = new Set((blockedWeekend || []).map((b: any) => b.property_id))
      results = results.filter(p => !blockedIds.has(p.id))
    }

    // ברגע אחרון — שבוע קדימה, לפחות לילה אחד פנוי
    if (filters.category === 'last') {
      const now = new Date()
      const in7days = new Date(now)
      in7days.setDate(now.getDate() + 7)
      const dates: string[] = []
      for (let d = new Date(now); d <= in7days; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0])
      }
      // מצא נכסים שחסומים בכל הלילות בשבוע הקרוב
      const { data: blockedLast } = await supabase
        .from('blocked_dates')
        .select('property_id, date')
        .in('date', dates)
        .eq('status', 'blocked')
      // ספור כמה לילות חסום כל נכס
      const blockedCount: Record<string, number> = {}
      ;(blockedLast || []).forEach((b: any) => {
        blockedCount[b.property_id] = (blockedCount[b.property_id] || 0) + 1
      })
      // שמור רק נכסים שיש להם לפחות לילה אחד פנוי (לא חסום בכל הלילות)
      results = results.filter(p => (blockedCount[p.id] || 0) < dates.length)
    }

    // סינון טקסטואלי
    if (textSearch.trim()) {
      const q = textSearch.trim().toLowerCase()
      results = results.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.city?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q)
      )
    }

    setProperties(results)
    setLoading(false)
  }

  const clearFilters = () => {
    setFilters({ category: '', region: '', guests: '', check_in: '', check_out: '', instant_book: false, accepts_miluim: false, has_shelter: false, amenity: '' })
    setPriceRange([200, 35000])
    setSelectedAmenities([])
  }

  const toggleAmenity = (key: string) =>
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])

  const activeCount = [
    filters.category, filters.region, filters.guests,
    filters.instant_book, filters.accepts_miluim, filters.has_shelter, filters.amenity,
    selectedAmenities.length > 0, priceRange[0] > 200 || priceRange[1] < 35000,
  ].filter(Boolean).length

  const labelClass = "block font-bold text-gray-400 uppercase tracking-widest mb-2"
  const selectClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-amber-400 bg-white"

  return (
    <>
      <main className="min-h-screen bg-[#FAF7F2] pt-4" dir="rtl">

        {/* סרגל עליון */}
        <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none" style={{scrollbarWidth:"none"}}>
            <div ref={searchRef} className="relative w-64">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <IconSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={textSearch}
                  onChange={e => { setTextSearch(e.target.value); fetchSuggestions(e.target.value) }}
                  onFocus={() => textSearch.length >= 2 && setShowSuggestions(true)}
                  placeholder="שם, עיר או תיאור..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-700"
                  dir="rtl"
                />
                {textSearch && (
                  <button onClick={() => { setTextSearch(''); setSuggestions([]); setShowSuggestions(false) }}
                    className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  {suggestions.map(s => (
                    <button key={s.id} onClick={() => { setTextSearch(s.name); setShowSuggestions(false) }}
                      className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors flex items-center gap-2">
                      <IconSearch className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <span className="font-medium text-gray-800">{s.name}</span>
                      {s.city && <span className="text-gray-400 text-xs">· {s.city}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${showFilters ? 'bg-amber-800 text-white border-amber-800' : 'bg-white text-gray-600 border-gray-200 hover:border-amber-400'}`}>
              <IconSliders className="w-4 h-4" />
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
                  <label className={labelClass} style={{fontSize:"13px"}}>סוג נכס</label>
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
                  <label className={labelClass} style={{fontSize:"13px"}}>אזור בארץ</label>
                  <select value={filters.region} onChange={e => setFilters(p => ({ ...p, region: e.target.value }))} className={selectClass}>
                    <option value="">כל הארץ</option>
                    {[
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
                    ].map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass} style={{fontSize:"13px"}}>מספר אורחים</label>
                  <select value={filters.guests} onChange={e => setFilters(p => ({ ...p, guests: e.target.value }))} className={selectClass}>
                    <option value="">כל הגדלים</option>
                    {[1,2,3,4,5,6,8,10,12,15,20].map(n => <option key={n} value={n}>{n}+ אורחים</option>)}
                  </select>
                </div>
              </div>

              {/* מחיר */}
              <div>
                <label className={labelClass} style={{fontSize:"13px"}}>מחיר ללילה</label>
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
                  {showAmenities ? <IconChevronUp className="w-4 h-4 text-gray-400" /> : <IconChevronDown className="w-4 h-4 text-gray-400" />}
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
                  {showAudience ? <IconChevronUp className="w-4 h-4 text-gray-400" /> : <IconChevronDown className="w-4 h-4 text-gray-400" />}
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
                    <IconX className="w-4 h-4" /> נקה הכל
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* תוצאות */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <IconSearch className="w-7 h-7 text-gray-300" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {properties.map((p) => {
                const firstImage = p.property_images?.[0]?.url
                return (
                  <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative">
                    <Link href={`/${p.slug || p.id}`}>
                      <div className="h-48 sm:h-52 bg-gray-100 relative overflow-hidden">
                        {firstImage ? (
                          <Image src={firstImage} alt={p.name} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
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
                            <p className="text-xs text-gray-400 mb-0.5">{p.city || ({north:"צפון",galil_west:"גליל המערבי",galil_upper:"גליל העליון",galil_lower:"גליל התחתון",kinneret:"כנרת",hermon:"חרמון",center:"מרכז",jerusalem:"ירושלים",dead_sea:"ים המלח",negev:"דרום",eilat:"אילת",golan:"רמת הגולן"} as Record<string,string>)[p.region]}</p>
                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-amber-800 transition-colors">{p.name}</h3>
                          </div>
                          {p.avg_rating > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                              <IconStar className="w-3 h-3 fill-amber-400 text-amber-400" />
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
                      <IconHeart className={`w-4 h-4 transition-colors ${isLiked(p.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
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
