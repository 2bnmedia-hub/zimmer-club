'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { FadingVideo } from '@/components/FadingVideo'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'
import { REGIONS } from '@/lib/constants'
import { buildWhatsAppLink } from '@/lib/utils'
import { useWishlist } from '@/hooks/useWishlist'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { PropertyQR } from '@/components/property/PropertyQR'
import { PropertyReviews } from '@/components/property/PropertyReviews'
import { AdminBackButton } from '@/components/AdminBackButton'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

type Property = {
  id: string
  name: string
  description: string
  short_description: string
  category: string[]
  region: string
  city: string
  address: string
  price_per_night: number
  price_weekend?: number
  price_on_request?: boolean
  video_url?: string
  min_nights: number
  max_guests: number
  bedrooms: number
  bathrooms: number
  avg_rating: number
  total_reviews: number
  instant_book: boolean
  accepts_miluim?: boolean
  has_shelter?: boolean
  phone_landline?: string
  whatsapp1?: string
  whatsapp2?: string
  contact_via_phone_landline?: boolean
  contact_via_whatsapp1?: boolean
  contact_via_whatsapp2?: boolean
  status: string
  slug?: string
}

type DateStatus = 'blocked' | 'approved'

const AMENITY_LABELS: Record<string, string> = {
  pool: 'בריכה', jacuzzi: "ג'קוזי", wifi: 'WiFi', parking: 'חניה', bbq: 'ברביקיו',
  ac: 'מיזוג אוויר', kitchen: 'מטבח', outdoor_kitchen: 'מטבח חוץ', dining_room: 'חדר אוכל',
  fireplace: 'קמין', garden: 'גינה',
  sea_view: 'נוף לים', mountain_view: 'נוף להרים', sauna: 'סאונה', gym: 'חדר כושר',
  ev_charging: 'עמדת טעינה לרכב חשמלי', smart_tv: 'טלוויזיה חכמה',
  baby_cot: 'עריסה לתינוק', wheelchair: 'נגיש לנכים', shelter: 'מרחב מוגן',
  heated_pool: 'בריכה מחוממת', pets: 'ידידותי לכלבים', spa: 'ספא צמוד',
  private_pool: 'בריכה פרטית', snooker: 'שולחן סנוקר', ping_pong: 'שולחן פינג-פונג',
  private_jacuzzi: "ג'קוזי פרטי",
  accessible: 'צימר עם נגישות', couples: 'מתאים לזוגות', families: 'מתאים למשפחות',
  groups: 'מתאים לקבוצות', animals: 'מקבלים בעלי חיים', guests: 'מתאים לאורועים',
  religious: 'מתאים לציבור הדתי', suite: 'סוויטה', treehouse: 'בקתת עץ',
  cave: 'צימר מערה', mobile: 'צימר מבודד', longstay: 'צימרים לטווח ארוך',
  vacation: 'דירת נופש', shelter_nearby: 'מרחב מוגן קרוב',
}

const HEBREW_MONTHS = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']
const HEBREW_DAYS = ['א','ב','ג','ד','ה','ו','ש']

