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
  { value: 'north', label: 'כל הצפון' },
  { value: 'hermon', label: 'חרמון' },
  { value: 'golan', label: 'רמת הגולן' },
  { value: 'galil_upper', label: 'גליל העליון' },
  { value: 'galil_west', label: 'גליל המערבי' },
  { value: 'galil_lower', label: 'גליל התחתון' },
  { value: 'kinneret', label: 'כנרת' },
  { value: 'center', label: 'מרכז' },
  { value: 'jerusalem', label: 'ירושלים' },
  { value: 'dead_sea', label: 'ים המלח' },
  { value: 'negev', label: 'דרום' },
  { value: 'eilat', label: 'אילת' },
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

const HE_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
const HE_DAYS = ["א'","ב'","ג'","ד'","ה'","ו'",'שבת']

function formatDateHe(str: string) {
  if (!str) return ''
  const [, m, d] = str.split('-')
  return `${parseInt(d)} ${HE_MONTHS[parseInt(m)-1]}`
}

function addMonths(year: number, month: number, delta: number) {
  let m = month + delta
  let y = year
  while (m > 11) { m -= 12; y++ }
  while (m < 0) { m += 12; y-- }
  return { year: y, month: m }
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
}

function CalendarMonth({
  year, month, todayStr, checkIn, checkOut, hovered, selecting,
  onDayClick, onDayHover, onDayLeave
}: {
  year: number; month: number; todayStr: string
  checkIn: string; checkOut: string; hovered: string; selecting: boolean
  onDayClick: (s: string) => void
  onDayHover: (s: string) => void
  onDayLeave: () => void
}) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const cells: (number | null)[] = Array(firstDow).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const rangeEnd = checkIn && !checkOut && hovered ? (hovered > checkIn ? hovered : checkIn) : checkOut
  const rangeStart = checkIn

  return (
    <div style={{minWidth:260}}>
      <div className="text-center font-bold text-gray-800 mb-3" style={{fontSize:15}}>
        {HE_MONTHS[month]} {year}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {HE_DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const str = toDateStr(year, month, day)
          const isPast = str < todayStr
          const isToday = str === todayStr
          const isStart = str === checkIn
          const isEnd = str === (checkOut || (hovered && !checkOut && hovered > checkIn ? hovered : ''))
          const inRange = rangeStart && rangeEnd && str > rangeStart && str < rangeEnd
          const isSelected = isStart || isEnd

          let bg = 'transparent'
          let color = isPast ? '#d1d5db' : '#374151'
          let fontWeight = isToday ? '700' : '400'
          let borderRadius = '50%'
          let cursor = isPast ? 'not-allowed' : 'pointer'

          if (isSelected) {
            bg = '#8B6914'
            color = '#fff'
            fontWeight = '700'
          } else if (inRange) {
            bg = '#FEF3C7'
            color = '#92400E'
            borderRadius = '0'
          }

          // round range ends
          const prevStr = day > 1 ? toDateStr(year, month, day-1) : ''
          const nextStr = day < daysInMonth ? toDateStr(year, month, day+1) : ''
          const prevInRange = rangeStart && rangeEnd && prevStr > rangeStart && prevStr < rangeEnd
          const nextInRange = rangeStart && rangeEnd && nextStr > rangeStart && nextStr < rangeEnd

          if (inRange) {
            if (!prevInRange && prevStr !== rangeStart) borderRadius = '50% 0 0 50%'
            else if (!nextInRange && nextStr !== rangeEnd) borderRadius = '0 50% 50% 0'
            else borderRadius = '0'
          }

          return (
            <div key={i}
              style={{
                background: !isSelected && inRange ? '#FEF3C7' : 'transparent',
                borderRadius: inRange ? borderRadius : undefined,
              }}
            >
              <div
                onClick={() => !isPast && onDayClick(str)}
                onMouseEnter={() => !isPast && onDayHover(str)}
                onMouseLeave={onDayLeave}
                style={{
                  height: 36, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? bg : 'transparent',
                  color, fontWeight, borderRadius: '50%',
                  cursor, fontSize: 13,
                  transition: 'background 0.1s',
                  border: isToday && !isSelected ? '1.5px solid #C8960C' : 'none',
                }}
                className={!isPast && !isSelected ? 'hover:bg-amber-100' : ''}
              >
                {day}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DateRangePicker({ checkIn, checkOut, onChange, onClear }: {
  checkIn: string; checkOut: string
  onChange: (ci: string, co: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState('')
  const [selecting, setSelecting] = useState(false)
  const todayObj = new Date()
  const [view, setView] = useState({ year: todayObj.getFullYear(), month: todayObj.getMonth() })
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const todayStr = todayObj.toISOString().split('T')[0]

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        popRef.current && !popRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  useEffect(() => {
    if (!open || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 6, left: Math.max(8, r.left - 200) })
  }, [open])

  function handleDayClick(str: string) {
    if (!checkIn || (checkIn && checkOut)) {
      onChange(str, '')
    } else {
      if (str > checkIn) {
        onChange(checkIn, str)
        setOpen(false)
        setHovered('')
      } else {
        onChange(str, '')
      }
    }
  }

  const next = addMonths(view.year, view.month, 1)
  const hasSelection = checkIn || checkOut

  const label = checkIn && checkOut
    ? `${formatDateHe(checkIn)} – ${formatDateHe(checkOut)}`
    : checkIn
    ? `${formatDateHe(checkIn)} ← בחר יציאה`
    : 'בחר תאריכים'

  return (
    <div>
      <label className="label">בחירת תאריכים</label>
      <button ref={btnRef} type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full text-sm text-right outline-none flex items-center justify-between gap-1"
        style={{ color: hasSelection ? '#374151' : '#9ca3af', fontWeight: hasSelection ? '600' : '400' }}>
        <span>{label}</span>
        {hasSelection && (
          <span onClick={e => { e.stopPropagation(); onClear() }}
            className="text-gray-300 hover:text-red-400 transition-colors text-xs ml-1 cursor-pointer">✕</span>
        )}
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        (() => {
          const isMob = window.innerWidth < 640
          return (
            <div ref={popRef} style={{
              position: 'fixed', zIndex: 999999,
              ...(isMob
                ? { bottom: 0, left: 0, right: 0, top: 'auto', borderRadius: '20px 20px 0 0' }
                : { top: pos.top, left: pos.left, borderRadius: 16 }),
              background: 'white', border: '1px solid #e5e7eb',
              boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
              padding: '20px 20px',
              animation: 'dropAnim 0.2s cubic-bezier(0.34,1.8,0.64,1) forwards',
              maxHeight: isMob ? '80vh' : undefined,
              overflowY: isMob ? 'auto' : undefined,
            }} dir="rtl">
              {isMob && (
                <div style={{ width: 40, height: 4, borderRadius: 2, background: '#d1d5db', margin: '0 auto 16px' }} />
              )}
              {/* כותרת */}
              <div className="text-center font-bold text-gray-700 mb-4" style={{fontSize:14}}>
                בחירת תאריכים
              </div>

              {/* ניווט */}
              <div className="flex items-center justify-between mb-4">
                <button type="button"
                  onClick={() => setView(v => addMonths(v.year, v.month, -1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-amber-50 text-gray-600 hover:text-amber-800 transition-colors text-lg font-bold">
                  »
                </button>
                <button type="button"
                  onClick={() => setView(v => addMonths(v.year, v.month, 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-amber-50 text-gray-600 hover:text-amber-800 transition-colors text-lg font-bold">
                  «
                </button>
              </div>

              {/* חודש אחד במובייל, שניים בדסקטופ */}
              <div className={isMob ? 'block' : 'flex gap-8'}>
                {!isMob && (
                  <CalendarMonth
                    year={next.year} month={next.month}
                    todayStr={todayStr}
                    checkIn={checkIn} checkOut={checkOut}
                    hovered={hovered} selecting={!checkOut}
                    onDayClick={handleDayClick}
                    onDayHover={setHovered}
                    onDayLeave={() => setHovered('')}
                  />
                )}
                <CalendarMonth
                  year={view.year} month={view.month}
                  todayStr={todayStr}
                  checkIn={checkIn} checkOut={checkOut}
                  hovered={hovered} selecting={!checkOut}
                  onDayClick={handleDayClick}
                  onDayHover={setHovered}
                  onDayLeave={() => setHovered('')}
                />
              </div>

              {/* הנחיה */}
              <div className="text-center text-xs text-gray-400 mt-4">
                {!checkIn ? 'לחץ על תאריך הכניסה' : !checkOut ? 'עכשיו בחר תאריך יציאה' : `${formatDateHe(checkIn)} – ${formatDateHe(checkOut)}`}
              </div>
            </div>
          )
        })(),
        document.body
      )}
    </div>
  )
}

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
    if (!isOpen || !btnRef.current) return
    const update = () => {
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 6, left: r.left, width: Math.max(r.width, 160) })
      }
    }
    update()
    window.addEventListener('scroll', update, true)
    return () => window.removeEventListener('scroll', update, true)
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
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const today = new Date().toISOString().split('T')[0]

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
      `}</style>
      <div className="bg-white rounded-2xl border border-sand-100 shadow-[0_8px_40px_rgba(61,47,32,0.12)]">
        <div className="text-center py-2 border-b border-sand-100">
          <span className="text-sm font-semibold uppercase tracking-widest text-taupe">חיפוש לפי</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4">

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100" style={{overflow:'visible'}}>
            <IconHome className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <label className="label">סוג נכס</label>
              <Drop id="type" open={openDrop} setOpen={setOpenDrop}
                label="כל הסוגים" value={propertyType} options={PROPERTY_TYPES}
                onChange={(v) => { setPropertyType(String(v)); setError('') }} />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100" style={{overflow:'visible'}}>
            <IconMapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <label className="label">אזור בארץ</label>
              <Drop id="region" open={openDrop} setOpen={setOpenDrop}
                label="בחר אזור" value={region}
                options={[{value:'', label:'כל הארץ'}, ...REGIONS]}
                onChange={(v) => { setRegion(String(v)); setError('') }} />
            </div>
          </div>

          <div className="flex items-start gap-3 px-6 pt-4 pb-2 lg:border-l border-b lg:border-b-0 border-sand-100" style={{overflow:'visible', zIndex:100}}>
            <IconCalendar className="w-4 h-4 text-gold shrink-0 mt-5" />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <DateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={(ci, co) => { setCheckIn(ci); setCheckOut(co); setError('') }}
                onClear={() => { setCheckIn(''); setCheckOut(''); setError('') }}
              />
            </div>
          </div>

          <div className="flex items-start gap-3 px-5 pt-4 pb-2" style={{overflow:'visible'}}>
            <IconUsers className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0" style={{overflow:'visible'}}>
              <label className="label">אורחים</label>
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

        <div className="border-t border-sand-100 p-4 flex items-center justify-center relative">
          <button onClick={handleSearch} className="btn-gold flex items-center justify-center gap-2 py-2.5 px-8 text-sm">
            <IconSearch className="w-4 h-4 shrink-0" color="white" />
            <span>חיפוש</span>
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
