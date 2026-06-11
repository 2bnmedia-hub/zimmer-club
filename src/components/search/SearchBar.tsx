'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome } from '@/components/icons'
import { buildQueryString } from '@/lib/utils'

interface SearchBarProps {
  variant?: 'hero' | 'compact'
  initialValues?: { region?: string; checkIn?: string; checkOut?: string; guests?: number }
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

function Drop({ id, open, setOpen, label, value, options, onChange }: {
  id: string; open: string|null; setOpen: (v: string|null) => void
  label: string; value: string|number; options: {value: string|number, label: string}[]
  onChange: (v: string|number) => void
}) {
  const selected = options.find(o => o.value === value)
  const isOpen = open === id
  const btnRef = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState({top:0, left:0, width:0})

  useEffect(() => {
    if (isOpen && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 160) })
    }
  }, [isOpen])

  return (
    <div>
      <button ref={btnRef} type="button" onClick={(e) => { e.stopPropagation(); setOpen(isOpen ? null : id) }}
        className="w-full text-sm text-right text-charcoal font-medium flex items-center justify-between gap-1 outline-none">
        <span className={!value ? 'text-gray-400' : ''}>{selected?.label || label}</span>
        <span className="text-gold text-xs" style={{display:'inline-block', transition:'transform 0.15s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>▾</span>
      </button>
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div style={{
          position:'fixed', top: pos.top, left: pos.left,
          background:'white', border:'1px solid #e5e7eb', borderRadius:'12px',
          boxShadow:'0 8px 32px rgba(0,0,0,0.15)', zIndex:999999,
          minWidth: pos.width + 'px', maxHeight:'280px', overflowY:'auto',
          transformOrigin:'top',
          animation:'dropAnim 0.2s cubic-bezier(0.34,1.8,0.64,1) forwards'
        }}>
          {options.map(o => (
            <button key={String(o.value)} type="button"
              onClick={(e) => { e.stopPropagation(); onChange(o.value); setOpen(null) }}
              className="w-full text-right px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors block"
              style={{ color: value === o.value ? '#8B6914' : '#374151', fontWeight: value === o.value ? '700' : '400' }}>
              {o.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}

export function SearchBar({ variant = 'hero', initialValues = {} }: SearchBarProps) {
  const router = useRouter()
  const [region, setRegion] = useState(initialValues.region || '')
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || '')
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || '')
  const [guests, setGuests] = useState(initialValues.guests || 2)
  const [propertyType, setPropertyType] = useState('')
  const [error, setError] = useState('')
  const [openDrop, setOpenDrop] = useState<string|null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenDrop(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

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

  const guestOptions = [...[1,2,3,4,5,6,7,8,10,12].map(n => ({value:n, label: n===1 ? 'אורח אחד' : `${n} אורחים`})), {value:99, label:'מעל 12'}]

  return (
    <div ref={wrapRef} className="w-full max-w-5xl mx-auto" style={{position:'relative', zIndex:50}}>
      <style>{`
        @keyframes dropAnim {
          from { opacity:0; transform:scaleY(0.85); }
          to   { opacity:1; transform:scaleY(1); }
        }
        .search-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #1B5E3B;
          margin-bottom: 4px;
        }
        .search-divider {
          border-color: rgba(196,165,107,0.2);
        }
      `}</style>
      <div className="bg-white rounded-2xl overflow-hidden" style={{
        border: '1px solid rgba(196,165,107,0.35)',
        boxShadow: '0 8px 40px rgba(27,94,59,0.08), 0 2px 12px rgba(196,165,107,0.12)',
      }}>
        {/* שורת כותרת */}
        <div className="px-6 py-2.5 flex items-center gap-2" style={{
          background: 'linear-gradient(135deg, #1B5E3B 0%, #14472D 100%)',
        }}>
          <span style={{color:'#C4A56B', fontSize:'11px', fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase'}}>✦ חפשו את הנכס המושלם שלכם</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5">

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 search-divider" style={{overflow:'visible'}}>
            <IconHome className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#1B5E3B'}} />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <label className="search-label">סוג נכס</label>
              <Drop id="type" open={openDrop} setOpen={setOpenDrop}
                label="כל הסוגים" value={propertyType} options={PROPERTY_TYPES}
                onChange={(v) => { setPropertyType(String(v)); setError('') }} />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 search-divider" style={{overflow:'visible'}}>
            <IconMapPin className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#1B5E3B'}} />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <label className="search-label">אזור בארץ</label>
              <Drop id="region" open={openDrop} setOpen={setOpenDrop}
                label="בחר אזור" value={region}
                options={[{value:'', label:'כל הארץ'}, ...REGIONS]}
                onChange={(v) => { setRegion(String(v)); setError('') }} />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 search-divider">
            <IconCalendar className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#1B5E3B'}} />
            <div className="flex-1 min-w-0">
              <label className="search-label">תאריך כניסה</label>
              <input type="date" value={checkIn}
                onChange={(e) => { const val = e.target.value; if (val && val < today) { setError('תאריך הכניסה אינו תקין'); return } setCheckIn(val); setError(''); if (checkOut && val > checkOut) setCheckOut('') }}
                min={today} max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium [color-scheme:light] cursor-pointer" dir="ltr" />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 search-divider">
            <IconCalendar className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#1B5E3B'}} />
            <div className="flex-1 min-w-0">
              <label className="search-label">תאריך יציאה</label>
              <input type="date" value={checkOut}
                onChange={(e) => { const val = e.target.value; if (val && val < today) { setError('תאריך אינו תקין'); return } if (val && checkIn && val <= checkIn) { setError('תאריך היציאה חייב להיות אחרי תאריך הכניסה'); return } setCheckOut(val); setError('') }}
                min={checkIn || today} max={maxDate}
                className="w-full text-sm bg-transparent outline-none text-charcoal font-medium [color-scheme:light] cursor-pointer" dir="ltr" />
            </div>
          </div>

          <div className="flex items-start gap-3 px-5 pt-4 pb-2" style={{overflow:'visible'}}>
            <IconUsers className="w-4 h-4 shrink-0 mt-0.5" style={{color:'#1B5E3B'}} />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <label className="search-label">אורחים</label>
              <Drop id="guests" open={openDrop} setOpen={setOpenDrop}
                label="בחר" value={guests} options={guestOptions}
                onChange={(v) => setGuests(Number(v))} />
            </div>
          </div>

        </div>

        {error && (
          <div className="px-4 py-2.5 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600 font-medium text-right">{error}</p>
          </div>
        )}

        <div className="p-4 flex items-center justify-center relative" style={{borderTop:'1px solid rgba(196,165,107,0.2)'}}>
          <button onClick={handleSearch}
            className="flex items-center justify-center gap-2 py-2.5 px-10 text-sm font-bold text-white rounded-full transition-all hover:opacity-90 hover:scale-105"
            style={{background:'linear-gradient(135deg, #1B5E3B 0%, #14472D 100%)', boxShadow:'0 4px 16px rgba(27,94,59,0.3)', letterSpacing:'0.05em'}}>
            <IconSearch className="w-4 h-4 shrink-0" color="white" />
            <span>חיפוש נכסים</span>
          </button>
          <a href="/search" className="absolute left-4 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-500 hover:border-yellow-600 hover:text-yellow-700 transition-all">
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