function AvailabilityCalendar({ propertyId, supabase }: { propertyId: string; supabase: ReturnType<typeof createClient> }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [dateMap, setDateMap] = useState<Record<string, DateStatus>>({})
  const [loadingDates, setLoadingDates] = useState(true)

  useEffect(() => {
    async function loadDates() {
      setLoadingDates(true)
      const { data } = await supabase.from('blocked_dates').select('date').eq('property_id', propertyId)
      if (data) {
        const map: Record<string, DateStatus> = {}
        data.forEach((d: any) => { map[d.date] = 'blocked' })
        setDateMap(map)
      }
      setLoadingDates(false)
    }
    loadDates()
  }, [propertyId])

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate()
  const getFirstDay = (m: number, y: number) => new Date(y, m, 1).getDay()
  const formatDate = (day: number) => `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y-1) } else setCurrentMonth(m => m-1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y+1) } else setCurrentMonth(m => m+1) }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDay(currentMonth, currentYear)

  const getDayStyle = (day: number) => {
    const dateStr = formatDate(day)
    const status = dateMap[dateStr]
    const isPast = new Date(dateStr) < new Date(today.toDateString())
    if (isPast) return 'bg-gray-50 text-gray-300 cursor-default'
    if (status === 'blocked') return 'bg-red-100 text-red-600 font-medium cursor-default'
    return 'bg-green-50 text-green-700'
  }

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4">זמינות</h2>
      <div className="bg-gray-50 rounded-2xl p-5">
        <div className="flex items-center gap-5 mb-4">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-white border border-gray-300" /><span className="text-xs text-gray-500">פנוי</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-xs text-gray-500">תפוס</span></div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"><IconChevronRight className="w-4 h-4 text-gray-500" /></button>
          <span className="font-bold text-gray-800 text-sm">{HEBREW_MONTHS[currentMonth]} {currentYear}</span>
          <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"><IconChevronLeft className="w-4 h-4 text-gray-500" /></button>
        </div>
        {loadingDates ? <div className="text-center py-8 text-gray-400 text-sm">טוען...</div> : (
          <div className="grid grid-cols-7 gap-1">
            {HEBREW_DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
            {Array(firstDay).fill(null).map((_, i) => <div key={`b-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i+1).map(day => (
              <div key={day} className={`aspect-square rounded-lg text-xs flex items-center justify-center transition-colors ${getDayStyle(day)}`}>{day}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ContactButtons({ property }: { property: any }) {
  const wa1 = property.contact_via_whatsapp1 && property.whatsapp1 ? buildWhatsAppLink(property.whatsapp1) : null
  const wa2 = property.contact_via_whatsapp2 && property.whatsapp2 ? buildWhatsAppLink(property.whatsapp2) : null
  const phone = property.contact_via_phone_landline && property.phone_landline ? 'tel:' + property.phone_landline : null
  if (!wa1 && !wa2 && !phone) return null
  const WaIcon = () => <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.886l6.232-1.638A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.032-1.37l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/></svg>
  return (
    <div className="flex gap-2 mt-2">
      {wa1 && <a href={wa1} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white" style={{backgroundColor:'#25D366'}}><WaIcon />וואטסאפ</a>}
      {wa2 && <a href={wa2} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white" style={{backgroundColor:'#128C7E'}}><WaIcon />וואטסאפ 2</a>}
      {phone && <a href={phone} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white" style={{backgroundColor:'#4B5563'}}><svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>חייג עכשיו</a>}
    </div>
  )
}

export default function PropertyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [property, setProperty] = useState<Property | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])
  const [propertyVideos, setPropertyVideos] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [galleryExpanded, setGalleryExpanded] = useState(false)
  const mobileGalleryRef = useRef<HTMLDivElement>(null)
  const lightboxCloseRef = useRef<HTMLButtonElement>(null)
  const { toggle, isLiked } = useWishlist()
  const { addItem: addRecentItem } = useRecentlyViewed()
  const [loading, setLoading] = useState(true)
  const [neighbors, setNeighbors] = useState<{ prev?: { id: string; slug?: string; name: string }; next?: { id: string; slug?: string; name: string } }>({})
  const [units, setUnits] = useState<{id:string;name:string;description:string;price_per_night:number;max_guests:number;bedrooms:number;bathrooms:number;images:{url:string}[]}[]>([])
  const [activeUnit, setActiveUnit] = useState<string|null>(null)

  useEffect(() => {
    setCurrentImage(0)
  }, [activeUnit])

  useEffect(() => {
    document.body.style.overflow = galleryExpanded ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [galleryExpanded])

  useEffect(() => {
    if (!galleryExpanded) return
    lightboxCloseRef.current?.focus()
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setGalleryExpanded(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [galleryExpanded])
  const [checkIn, setCheckIn] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [dateError, setDateError] = useState('')
  const [guests, setGuests] = useState(2)

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => setCurrentImage(prev => (prev + 1) % images.length), 3000)
    return () => clearInterval(interval)
  }, [images])

  useEffect(() => {
    async function load() {
      const slugOrId = params.slug as string

      // נסה למצוא לפי slug קודם, אחר כך לפי id
      let { data } = await supabase.from('properties').select('*').eq('slug', slugOrId).single()
      if (!data) {
        const res = await supabase.from('properties').select('*').eq('id', slugOrId).single()
        data = res.data
      }
      if (!data) { router.push('/search'); return }

      // redirect ל-slug אם הגיע דרך id
      if (data.slug && slugOrId === data.id) {
        router.replace(`/${data.slug}`)
        return
      }

      setProperty(data)

      // שמירה ב-Recently Viewed
      const { data: firstImg } = await supabase.from('property_images').select('url').eq('property_id', data.id).order('order').limit(1).single()
      addRecentItem({
        id: data.id,
        slug: data.slug,
        name: data.name,
        city: data.city,
        price_per_night: data.price_per_night,
        imageUrl: firstImg?.url,
      })

      const { data: amenityData } = await supabase.from('property_amenities').select('amenity_id').eq('property_id', data.id)
      if (amenityData && amenityData.length > 0) {
        const ids = amenityData.map((a: any) => a.amenity_id)
        const { data: amenitiesData } = await supabase.from('amenities').select('key').in('id', ids)
        setAmenities(amenitiesData?.map((a: any) => a.key).filter(Boolean) || [])
      } else {
        setAmenities([])
      }

      const { data: imgData } = await supabase.from('property_images').select('url').eq('property_id', data.id).order('order')
      setImages(imgData?.map((i: any) => i.url) || [])
      const { data: vidData } = await supabase.from('property_videos').select('url').eq('property_id', data.id).order('order')
      setPropertyVideos(vidData?.map((v: any) => v.url) || [])
      const { data: unitsData } = await supabase.from('property_units').select('*, property_unit_images(url, order)').eq('property_id', data.id).order('sort_order')
      if (unitsData && unitsData.length > 0) {
        setUnits(unitsData.map((u: any) => ({ ...u, images: (u.property_unit_images || []).sort((a: any, b: any) => a.order - b.order) })))
        setActiveUnit('main')
      }

      // Prev/Next navigation within same region
      const [{ data: prevData }, { data: nextData }] = await Promise.all([
        supabase.from('properties').select('id, slug, name').eq('region', data.region).eq('status', 'active').lt('created_at', data.created_at).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('properties').select('id, slug, name').eq('region', data.region).eq('status', 'active').gt('created_at', data.created_at).order('created_at', { ascending: true }).limit(1).single(),
      ])
      setNeighbors({ prev: prevData || undefined, next: nextData || undefined })

      setLoading(false)
    }
    load()
  }, [])

  const nights = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0
  const total = nights * (property?.price_per_night || 0)

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>
  if (!property) return null

  const categoryLabels: Record<string, string> = {
    zimmer: 'צימר', complex: 'מתחם צימרים', villa: 'וילות ובקתות',
    hotel: 'מלונות', camping: 'קמפינג',
  }

  const regionLabels: Record<string, string> = {
    north: 'צפון', galil_west: 'גליל המערבי', galil_upper: 'גליל העליון',
    galil_lower: 'גליל התחתון', kinneret: 'כנרת', hermon: 'חרמון',
    center: 'מרכז', jerusalem: 'ירושלים', dead_sea: 'ים המלח',
    negev: 'דרום', eilat: 'אילת', golan: 'רמת הגולן',
  }

  return (
    <>
      <AdminBackButton />
      {/* Mobile sticky booking bar */}
      <div className="lg:hidden mobile-booking-bar">
        <div>
          {property.price_on_request ? (
            <p className="font-bold text-gray-900 text-sm">התקשרו לבירור מחיר</p>
          ) : property.price_per_night > 0 && (
            <p className="font-bold text-gray-900 text-base">
              <span className="text-xs font-normal text-gray-500">החל מ</span> ₪{property.price_per_night.toLocaleString()}
              <span className="text-xs font-normal text-gray-500 mr-1">/ לילה</span>
            </p>
          )}
          {property.avg_rating > 0 && (
            <div className="flex items-center gap-1">
              <IconStar className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-gray-600 font-medium">{property.avg_rating}</span>
              <span className="text-xs text-gray-400">({property.total_reviews})</span>
            </div>
          )}
        </div>
        <button
          className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)' }}
          onClick={() => { const el = document.getElementById('booking-form'); el?.scrollIntoView({ behavior: 'smooth' }) }}>
          {property.instant_book ? '⚡ הזמן עכשיו' : 'בקש הזמנה'}
        </button>
      </div>

      <main className="min-h-screen bg-white pt-4 property-content-mobile lg:pb-0" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
          <Breadcrumb items={[
            { label: 'דף הבית', href: '/' },
            { label: regionLabels[property.region] || 'נכסים', href: `/search?region=${property.region}` },
            { label: property.city || '', href: property.city ? `/search?region=${property.region}` : undefined },
            { label: property.name },
          ].filter(item => item.label)} />
          <div className="flex justify-start mb-4"><button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"><IconArrowRight className="w-4 h-4" />חזרה</button></div>

          {/* תמונות + מידע בשורה אחת */}
          <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-4 md:gap-6 mb-6 md:mb-8 items-start">

            {/* ימין — מידע */}
            <div className="order-2 md:order-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm h-full flex flex-col justify-start">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.name}</h1>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: property.name, url: window.location.href })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert('הקישור הועתק!')
                    }
                  }}
                  className="shrink-0 p-2 rounded-full hover:bg-amber-50 transition-colors" style={{border:'1.5px solid rgba(212,168,67,0.4)'}}>
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#8B6914"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/></svg>
                </button>
              </div>
              {property.short_description && <p className="text-sm font-bold text-gray-800 mb-2 leading-relaxed">{property.short_description}</p>}
              <p className="text-sm text-gray-500 mb-3">{categoryLabels[property.category?.[0]] || property.category?.[0]} · {property.city || ({north:"צפון",galil_west:"גליל המערבי",galil_upper:"גליל העליון",galil_lower:"גליל התחתון",kinneret:"כנרת",hermon:"חרמון",center:"מרכז",jerusalem:"ירושלים",dead_sea:"ים המלח",negev:"דרום",eilat:"אילת",golan:"רמת הגולן"} as Record<string,string>)[property.region]}</p>
              <div className="mb-4">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} viewBox="0 0 24 24" className="w-4 h-4" fill={i <= Math.round(property.avg_rating || 0) ? '#FBBF24' : '#E5E7EB'}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  ))}
                  <span className="font-bold text-gray-900 text-sm mr-1">{property.avg_rating > 0 ? property.avg_rating : '—'}</span>
                </div>
                <p className="text-xs text-gray-400">{property.total_reviews || 0} חוות דעת</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5"><IconUsers className="w-4 h-4 text-gray-400" />עד {property.max_guests} אורחים</div>
                <div className="flex items-center gap-1.5"><IconBed className="w-4 h-4 text-gray-400" />{property.bedrooms} חדרי שינה</div>
                <div className="flex items-center gap-1.5"><IconBath className="w-4 h-4 text-gray-400" />{property.bathrooms} חדרי רחצה</div>
                <div className="flex items-center gap-1.5"><IconMapPin className="w-4 h-4 text-gray-400" />{property.address || property.city}</div>
              </div>
              {(property.address || property.city) && (
                <div className="mt-auto pt-4">
                  <a href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((property.address ? property.address + ", " : "") + (property.city || "") + ", ישראל")}
                    target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors"
                    style={{height:"140px", background:"linear-gradient(135deg,#f0f4f0 0%,#e8f0e8 50%,#ddeedd 100%)"}}>
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <IconMapPin className="w-5 h-5" style={{color:'#8B6914'}} />
                    </div>
                    <p className="text-xs font-bold text-gray-700">{property.address || property.city}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full shadow" style={{backgroundColor:"#fff", color:"#8B6914"}}>
                      📍 פתח בגוגל מפות
                    </span>
                  </a>
                </div>
              )}
            </div>

            {/* שמאל — תמונה */}
          <div className="order-1 md:order-2">
            {units.length > 0 && (
              <div className="flex overflow-x-auto gap-2 p-3 mb-2 rounded-2xl" style={{scrollbarWidth:'none', background:'white', border:'1px solid rgba(212,168,67,0.2)'}}>
                <button onClick={() => { setActiveUnit('main'); setCurrentImage(0) }}
                  className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                  style={activeUnit === 'main'
                    ? {background:'linear-gradient(135deg,#f5d078 0%,#C8960C 50%,#8B6914 100%)',color:'white',boxShadow:'0 4px 12px rgba(184,134,11,0.35)'}
                    : {background:'#f9f9f9',color:'#8B6914',border:'1px solid rgba(212,168,67,0.25)'}}>
                  גלריה כללית
                </button>
                {units.map(u => (
                  <button key={u.id} onClick={() => { setActiveUnit(u.id); setCurrentImage(0) }}
                    className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    style={activeUnit === u.id
                      ? {background:'linear-gradient(135deg,#f5d078 0%,#C8960C 50%,#8B6914 100%)',color:'white',boxShadow:'0 4px 12px rgba(184,134,11,0.35)'}
                      : {background:'#f9f9f9',color:'#8B6914',border:'1px solid rgba(212,168,67,0.25)'}}>
                    {u.name}
                  </button>
                ))}
              </div>
            )}
          <div className="bg-gray-100 rounded-2xl relative overflow-hidden">
            {(() => {
              const activeUnitData = activeUnit && activeUnit !== 'main' ? units.find(u => u.id === activeUnit) : null
              const displayImages: string[] = activeUnitData ? activeUnitData.images.map((i: any) => i.url) : images
              const safeIndex = currentImage >= displayImages.length ? 0 : currentImage
              const goToImage = (index: number) => {
                setCurrentImage(index)
                const el = mobileGalleryRef.current
                if (el) el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' })
              }
              return displayImages.length > 0 ? (
              <>
                {/* Mobile: collapsed grid (Booking.com-style), tap to expand into swipeable gallery */}
                {!galleryExpanded && (
                  <div className="md:hidden grid grid-cols-3 grid-rows-2 gap-1 p-1" style={{ height: 280 }}>
                    <button type="button" onClick={() => { setCurrentImage(0); setGalleryExpanded(true) }}
                      aria-label={`פתח גלריית תמונות, תמונה 1 מתוך ${displayImages.length}`}
                      className="col-span-2 row-span-2 relative rounded-r-xl overflow-hidden">
                      <Image src={displayImages[0]} alt={property.name} fill sizes="66vw" className="object-cover" priority />
                    </button>
                    {displayImages.slice(1, 3).map((url: string, i: number) => {
                      const idx = i + 1
                      const remaining = displayImages.length - 3
                      const isLastSlot = i === 1
                      return (
                        <button key={idx} type="button" onClick={() => { setCurrentImage(idx); setGalleryExpanded(true) }}
                          aria-label={isLastSlot && remaining > 0 ? `הצג את כל ${displayImages.length} התמונות` : `פתח גלריית תמונות, תמונה ${idx + 1} מתוך ${displayImages.length}`}
                          className={`relative overflow-hidden ${i === 0 ? 'rounded-tl-xl' : ''} ${isLastSlot ? 'rounded-bl-xl' : ''}`}>
                          <Image src={url} alt={property.name} fill sizes="33vw" className="object-cover" />
                          {isLastSlot && remaining > 0 && (
                            <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-sm">
                              +{remaining}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
                {/* Mobile: full-screen lightbox */}
                {galleryExpanded && (
                  <div className="md:hidden fixed inset-0 z-[999997] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label="גלריית תמונות במסך מלא">
                    <button type="button" ref={lightboxCloseRef} onClick={() => setGalleryExpanded(false)}
                      aria-label="סגור גלריית תמונות"
                      className="absolute top-4 right-4 z-10 bg-white/15 text-white p-2.5 rounded-full">
                      <IconX className="w-5 h-5" />
                    </button>
                    {displayImages.length > 1 && (
                      <div className="absolute top-4 left-4 z-10 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {safeIndex + 1} / {displayImages.length}
                      </div>
                    )}
                    <div ref={mobileGalleryRef} className="flex-1 flex overflow-x-auto gallery-container snap-x snap-mandatory scrollbar-none"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      onScroll={(e) => {
                        const el = e.currentTarget
                        const idx = Math.round(el.scrollLeft / el.offsetWidth)
                        setCurrentImage(idx)
                      }}>
                      {displayImages.map((url: string, i: number) => (
                        <div key={i} className="shrink-0 w-full h-full relative snap-start gallery-item">
                          <Image src={url} alt={property.name} fill sizes="100vw" className="object-contain" />
                        </div>
                      ))}
                    </div>
                    {displayImages.length > 1 && (
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {displayImages.map((_: string, i: number) => <button key={i} onClick={() => goToImage(i)} aria-label={`עבור לתמונה ${i + 1}`} className={`w-2 h-2 rounded-full transition-colors ${i === safeIndex ? 'bg-white' : 'bg-white/40'}`} />)}
                      </div>
                    )}
                  </div>
                )}
                {/* Desktop: original display */}
                <div className="relative w-full hidden md:block" style={{height:"55vh"}}>
                  {displayImages.map((url: string, i: number) => (
                    <Image key={i} src={url} alt={property.name} fill sizes="(max-width: 1024px) 100vw, 66vw" className="object-contain" style={{ display: i === safeIndex ? 'block' : 'none' }} priority={i === 0} />
                  ))}
                </div>
                {displayImages.length > 1 && (
                  <div className="hidden md:block">
                    <button onClick={() => goToImage((safeIndex - 1 + displayImages.length) % displayImages.length)}
                      aria-label="התמונה הקודמת"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10">
                      <IconChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={() => goToImage((safeIndex + 1) % displayImages.length)}
                      aria-label="התמונה הבאה"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10">
                      <IconChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {displayImages.map((_: string, i: number) => <button key={i} onClick={() => goToImage(i)} aria-label={`עבור לתמונה ${i + 1}`} className={`w-2 h-2 rounded-full transition-colors ${i === safeIndex ? 'bg-white' : 'bg-white/50'}`} />)}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">{safeIndex + 1} / {displayImages.length}</div>
                  </div>
                )}
              </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">אין תמונות עדיין</div>
              )
            })()}
            <button onClick={() => toggle(property!.id)} className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md transition-all hover:scale-110" aria-label="הוסף למועדפים">
              <IconHeart className={`w-5 h-5 transition-colors ${isLiked(property!.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
              <style>{`
                @keyframes shimmer-badge {
                  0% { transform: scale(1); opacity: 1; }
                  50% { transform: scale(1.04); opacity: 0.85; }
                  100% { transform: scale(1); opacity: 1; }
                }
                .badge-shimmer {
                  background: rgba(255,255,255,0.92);
                  border: 1px solid rgba(196,165,107,0.3);
                  animation: shimmer-badge 2.5s ease-in-out infinite;
                }
                .badge-shimmer-green {
                  background: #006039;
                  animation: shimmer-badge 2.5s ease-in-out infinite;
                }
              `}</style>
              {property.instant_book && (
                <span className="badge-shimmer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm"
                  style={{color:'#8B6914', border:'1px solid rgba(196,165,107,0.3)', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                  <IconZap className="w-3 h-3" style={{color:'#C4A56B'}} />הזמנה מיידית
                </span>
              )}
              {property.accepts_miluim && (
                <span className="badge-shimmer-green flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm"
                  style={{color:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.12)'}}>
                  מקבלים שובר מילואים
                </span>
              )}
              {amenities.includes('ev_charging') && (
                <span className="badge-shimmer flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm"
                  style={{color:'#15803d', border:'1px solid rgba(21,128,61,0.25)', boxShadow:'0 2px 8px rgba(0,0,0,0.08)'}}>
                  🔌 עמדת טעינה לרכב חשמלי
                </span>
              )}
            </div>
          </div>
          </div>

          </div>{/* סוף grid תמונה+מידע */}

          {/* תמונות ממוזערות — דסקטופ בלבד, בנייד יש גלריית grid למעלה */}
          {images.length > 1 && (
            <div className="hidden md:flex gap-2 mb-8 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`shrink-0 w-20 h-16 relative rounded-xl overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-yellow-600' : 'border-transparent'}`}>
                  <Image src={url} alt={`${property.name} — תמונה ${i + 1}`} fill sizes="80px" className="object-contain bg-gray-100" />
                </button>
              ))}
            </div>
          )}



          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
            <div className="lg:col-span-2">
              <div className="border-t border-gray-100 pt-6 mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description || property.short_description}</p>
              </div>
              {property.video_url && (() => {
                const vid = property.video_url
                const isYT = vid.includes('youtube.com') || vid.includes('youtu.be')
                const isVimeo = vid.includes('vimeo.com')
                const embedSrc = isYT
                  ? vid.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                  : isVimeo
                  ? vid.replace('vimeo.com/', 'player.vimeo.com/video/')
                  : null
                return (
                  <div className="border-t border-gray-100 pt-6 mb-6">
                    <h2 className="font-bold text-gray-900 text-lg mb-4">סרטון הנכס</h2>
                    {embedSrc ? (
                      <div className="relative w-full" style={{paddingBottom:'56.25%'}}>
                        <iframe src={embedSrc} className="absolute inset-0 w-full h-full rounded-xl"
                          allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                      </div>
                    ) : (
                      <a href={vid} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 py-6 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 fill-red-500"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 1.77-.13 3.08-.44 3.83-.28.66-.73 1.11-1.39 1.39-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 17c-3.19 0-5.17-.13-5.83-.44-.66-.28-1.11-.73-1.39-1.39-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L4 12c0-1.77.13-3.08.44-3.83.28-.66.73-1.11 1.39-1.39.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 7c3.19 0 5.17.13 5.83.44.66.28 1.11.73 1.39 1.39z"/></svg>
                        <span className="font-bold text-gray-700">לצפייה בסרטון הנכס</span>
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-400"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59L7.76 14.83l1.41 1.41L19 5.41V9h2V3h-7z"/></svg>
                      </a>
                    )}
                  </div>
                )
              })()}
              {propertyVideos.length > 0 && (
                <div className="border-t border-gray-100 pt-6 mb-6">
                  {!property.video_url && <h2 className="font-bold text-gray-900 text-lg mb-4">סרטון הנכס</h2>}
                  <div className={propertyVideos.length > 1 ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''}>
                    {propertyVideos.map((url, i) => (
                      <div key={i} className="relative w-full rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
                        <FadingVideo src={url} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {amenities.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">מה יש בנכס</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((key) => (
                      <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                        <IconCheck className="w-4 h-4 text-green-500 shrink-0" />{AMENITY_LABELS[key] || key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AvailabilityCalendar propertyId={property.id} supabase={supabase} />
              {property.slug && <PropertyQR slug={property.slug} name={property.name} />}
              <PropertyReviews propertyId={property.id} />
            </div>

            <div className="lg:col-span-1">
              <div id="booking-form" className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
                <p className="text-lg font-bold text-center mb-3" style={{color:'#8B6914'}}>אשמח לבצע הזמנה 😊</p>
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  <span className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2.5 py-1 font-medium">✓ מחיר ישיר מהמארח</span>
                  {property.instant_book && <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-1 font-medium">⚡ מיידי</span>}
                </div>
                {property.price_on_request ? (
                  <div className="mb-4 bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-lg font-bold text-gray-900">📞 התקשרו לבירור מחיר</p>
                  </div>
                ) : property.price_per_night > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-400 mb-1">אמצ"ש</p>
                        <p className="text-lg font-bold text-gray-900">₪{property.price_per_night.toLocaleString()}</p>
                      </div>
                      <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
                        <p className="text-xs text-amber-600 mb-1">סוף שבוע</p>
                        <p className="text-lg font-bold text-amber-800">₪{(property.price_weekend || property.price_per_night).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-1.5">מחיר ללילה</p>
                  </div>
                )}
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">שם מלא *</label>
                    <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="ישראל ישראלי" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">מספר טלפון *</label>
                    <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="050-0000000" dir="ltr" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">תאריך כניסה</label>
                    <input type="date" value={checkIn} onChange={(e) => { const val=e.target.value; const t=new Date().toISOString().split('T')[0]; if(val&&val<t){setDateError('תאריך הכניסה אינו תקין');return} setCheckIn(val);setDateError('') }} min={new Date().toISOString().split('T')[0]} max="2099-12-31" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">תאריך יציאה</label>
                    <input type="date" value={checkOut} onChange={(e) => { const val=e.target.value; const t=new Date().toISOString().split('T')[0]; if(val&&val<t){setDateError('תאריך היציאה אינו תקין');return} if(val&&checkIn&&val<=checkIn){setDateError('תאריך היציאה חייב להיות אחרי תאריך הכניסה');return} setCheckOut(val);setDateError('') }} min={checkIn||new Date().toISOString().split('T')[0]} max="2099-12-31" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600" dir="ltr" />
                  </div>
                  <div>
                    {dateError && <p className="text-xs text-red-500 mb-2">{dateError}</p>}
                    <label className="block text-xs font-medium text-gray-600 mb-1">אורחים</label>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600">
                      {Array.from({length: property.max_guests}, (_,i) => i+1).map(n => <option key={n} value={n}>{n} {n===1?'אורח':'אורחים'}</option>)}
                    </select>
                  </div>
                </div>
                {!property.price_on_request && nights > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600"><span>₪{property.price_per_night} × {nights} לילות</span><span>₪{total}</span></div>
                    <div className="flex justify-between font-bold text-gray-900"><span>סה״כ</span><span>₪{total}</span></div>
                  </div>
                )}
                {/* כפתורי יצירת קשר */}
                {(() => {
                  const waNumber = (property.contact_via_whatsapp1 && property.whatsapp1)
                    ? property.whatsapp1.replace(/\D/g, '')
                    : (property.contact_via_whatsapp2 && property.whatsapp2)
                    ? property.whatsapp2.replace(/\D/g, '')
                    : null
                  const phoneNumber = property.contact_via_phone_landline && property.phone_landline
                    ? property.phone_landline
                    : null
                  const msgParts = 'שלום, הגעתי דרך האתר zimmer.club ואשמח לקבל עזרה בהזמנה'
                  const waUrl = waNumber ? buildWhatsAppLink(waNumber, msgParts) : null
                  return (
                    <div className="flex gap-2">
                      {waUrl && (
                        <a href={waUrl} target="_blank" rel="noopener noreferrer"
                          className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow: '0 4px 12px rgba(37,211,102,0.3)' }}>
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.886l6.232-1.638A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.032-1.37l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/></svg>
                          וואטסאפ
                        </a>
                      )}
                      {phoneNumber && (
                        <a href={`tel:${phoneNumber}`}
                          className="flex-1 py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)', boxShadow: '0 4px 12px rgba(139,105,20,0.3)' }}>
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                          התקשר
                        </a>
                      )}
                      {!waUrl && !phoneNumber && (
                        <p className="text-xs text-center text-gray-400 py-2">ניתן ליצור קשר דרך הפרטים למטה</p>
                      )}
                    </div>
                  )
                })()}
                {property.min_nights > 1 && <p className="text-xs text-gray-400 text-center mt-2">מינימום {property.min_nights} לילות</p>}
                {(property.address || property.city) && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5"><IconMapPin className="w-4 h-4" style={{color:'#8B6914'}} />מיקום הנכס</h3>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((property.address?property.address+', ':'')+(property.city||'')+', ישראל')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors mb-2"
                      style={{height:"180px", background:"linear-gradient(135deg,#f0f4f0 0%,#e8f0e8 50%,#ddeedd 100%)"}}>
                      <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                        <IconMapPin className="w-6 h-6" style={{color:'#8B6914'}} />
                      </div>
                      <div className="text-center px-3">
                        <p className="text-xs font-bold text-gray-700 mb-1">{property.address || property.city}</p>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{backgroundColor:"#fff", color:"#8B6914", boxShadow:'0 2px 6px rgba(0,0,0,0.08)'}}>
                          לחץ לפתיחה בגוגל מפות
                        </span>
                      </div>
                    </a>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((property.address?property.address+', ':'')+(property.city||'')+', ישראל')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold transition-colors" style={{background:'linear-gradient(135deg, #F8F4EE 0%, #DDD5C8 100%)', color:'#3D2F20', boxShadow:'0 4px 12px rgba(0,0,0,0.08)'}}>
                      <IconNavigation className="w-3.5 h-3.5" />נווט
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      {/* Prev / Next navigation */}
      {(neighbors.prev || neighbors.next) && (
        <div className="border-t border-gray-100 bg-gray-50 py-4 px-4" dir="rtl">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            {neighbors.next ? (
              <Link
                href={neighbors.next.slug ? `/properties/${neighbors.next.slug}` : `/property/${neighbors.next.id}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-700 transition-colors"
              >
                <span className="text-gray-300">‹</span>
                <span className="truncate max-w-[180px]">הנכס הבא: {neighbors.next.name}</span>
              </Link>
            ) : <span />}
            {neighbors.prev ? (
              <Link
                href={neighbors.prev.slug ? `/properties/${neighbors.prev.slug}` : `/property/${neighbors.prev.id}`}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-700 transition-colors"
              >
                <span className="truncate max-w-[180px]">הנכס הקודם: {neighbors.prev.name}</span>
                <span className="text-gray-300">›</span>
              </Link>
            ) : <span />}
          </div>
        </div>
      )}
      </main>
    </>
  )
}
