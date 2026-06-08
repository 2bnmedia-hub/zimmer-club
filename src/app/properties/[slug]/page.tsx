'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { Star, MapPin, Users, BedDouble, Bath, Zap, ArrowRight, Check, ChevronLeft, ChevronRight, Navigation, Heart } from 'lucide-react'
import { REGIONS } from '@/lib/constants'
import { useWishlist } from '@/hooks/useWishlist'
import { PropertyQR } from '@/components/property/PropertyQR'

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
  ac: 'מיזוג אוויר', kitchen: 'מטבח', fireplace: 'קמין', garden: 'גינה',
  sea_view: 'נוף לים', mountain_view: 'נוף להרים', sauna: 'סאונה', gym: 'חדר כושר',
  baby_cot: 'עריסה לתינוק', wheelchair: 'נגיש לנכים', shelter: 'מרחב מוגן',
  heated_pool: 'בריכה מחוממת', pets: 'ידידותי לכלבים', spa: 'ספא צמוד',
  private_pool: 'בריכה פרטית', snooker: 'שולחן סנוקר', private_jacuzzi: "ג'קוזי פרטי",
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
      const { data } = await supabase.from('blocked_dates').select('date, status').eq('property_id', propertyId)
      if (data) {
        const map: Record<string, DateStatus> = {}
        data.forEach((d: any) => { map[d.date] = d.status })
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
          <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
          <span className="font-bold text-gray-800 text-sm">{HEBREW_MONTHS[currentMonth]} {currentYear}</span>
          <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
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
  const wa1 = property.contact_via_whatsapp1 && property.whatsapp1 ? 'https://wa.me/' + property.whatsapp1.replace(/\D/g,'') : null
  const wa2 = property.contact_via_whatsapp2 && property.whatsapp2 ? 'https://wa.me/' + property.whatsapp2.replace(/\D/g,'') : null
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
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const { toggle, isLiked } = useWishlist()
  const [loading, setLoading] = useState(true)
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
      setLoading(false)
    }
    load()
  }, [])

  const nights = checkIn && checkOut ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)) : 0
  const total = nights * (property?.price_per_night || 0)

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>
  if (!property) return null

  return (
    <>
      <main className="min-h-screen bg-white pt-4" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-end mb-6"><button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowRight className="w-4 h-4" />חזרה לתוצאות
          </button>

          {/* תמונות */}
          <div className="bg-gray-100 rounded-2xl mb-8 relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <div className="relative w-full">
                  {images.map((url, i) => (
                    <img key={i} src={url} alt={property.name}
                      className="w-full h-auto block max-h-[80vh] object-contain"
                      style={{ display: i === currentImage ? 'block' : 'none' }}
                    />
                  ))}
                </div>
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage(prev => (prev - 1 + images.length) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors z-10">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {images.map((_, i) => <button key={i} onClick={() => setCurrentImage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />)}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">{currentImage + 1} / {images.length}</div>
                  </>
                )}
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400">אין תמונות עדיין</div>
            )}
            <button onClick={() => toggle(property!.id)} className="absolute top-4 left-4 z-10 bg-white/90 hover:bg-white p-2.5 rounded-full shadow-md transition-all hover:scale-110" aria-label="הוסף למועדפים">
              <Heart className={`w-5 h-5 transition-colors ${isLiked(property!.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            {property.instant_book && (
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-white text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"><Zap className="w-3 h-3" />הזמנה מיידית</span>
              </div>
            )}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 mt-9">
              {property.accepts_miluim && <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">🪖 מקבלים שובר מילואים</span>}
              {property.has_shelter && <span className="bg-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">🛡️ קיים מרחב מוגן</span>}
            </div>
          </div>

          {/* תמונות ממוזערות */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button key={i} onClick={() => setCurrentImage(i)} className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-yellow-600' : 'border-transparent'}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{property.category?.[0]} · {property.city || REGIONS[property.region as keyof typeof REGIONS]?.label}</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.name}</h1>
                </div>
                {property.avg_rating > 0 && (
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-gray-900">{property.avg_rating}</span>
                    <span className="text-xs text-gray-500">({property.total_reviews})</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-400" />עד {property.max_guests} אורחים</div>
                <div className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-gray-400" />{property.bedrooms} חדרי שינה</div>
                <div className="flex items-center gap-1.5"><Bath className="w-4 h-4 text-gray-400" />{property.bathrooms} חדרי רחצה</div>
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{property.address || property.city}</div>
              </div>
              <div className="border-t border-gray-100 pt-6 mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{property.description || property.short_description}</p>
              </div>
              {property.video_url && (
                <div className="border-t border-gray-100 pt-6 mb-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">סרטון הנכס</h2>
                  <div className="relative w-full" style={{paddingBottom:'56.25%'}}>
                    <iframe src={property.video_url.replace('watch?v=','embed/').replace('youtu.be/','www.youtube.com/embed/').replace('vimeo.com/','player.vimeo.com/video/')}
                      className="absolute inset-0 w-full h-full rounded-xl" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                </div>
              )}
              {amenities.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">מה יש בנכס</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((key) => (
                      <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />{AMENITY_LABELS[key] || key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AvailabilityCalendar propertyId={property.id} supabase={supabase} />
              {property.slug && <PropertyQR slug={property.slug} name={property.name} />}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
                <p className="text-lg font-bold text-center mb-4" style={{color:'#8B6914'}}>אשמח לבצע הזמנה 😊</p>
                {property.price_per_night > 0 && (
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-gray-900">החל מ: ₪{property.price_per_night}</span>
                    <span className="text-sm text-gray-500">/ לילה</span>
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
                {nights > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600"><span>₪{property.price_per_night} × {nights} לילות</span><span>₪{total}</span></div>
                    <div className="flex justify-between font-bold text-gray-900"><span>סה״כ</span><span>₪{total}</span></div>
                  </div>
                )}
                <button className="w-full py-3 rounded-xl font-bold text-white text-sm transition-colors" style={{backgroundColor:'#8B6914'}} onClick={() => alert('מערכת הזמנות בפיתוח')}>
                  {property.instant_book ? 'הזמן עכשיו' : 'בקש הזמנה'}
                </button>
                <ContactButtons property={property} />
                {property.min_nights > 1 && <p className="text-xs text-gray-400 text-center mt-2">מינימום {property.min_nights} לילות</p>}
                {(property.address || property.city) && (
                  <div className="mt-5 pt-5 border-t border-gray-100">
                    <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5"><MapPin className="w-4 h-4" style={{color:'#8B6914'}} />מיקום הנכס</h3>
                    <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <iframe width="100%" height="200" style={{border:0}} loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent((property.address?property.address+', ':'')+( property.city||'')+', ישראל')}&output=embed&z=15&hl=iw`} />
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((property.address?property.address+', ':'')+(property.city||'')+', ישראל')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-white transition-colors" style={{backgroundColor:'#2563eb'}}>
                      <Navigation className="w-3.5 h-3.5" />נווט
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
