'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, Home } from 'lucide-react'
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

    if (!region.trim()) {
      setError('נא לבחור אזור בארץ')
      return
    }
    if (!checkIn) {
      setError('נא לבחור תאריך כניסה')
      return
    }
    if (!checkOut) {
      setError('נא לבחור תאריך יציאה')
      return
    }
    if (checkIn < today) {
      setError('התאריך שהוזן אינו תקין, נא להזין תאריכים עתידיים')
      return
    }
    if (checkOut < today) {
      setError('התאריך שהוזן אינו תקין, נא להזין תאריכים עתידיים')
      return
    }
    if (checkOut <= checkIn) {
      setError('תאריך היציאה חייב להיות אחרי תאריך הכניסה')
      return
    }

    const qs = buildQueryString({ region, check_in: checkIn, check_out: checkOut, guests, ...(propertyType && { category: propertyType }) })
    router.push(`/search${qs}`)
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-white border border-sand-100 rounded-2xl px-4 py-2 shadow-sm">
        <MapPin className="w-4 h-4 text-taupe shrink-0" />
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="לאן?"
          className="flex-1 text-sm bg-transparent outline-none text-charcoal placeholder-stone"
          dir="rtl"
        />
        <button onClick={handleSearch} className="btn-gold text-sm py-1.5 px-4">
          <Search className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white rounded-2xl border border-sand-100 shadow-[0_8px_40px_rgba(61,47,32,0.08)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5">

          {/* Property Type */}
          <div className="flex items-start gap-3 p-6 lg:border-l border-b lg:border-b-0 border-sand-100">
            <Home className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="label">סוג נכס</label>
              <select
                value={propertyType}
                onChange={(e) => { setPropertyType(e.target.value); setError('') }}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="rtl"
              >
                <option value="">הכל</option>
                <option value="zimmer">צימר</option>
                <option value="villa">וילה</option>
                <option value="hotel">מלון</option>
                <option value="camping">קמפינג</option>
                <option value="attraction">אטרקציה</option>
              </select>
            </div>
          </div>

          {/* Region */}
          <div className="flex items-start gap-3 p-6 lg:border-l border-b lg:border-b-0 border-sand-100">
            <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="label">אזור בארץ</label>
              <select
                value={region}
                onChange={(e) => { setRegion(e.target.value); setError('') }}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="rtl"
              >
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
          </div>

          {/* Check-in */}
          <div className="flex items-start gap-3 p-6 lg:border-l border-b lg:border-b-0 border-sand-100">
            <Calendar className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="label">תאריך כניסה</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => {
                  const val = e.target.value
                  if (val && val < today) { setError('תאריך הכניסה אינו תקין — יש לבחור תאריך עתידי'); return }
                  setCheckIn(val)
                  setError('')
                  if (checkOut && val > checkOut) setCheckOut('')
                }}
                min={today}
                max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="ltr"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex items-start gap-3 p-6 lg:border-l border-b lg:border-b-0 border-sand-100">
            <Calendar className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="label">תאריך יציאה</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => { const val = e.target.value; if (val && val < today) { setError('תאריך היציאה אינו תקין — יש לבחור תאריך עתידי'); return } if (val && checkIn && val <= checkIn) { setError('תאריך היציאה חייב להיות אחרי תאריך הכניסה'); return } setCheckOut(val); setError('') }}
                min={checkIn || today}
                max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="ltr"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-start gap-3 p-5">
            <Users className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="label">מספר האורחים</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium text-right appearance-none"
                dir="rtl"
                style={{ direction: 'rtl', textAlign: 'right' }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>
                    {n === 1 ? 'אורח אחד' : `${n} אורחים`}
                  </option>
                ))}
                <option value={99}>מעל 12 אורחים</option>
              </select>
            </div>
          </div>

        </div>

        {/* Error message */}
        {error && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-100 text-right">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Search Button */}
        <div className="border-t border-sand-100 p-4 flex justify-center">
          <button
            onClick={handleSearch}
            className="btn-gold flex items-center justify-center gap-7 py-2.5 px-15 text-sm"
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>חיפוש</span>
          </button>
        </div>

      </div>
    </div>
  )
}
