'use client'
import { useState as useDropdown } from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown } from '@/components/icons'
import { buildQueryString } from '@/lib/utils'

interface SearchBarProps {
  variant?: 'hero' | 'compact'
  initialValues?: {
    region?: string
    checkIn?: string
    checkOut?: string
    guests?: number
  }
}

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

const PROPERTY_TYPES = [
  { value: '', label: 'כל הסוגים' },
  { value: 'zimmer', label: 'צימר' },
  { value: 'complex', label: 'מתחם צימרים' },
  { value: 'villa', label: 'וילות ובקתות' },
  { value: 'caravan', label: 'קרוואנים' },
  { value: 'hotel', label: 'מלונות' },
  { value: 'camping', label: 'קמפינג' },
  { value: 'attraction', label: 'אטרקציות' },
]

export function SearchBar({ variant = 'hero', initialValues = {} }: SearchBarProps) {
  const router = useRouter()
  const [region, setRegion] = useState(initialValues.region || '')
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || '')
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || '')
  const [guests, setGuests] = useState(initialValues.guests || 2)
  const [openDrop, setOpenDrop] = useDropdown<string|null>(null)
  const [propertyType, setPropertyType] = useState('')
  const [error, setError] = useState('')

  const today = new Date().toISOString().split('T')[0]
  const maxDate = '2099-12-31'

  const handleSearch = () => {
    setError('')
    if (!region.trim()) { setError('נא לבחור אזור בארץ'); return }
    if (!checkIn) { setError('נא לבחור תאריך כניסה'); return }
    if (!checkOut) { setError('נא לבחור תאריך יציאה'); return }
    if (checkIn < today) { setError('תאריך הכניסה אינו תקין'); return }
    if (checkOut <= checkIn) { setError('תאריך היציאה חייב להיות אחרי תאריך הכניסה'); return }
    const qs = buildQueryString({ region, check_in: checkIn, check_out: checkOut, guests, ...(propertyType && { category: propertyType }) })
    router.push(`/search${qs}`)
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-white border border-sand-100 rounded-2xl px-4 py-2 shadow-sm">
        <IconMapPin className="w-4 h-4 text-taupe shrink-0" />
        <input type="text" value={region} onChange={(e) => setRegion(e.target.value)}
          placeholder="לאן?" className="flex-1 text-sm bg-transparent outline-none text-charcoal placeholder-stone" dir="rtl" />
        <button onClick={handleSearch} className="btn-gold text-sm py-1.5 px-4"><IconSearch className="w-4 h-4" color="white" /></button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto" style={{position:"relative", zIndex:9999}}>
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: scaleY(0.7); }
          to   { opacity: 1; transform: scaleY(1); }
        }
        .search-drop {
          transform-origin: top;
          animation: dropDown 0.2s cubic-bezier(0.34,1.8,0.64,1) forwards;
        }
      `}</style>
      <div className="bg-white rounded-2xl border border-sand-100 shadow-[0_8px_40px_rgba(61,47,32,0.12)]">
        <div className="grid grid-cols-1 lg:grid-cols-5 relative" style={{zIndex: 1}}>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100 overflow-visible">
            <IconHome className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">סוג נכס</label>
              <div className="relative">
                <button type="button" onClick={() => setOpenDrop(openDrop === 'type' ? null : 'type')}
                  className="w-full text-sm text-right text-charcoal font-medium flex items-center justify-between gap-1 outline-none">
                  <span>{PROPERTY_TYPES.find(t => t.value === propertyType)?.label || 'כל הסוגים'}</span>
                  <span className="text-gold text-xs" style={{transform: openDrop==='type'?'rotate(180deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.15s'}}>▾</span>
                </button>
                {openDrop === 'type' && (
                  <div className="search-drop absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-[9999] min-w-[160px] overflow-hidden">
                    {PROPERTY_TYPES.map(t => (
                      <button key={t.value} type="button"
                        onClick={() => { setPropertyType(t.value); setError(''); setOpenDrop(null) }}
                        className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                        style={{ color: propertyType===t.value ? '#8B6914':'#374151', fontWeight: propertyType===t.value?'700':'400' }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100 overflow-visible">
            <IconMapPin className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">אזור בארץ</label>
              <div className="relative">
                <button type="button" onClick={() => setOpenDrop(openDrop === 'region' ? null : 'region')}
                  className="w-full text-sm text-right text-charcoal font-medium flex items-center justify-between gap-1 outline-none">
                  <span className={region ? '' : 'text-gray-400'}>{REGIONS.find(r => r.value === region)?.label || 'בחר אזור'}</span>
                  <span className="text-gold text-xs" style={{transform: openDrop==='region'?'rotate(180deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.15s'}}>▾</span>
                </button>
                {openDrop === 'region' && (
                  <div className="search-drop absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-[9999] min-w-[180px] overflow-hidden" style={{maxHeight:'220px',overflowY:'auto'}}>
                    {[{value:'',label:'כל הארץ'},...REGIONS].map(r => (
                      <button key={r.value} type="button"
                        onClick={() => { setRegion(r.value); setError(''); setOpenDrop(null) }}
                        className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                        style={{ color: region===r.value ? '#8B6914':'#374151', fontWeight: region===r.value?'700':'400' }}>
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100 overflow-visible">
            <IconCalendar className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">תאריך כניסה</label>
              <input type="date" value={checkIn}
                onChange={(e) => { const val = e.target.value; if (val && val < today) { setError('תאריך הכניסה אינו תקין'); return } setCheckIn(val); setError(''); if (checkOut && val > checkOut) setCheckOut('') }}
                min={today} max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium [color-scheme:light] cursor-pointer" dir="ltr" />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100 overflow-visible">
            <IconCalendar className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">תאריך יציאה</label>
              <input type="date" value={checkOut}
                onChange={(e) => { const val = e.target.value; if (val && val < today) { setError('תאריך אינו תקין'); return } if (val && checkIn && val <= checkIn) { setError('תאריך היציאה חייב להיות אחרי תאריך הכניסה'); return } setCheckOut(val); setError('') }}
                min={checkIn || today} max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium [color-scheme:light] cursor-pointer" dir="ltr" />
            </div>
          </div>

          <div className="flex items-start gap-3 px-5 pt-4 pb-2">
            <IconUsers className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">אורחים</label>
              <div className="relative">
                <button type="button" onClick={() => setOpenDrop(openDrop === 'guests' ? null : 'guests')}
                  className="w-full text-sm text-right text-charcoal font-medium flex items-center justify-between gap-1 outline-none">
                  <span>{guests === 99 ? 'מעל 12' : guests === 1 ? 'אורח אחד' : `${guests} אורחים`}</span>
                  <span className="text-gold text-xs" style={{transform: openDrop==='guests'?'rotate(180deg)':'rotate(0deg)',display:'inline-block',transition:'transform 0.15s'}}>▾</span>
                </button>
                {openDrop === 'guests' && (
                  <div className="search-drop absolute top-full right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-lg z-[9999] min-w-[140px] overflow-hidden">
                    {[...[1,2,3,4,5,6,7,8,10,12].map(n => ({value:n,label:n===1?'אורח אחד':`${n} אורחים`})),{value:99,label:'מעל 12'}].map(o => (
                      <button key={o.value} type="button"
                        onClick={() => { setGuests(o.value); setOpenDrop(null) }}
                        className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors"
                        style={{ color: guests===o.value ? '#8B6914':'#374151', fontWeight: guests===o.value?'700':'400' }}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {error && (
          <div className="px-4 py-2.5 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 font-medium text-right">{error}</p>
          </div>
        )}

        <div className="border-t border-sand-100 p-4 flex items-center justify-center relative">
          <button onClick={handleSearch}
            className="btn-gold flex items-center justify-center gap-2 py-2.5 px-8 text-sm">
            <IconSearch className="w-4 h-4 shrink-0" color="white" />
            <span>חיפוש</span>
          </button>
          <a href="/search"
            className="absolute left-4 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-500 hover:border-yellow-600 hover:text-yellow-700 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            חיפוש מתקדם
          </a>
        </div>

      </div>
    </div>
  )
}
