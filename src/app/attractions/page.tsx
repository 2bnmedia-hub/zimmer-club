'use client'
import { CustomSelect } from '@/components/CustomSelect'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'
import { Heart } from 'lucide-react'
import { useWishlist } from '@/hooks/useWishlist'

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

const AUDIENCE = [
  { value: 'couples', label: 'זוגות' },
  { value: 'families', label: 'משפחות' },
  { value: 'groups', label: 'קבוצות' },
  { value: 'kids', label: 'ילדים' },
]

type Attraction = {
  id: string
  slug?: string
  name: string
  short_description: string
  region: string
  city: string
  price_per_person: number
  activity_type: string[]
  avg_rating: number
  attraction_images: { url: string }[]
}

function AttractionsContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { toggle, isLiked } = useWishlist()
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [region, setRegion] = useState(searchParams.get('region') || '')
  const [audience, setAudience] = useState(searchParams.get('category') || '')
  const [activityType, setActivityType] = useState(searchParams.get('type') || '')
  const [search, setSearch] = useState('')

  // עדכן פילטרים כשה-URL משתנה
  useEffect(() => {
    setRegion(searchParams.get('region') || '')
    setAudience(searchParams.get('category') || '')
    setActivityType(searchParams.get('type') || '')
  }, [searchParams])

  useEffect(() => { fetchAttractions() }, [region, audience, activityType])

  async function fetchAttractions() {
    setLoading(true)
    let query = supabase
      .from('attractions')
      .select('*, attraction_images(url, "order")')
      .eq('status', 'active')

    const regionGroups: Record<string, string[]> = {
      north: ['north', 'galil', 'galil_upper', 'galil_lower', 'galil_west', 'kinneret', 'hermon', 'golan'],
      negev: ['negev', 'south', 'arava'],
    }
    if (region) {
      const regions = regionGroups[region] || [region]
      if (regions.length > 1) query = query.in('region', regions)
      else query = query.eq('region', regions[0])
    }

    const { data } = await query.order('avg_rating', { ascending: false })
    let results = data || []

    // פילטר לפי סוג פעילות
    if (activityType) {
      results = results.filter(a => a.activity_type?.includes(activityType))
    }

    // פילטר לפי קהל יעד — מחפש ב-activity_type
    if (audience) {
      const audienceMap: Record<string, string[]> = {
        couples: ['romantic', 'couples'],
        families: ['family', 'families'],
        groups: ['groups'],
        kids: ['kids', 'playground', 'gymboree', 'water_park'],
      }
      const keys = audienceMap[audience] || [audience]
      results = results.filter(a =>
        a.activity_type?.some((t: string) => keys.includes(t))
      )
    }

    setAttractions(results)
    setLoading(false)
  }

  const filtered = search
    ? attractions.filter(a => a.name.includes(search) || a.city?.includes(search) || a.short_description?.includes(search))
    : attractions

  return (
    <>
      <main className="min-h-screen bg-[#FAF7F2] pt-4" dir="rtl">

        {/* כותרת */}
        <div className="bg-white border-b border-gray-100 px-4 py-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">אטרקציות</h1>
            <p className="text-sm text-gray-400">חוויות ופעילויות בכל רחבי הארץ</p>
          </div>
        </div>

        {/* פילטרים */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">

            {/* חיפוש חופשי */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52">
              <IconSearch className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input type="text" placeholder="חפש אטרקציה..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none text-gray-700" dir="rtl" />
            </div>

            {/* איזור */}
            <div className="w-48">
              <CustomSelect
                value={region}
                onChange={setRegion}
                placeholder="כל הארץ"
                options={[{ value: '', label: 'כל הארץ' }, ...REGIONS]}
              />
            </div>

            {/* קהל יעד */}
            <div className="flex gap-2 flex-wrap">
              {AUDIENCE.map(a => (
                <button key={a.value} onClick={() => setAudience(prev => prev === a.value ? '' : a.value)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border transition-all"
                  style={{
                    background: audience === a.value ? '#8B6914' : '#fff',
                    color: audience === a.value ? '#fff' : '#6b7280',
                    borderColor: audience === a.value ? '#8B6914' : '#e5e7eb',
                  }}>
                  {a.label}
                </button>
              ))}
            </div>

            <span className="text-sm text-gray-400 mr-auto">
              {loading ? 'מחפש...' : `${filtered.length} אטרקציות`}
            </span>
          </div>
        </div>

        {/* תוצאות */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-52 bg-gray-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconSearch className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">לא נמצאו אטרקציות</p>
              <p className="text-gray-400 text-sm">נסה לשנות את הפילטרים</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((a) => {
                const firstImage = a.attraction_images?.[0]?.url
                return (
                  <div key={a.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group relative">
                    <Link href={`/attractions/${a.slug || a.id}`}>
                      <div className="h-52 bg-gray-100 relative overflow-hidden">
                        {firstImage ? (
                          <Image src={firstImage} alt={a.name} fill sizes="(max-width:640px) 100vw,(max-width:1024px) 50vw,33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-4xl">🎯</div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <p className="text-xs text-gray-400 mb-0.5">{a.city || REGIONS.find(r => r.value === a.region)?.label}</p>
                            <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-amber-800 transition-colors">{a.name}</h3>
                          </div>
                          {a.avg_rating > 0 && (
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg shrink-0">
                              <IconStar className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-amber-800">{a.avg_rating}</span>
                            </div>
                          )}
                        </div>
                        {a.short_description && <p className="text-xs text-gray-400 mb-3 line-clamp-2 leading-relaxed">{a.short_description}</p>}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div>
                            <span className="font-bold text-gray-900 text-base">₪{a.price_per_person?.toLocaleString()}</span>
                            <span className="text-xs text-gray-400 mr-1">/ לאדם</span>
                          </div>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg"></span>
                        </div>
                      </div>
                    </Link>
                    <button onClick={() => toggle(a.id)}
                      className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-md transition-all hover:scale-110">
                      <IconHeart className={`w-4 h-4 transition-colors ${isLiked(a.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default function AttractionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]"><div className="text-gray-400">טוען...</div></div>}>
      <AttractionsContent />
    </Suspense>
  )
}
