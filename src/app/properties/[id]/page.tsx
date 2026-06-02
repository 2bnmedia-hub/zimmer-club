'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Footer } from '@/components/layout/Footer'
import { Star, MapPin, Users, BedDouble, Bath, Zap, ArrowRight, Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { REGIONS } from '@/lib/constants'

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
  min_nights: number
  max_guests: number
  bedrooms: number
  bathrooms: number
  avg_rating: number
  total_reviews: number
  instant_book: boolean
  status: string
}

const AMENITY_LABELS: Record<string, string> = {
  pool: 'בריכה',
  jacuzzi: "ג'קוזי",
  wifi: 'WiFi',
  parking: 'חניה',
  bbq: 'ברביקיו',
  ac: 'מיזוג אוויר',
  kitchen: 'מטבח',
  fireplace: 'קמין',
  garden: 'גינה',
  sea_view: 'נוף לים',
  mountain_view: 'נוף להרים',
  sauna: 'סאונה',
  gym: 'חדר כושר',
  baby_cot: 'עריסה לתינוק',
  wheelchair: 'נגיש לנכים',
  shelter: 'מרחב מוגן',
  heated_pool: 'בריכה מחוממת',
  pets: 'ידידותי לכלבים',
}

export default function PropertyPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [property, setProperty] = useState<Property | null>(null)
  const [amenities, setAmenities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(2)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('properties').select('*').eq('id', params.id).single()
      if (!data) { router.push('/search'); return }
      setProperty(data)

      const { data: amenityData } = await supabase
        .from('property_amenities')
        .select('amenity_key')
        .eq('property_id', params.id)
      setAmenities(amenityData?.map(a => a.amenity_key) || [])

      const { data: imgData } = await supabase
        .from('property_images')
        .select('url')
        .eq('property_id', params.id)
        .order('order')
      setImages(imgData?.map(i => i.url) || [])

      setLoading(false)
    }
    load()
  }, [])

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0

  const total = nights * (property?.price_per_night || 0)

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>
  if (!property) return null

  return (
    <>
      <main className="min-h-screen bg-white pt-24" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
            <ArrowRight className="w-4 h-4" />
            חזרה לתוצאות
          </button>

          {/* תמונות */}
          <div className="h-72 md:h-[480px] bg-gray-100 rounded-2xl mb-8 relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <img src={images[currentImage]} alt={property.name} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImage(prev => (prev - 1 + images.length) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md hover:bg-white transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImage(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                      ))}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {currentImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">אין תמונות עדיין</div>
            )}
            {property.instant_book && (
              <div className="absolute top-4 right-4">
                <span className="bg-white text-yellow-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  הזמנה מיידית
                </span>
              </div>
            )}
          </div>

          {/* תמונות ממוזערות */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-yellow-600' : 'border-transparent'}`}>
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

              {amenities.length > 0 && (
                <div className="border-t border-gray-100 pt-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">מה יש בנכס</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenities.map((key) => (
                      <div key={key} className="flex items-center gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                        {AMENITY_LABELS[key] || key}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-2xl font-bold text-gray-900">₪{property.price_per_night}</span>
                  <span className="text-sm text-gray-500">/ לילה</span>
                </div>
                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">תאריך כניסה</label>
                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">תאריך יציאה</label>
                    <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">אורחים</label>
                    <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-yellow-600">
                      {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'אורח' : 'אורחים'}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {nights > 0 && (
                  <div className="border-t border-gray-100 pt-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>₪{property.price_per_night} × {nights} לילות</span>
                      <span>₪{total}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>סה״כ</span>
                      <span>₪{total}</span>
                    </div>
                  </div>
                )}
                <button className="w-full py-3 rounded-xl font-bold text-white text-sm transition-colors" style={{ backgroundColor: '#8B6914' }}
                  onClick={() => alert('מערכת הזמנות בפיתוח')}>
                  {property.instant_book ? 'הזמן עכשיו' : 'בקש הזמנה'}
                </button>
                {property.min_nights > 1 && <p className="text-xs text-gray-400 text-center mt-2">מינימום {property.min_nights} לילות</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
