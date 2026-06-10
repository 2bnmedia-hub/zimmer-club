'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

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
  couples: 'מתאים לזוגות', families: 'מתאים למשפחות', groups: 'מתאים לקבוצות',
  religious: 'מתאים לדתיים', animals: 'מקבלים בע״ח', accessible: 'נגישות',
  guests: 'מתאים לאירועים',
}

const FEATURE_AMENITIES = Object.keys(AMENITY_LABELS)

export function AdvancedSearchPanel({ open, onToggle }: { open?: boolean; onToggle?: () => void }) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = open !== undefined ? open : internalOpen
  const handleToggle = () => onToggle ? onToggle() : setInternalOpen(!internalOpen)
  const [showAmenities, setShowAmenities] = useState(false)
  const [showAudience, setShowAudience] = useState(false)
  const [priceRange, setPriceRange] = useState([200, 35000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [filters, setFilters] = useState({
    category: '', region: '', guests: '', instant_book: false, accepts_miluim: false, has_shelter: false,
  })

  const toggleAmenity = (key: string) => {
    setSelectedAmenities(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.region) params.set('region', filters.region)
    if (filters.guests) params.set('guests', filters.guests)
    if (filters.instant_book) params.set('instant_book', '1')
    if (filters.accepts_miluim) params.set('accepts_miluim', '1')
    if (filters.has_shelter) params.set('has_shelter', '1')
    if (priceRange[0] > 200) params.set('minPrice', String(priceRange[0]))
    if (priceRange[1] < 35000) params.set('maxPrice', String(priceRange[1]))
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','))
    router.push(`/search?${params.toString()}`)
  }

  const activeCount = [
    filters.category, filters.region, filters.guests,
    filters.instant_book, filters.accepts_miluim, filters.has_shelter,
    selectedAmenities.length > 0,
    priceRange[0] > 200 || priceRange[1] < 35000,
  ].filter(Boolean).length

  return (
    <div className="w-full max-w-5xl mx-auto mt-3" dir="rtl">
      {/* כפתור */}
      <div className="flex justify-center">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-200"
          style={{
            background: isOpen ? 'linear-gradient(135deg, #C4956A, #8B5E3C)' : 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(196,149,106,0.7)',
            color: open ? '#fff' : '#D4A876',
            boxShadow: open ? '0 4px 20px rgba(139,105,20,0.4)' : '0 2px 12px rgba(0,0,0,0.1)',
          }}
        >
          <IconSliders className="w-4 h-4" />
          חיפוש מתקדם
          {activeCount > 0 && (
            <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{background:'#D4A876', color:'#3D2F20'}}>
              {activeCount}
            </span>
          )}
          {isOpen ? <IconChevronUp className="w-4 h-4" /> : <IconChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* פאנל */}
      {isOpen && (
        <div className="mt-4 rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 100%)', border: '1px solid #D4A876', boxShadow: '0 20px 60px rgba(139,94,60,0.15)' }}>
          <div className="p-6 space-y-5">

            {/* סוג נכס */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">סוג נכס</p>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map(t => (
                  <button key={t.value} onClick={() => setFilters(p => ({ ...p, category: t.value }))}
                    className="px-4 py-1.5 rounded-full text-xs font-medium border transition-all"
                    style={{
                      background: filters.category === t.value ? 'linear-gradient(135deg, #C4956A, #8B5E3C)' : '#fff',
                      color: filters.category === t.value ? '#fff' : '#555',
                      borderColor: filters.category === t.value ? '#C4956A' : '#e5e7eb',
                    }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* אזור + אורחים */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">אזור בארץ</p>
                <select value={filters.region} onChange={(e) => setFilters(p => ({ ...p, region: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-500 bg-white">
                  <option value="">כל הארץ</option>
                  {['הצפון','גליל המערבי','גליל העליון','גליל התחתון','כנרת','חרמון','מרכז','ירושלים','ים המלח','דרום','אילת','רמת הגולן'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">מספר אורחים</p>
                <select value={filters.guests} onChange={(e) => setFilters(p => ({ ...p, guests: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-500 bg-white">
                  <option value="">כל הגדלים</option>
                  {[1,2,3,4,5,6,8,10,12,15,20].map(n => <option key={n} value={n}>{n}+ אורחים</option>)}
                </select>
              </div>
            </div>

            {/* טווח מחירים */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                מחיר ללילה: <span style={{color:'#8B6914'}}>₪{priceRange[0].toLocaleString()} — ₪{priceRange[1].toLocaleString()}</span>
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">₪200</span>
                <div className="flex-1 space-y-2">
                  <input type="range" min={200} max={35000} step={100} value={priceRange[0]}
                    onChange={(e) => setPriceRange(p => [Math.min(Number(e.target.value), p[1]-100), p[1]])}
                    className="w-full accent-yellow-600" />
                  <input type="range" min={200} max={35000} step={100} value={priceRange[1]}
                    onChange={(e) => setPriceRange(p => [p[0], Math.max(Number(e.target.value), p[0]+100)])}
                    className="w-full accent-yellow-600" />
                </div>
                <span className="text-xs text-gray-400">₪35,000</span>
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
                {showAmenities ? <IconChevronUp className="w-4 h-4 text-gray-400" /> : <IconChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showAmenities && (
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {FEATURE_AMENITIES.map(key => (
                    <button key={key} onClick={() => toggleAmenity(key)}
                      className="px-3 py-2 rounded-xl text-xs font-medium border transition-all text-right"
                      style={{
                        background: selectedAmenities.includes(key) ? '#fefce8' : '#fff',
                        borderColor: selectedAmenities.includes(key) ? '#ca8a04' : '#e5e7eb',
                        color: selectedAmenities.includes(key) ? '#854d0e' : '#555',
                      }}>
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
                  {selectedAmenities.filter(k => Object.keys(AUDIENCE_AMENITIES).includes(k)).length > 0 &&
                    <span className="mr-2 bg-yellow-600 text-white text-xs rounded-full px-2 py-0.5">
                      {selectedAmenities.filter(k => Object.keys(AUDIENCE_AMENITIES).includes(k)).length}
                    </span>}
                </span>
                {showAudience ? <IconChevronUp className="w-4 h-4 text-gray-400" /> : <IconChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {showAudience && (
                <div className="p-4 flex flex-wrap gap-2">
                  {Object.entries(AUDIENCE_AMENITIES).map(([key, label]) => (
                    <button key={key} onClick={() => toggleAmenity(key)}
                      className="px-4 py-2 rounded-full text-xs font-medium border transition-all"
                      style={{
                        background: selectedAmenities.includes(key) ? '#fefce8' : '#fff',
                        borderColor: selectedAmenities.includes(key) ? '#ca8a04' : '#e5e7eb',
                        color: selectedAmenities.includes(key) ? '#854d0e' : '#555',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* checkboxes + כפתור חיפוש */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.instant_book}
                    onChange={(e) => setFilters(p => ({ ...p, instant_book: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">⚡ הזמנה מיידית בלבד</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.accepts_miluim}
                    onChange={(e) => setFilters(p => ({ ...p, accepts_miluim: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">🪖 מקבלים שובר מילואים</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filters.has_shelter}
                    onChange={(e) => setFilters(p => ({ ...p, has_shelter: e.target.checked }))}
                    className="w-4 h-4 accent-yellow-600" />
                  <span className="text-sm text-gray-700 font-medium">🛡️ קיים מרחב מוגן</span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button onClick={() => { setFilters({ category:'', region:'', guests:'', instant_book:false, accepts_miluim:false, has_shelter:false }); setPriceRange([200,35000]); setSelectedAmenities([]) }}
                    className="flex items-center gap-1 text-sm text-red-400 hover:text-red-600 font-medium">
                    <X className="w-4 h-4" /> נקה הכל
                  </button>
                )}
                <button onClick={handleSearch}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#8B6914' }}>
                  <IconSearch className="w-4 h-4" />
                  חפש עכשיו
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
