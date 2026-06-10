'use client'

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
        <button onClick={handleSearch} className="btn-gold text-sm py-1.5 px-4"><IconSearch className="w-4 h-4" /></button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-sand-100 shadow-[0_8px_40px_rgba(61,47,32,0.12)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5">

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100">
            <IconHome className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">סוג נכס</label>
              <select value={propertyType} onChange={(e) => { setPropertyType(e.target.value); setError('') }}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium appearance-none cursor-pointer" dir="rtl">
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100">
            <IconMapPin className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">אזור בארץ</label>
              <select value={region} onChange={(e) => { setRegion(e.target.value); setError('') }}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium appearance-none cursor-pointer" dir="rtl">
                <option value="">בחר אזור</option>
                {REGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100">
            <IconCalendar className="w-4 h-4 text-gold shrink-0 sm:mb-1.5" />
            <div className="flex-1 min-w-0">
              <label className="label">תאריך כניסה</label>
              <input type="date" value={checkIn}
                onChange={(e) => { const val = e.target.value; if (val && val < today) { setError('תאריך הכניסה אינו תקין'); return } setCheckIn(val); setError(''); if (checkOut && val > checkOut) setCheckOut('') }}
                min={today} max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium [color-scheme:light] cursor-pointer" dir="ltr" />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100">
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
              <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium appearance-none cursor-pointer" dir="rtl">
                {[1,2,3,4,5,6,7,8,10,12].map(n => <option key={n} value={n}>{n === 1 ? 'אורח אחד' : `${n} אורחים`}</option>)}
                <option value={99}>מעל 12</option>
              </select>
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
            <IconSearch className="w-4 h-4 shrink-0" />
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
