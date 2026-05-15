'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users } from 'lucide-react'
import { cn, buildQueryString } from '@/lib/utils'
import { REGIONS } from '@/lib/constants'

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

  const handleSearch = () => {
    const qs = buildQueryString({ region, check_in: checkIn, check_out: checkOut, guests })
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
        <button
          onClick={handleSearch}
          className="btn-gold text-sm py-1.5 px-4"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-sand-100 shadow-[0_8px_40px_rgba(61,47,32,0.08)] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4">

          {/* Region */}
          <div className="flex items-start gap-3 p-5 lg:border-l border-b lg:border-b-0 border-sand-100">
            <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <label className="label">אזור בארץ</label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="הגליל, כרמל, ים המלח..."
                className="w-full text-sm bg-transparent outline-none text-charcoal placeholder-stone font-medium"
                dir="rtl"
                list="regions-list"
              />
              <datalist id="regions-list">
                {Object.entries(REGIONS).map(([key, { label }]) => (
                  <option key={key} value={label} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Check-in */}
          <div className="flex items-start gap-3 p-5 lg:border-l border-b lg:border-b-0 border-sand-100">
            <Calendar className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="label">תאריך כניסה</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="ltr"
              />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex items-start gap-3 p-5 lg:border-l border-b lg:border-b-0 border-sand-100">
            <Calendar className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <div className="flex-1">
              <label className="label">תאריך יציאה</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="ltr"
              />
            </div>
          </div>

          {/* Guests + Search */}
          <div className="flex items-center gap-3 p-5">
            <Users className="w-4 h-4 text-gold shrink-0" />
            <div className="flex-1">
              <label className="label">אורחים</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium"
                dir="rtl"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                  <option key={n} value={n}>{n} אורחים</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="btn-gold flex items-center gap-2 py-2.5 px-4 text-sm shrink-0"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">חיפוש</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
