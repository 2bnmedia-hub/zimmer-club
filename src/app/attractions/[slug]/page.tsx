'use client'

import { useEffect, useState } from 'react'
import { AdminBackButton } from '@/components/AdminBackButton'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { IconSearch, IconMapPin, IconCalendar, IconUsers, IconHome, IconChevronDown, IconChevronUp, IconChevronLeft, IconChevronRight, IconStar, IconHeart, IconUser, IconPhone, IconGlobe, IconNavigation, IconArrowRight, IconZap, IconEye, IconEyeOff, IconUpload, IconTrash, IconEdit, IconPlus, IconCheck, IconMail, IconSend, IconRefresh, IconSparkles, IconBed, IconBath, IconTrendingUp, IconLoader, IconCamera, IconSave, IconAlertCircle, IconCheckCircle, IconClock, IconSliders, IconPencil, IconQr, IconShare, IconDownload, IconZoomIn, IconZoomOut, IconLogOut, IconSettings, IconMenu, IconX } from '@/components/icons'

const DAYS_LABELS: Record<string, string> = {
  sun: "א'", mon: "ב'", tue: "ג'", wed: "ד'", thu: "ה'", fri: "ו'", sat: "ש'"
}

function parseHours(opening_hours: string) {
  try {
    const parsed = JSON.parse(opening_hours)
    const activeDays = Object.entries(parsed)
      .filter(([_, v]: any) => v.active)
      .map(([k, v]: any) => `${DAYS_LABELS[k]} ${v.from}-${v.to}`)
    return activeDays.length > 0 ? activeDays.join(' | ') : 'לא צוינו שעות'
  } catch {
    return opening_hours
  }
}

const REGION_LABELS: Record<string, string> = {
  north: 'צפון', galil_west: 'גליל המערבי', galil_upper: 'גליל העליון',
  galil_lower: 'גליל התחתון', kinneret: 'כנרת', hermon: 'חרמון',
  center: 'מרכז', jerusalem: 'ירושלים', dead_sea: 'ים המלח',
  negev: 'דרום', eilat: 'אילת', golan: 'רמת הגולן',
}

const ACTIVITY_LABELS: Record<string, string> = {
  racer: 'ריצר', climbing: 'קיר טיפוס', ezy_rider: 'איזי ריידר',
  laser_tag: 'לייזר טאג', horses: 'רכיבה על סוסים', karting: 'קארטינג',
  buggy: 'באגי', water_park: 'פארק מים', pool: 'בריכה',
  gymboree: 'גימבורי', playground: 'גן שעשועים', ceramics: 'סדנת קרמיקה',
  cooking: 'סדנת בישול', archery: 'קשתות', paintball: 'פיינטבול',
  escape_room: 'חדר בריחה', zipline: 'זיפליין', hiking: 'טיולים',
  nature: 'טבע', family: 'פעילות משפחתית',
}

type Attraction = {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
  region: string
  city: string
  address: string
  price_per_person: number
  min_age: number
  max_age: number
  activity_type: string[]
  opening_hours: string
  phone: string
  whatsapp: string
  email: string
  website: string
  video_url: string
  avg_rating: number
  total_reviews: number
  status: string
}

type Review = {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: { full_name: string }
}

function ReviewsSection({ attractionId }: { attractionId: string }) {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    loadReviews()
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  async function loadReviews() {
    const { data } = await supabase
      .from('attraction_reviews')
      .select('*, profiles(full_name)')
      .eq('attraction_id', attractionId)
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSubmitting(true)
    await supabase.from('attraction_reviews').insert({
      attraction_id: attractionId,
      user_id: user.id,
      rating,
      comment,
    })
    setComment('')
    setRating(5)
    await loadReviews()
    setSubmitting(false)
  }

  return (
    <>
      <AdminBackButton />
      <div className="border-t border-gray-100 pt-6 mt-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4">ביקורות ({reviews.length})</h2>

      {user && (
        <form onSubmit={submitReview} className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">כתוב ביקורת</p>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(s => (
              <button key={s} type="button" onClick={() => setRating(s)}>
                <IconStar className={`w-6 h-6 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={e => setComment(e.target.value)}
            placeholder="שתף את החוויה שלך..." rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-yellow-600 resize-none mb-3" />
          <button type="submit" disabled={submitting || !comment.trim()}
            className="px-6 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-50"
            style={{ backgroundColor: '#8B6914' }}>
            {submitting ? 'שולח...' : 'שלח ביקורת'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">אין ביקורות עדיין — היה הראשון!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{r.profiles?.full_name || 'משתמש'}</p>
                  <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString('he-IL')}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <IconStar key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
    </>
  )
}

export default function AttractionPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [attraction, setAttraction] = useState<Attraction | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (images.length <= 1) return
    const interval = setInterval(() => setCurrentImage(prev => (prev + 1) % images.length), 3000)
    return () => clearInterval(interval)
  }, [images])

  useEffect(() => {
    async function load() {
      const slugOrId = params.slug as string
      let { data } = await supabase.from('attractions').select('*').eq('slug', slugOrId).single()
      if (!data) {
        const res = await supabase.from('attractions').select('*').eq('id', slugOrId).single()
        data = res.data
      }
      if (!data) { router.push('/attractions'); return }
      setAttraction(data)
      const { data: imgData } = await supabase.from('attraction_images').select('url').eq('attraction_id', data.id).order('order')
      setImages(imgData?.map((i: any) => i.url) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>
  if (!attraction) return null

  const waLink = attraction.whatsapp ? `https://wa.me/${attraction.whatsapp.replace(/\D/g, '')}` : null
  const mapsQuery = encodeURIComponent((attraction.address ? attraction.address + ', ' : '') + (attraction.city || '') + ', ישראל')

  return (
    <main className="min-h-screen bg-white pt-4" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <IconArrowRight className="w-4 h-4" />חזרה
        </button>

        {/* תמונות + מידע */}
        <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-4 md:gap-6 mb-6 items-start">

          {/* מידע */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">
              {attraction.activity_type?.slice(0,2).map(t => ACTIVITY_LABELS[t]).join(' · ')} · {attraction.city || REGION_LABELS[attraction.region]}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{attraction.name}</h1>
            {attraction.short_description && !attraction.short_description.startsWith('{') && <p className="text-sm text-gray-600 mb-4">{attraction.short_description}</p>}

            {attraction.avg_rating > 0 && (
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl w-fit mb-4">
                <IconStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-gray-900">{attraction.avg_rating}</span>
                <span className="text-xs text-gray-500">({attraction.total_reviews})</span>
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              {attraction.price_per_person > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">₪{attraction.price_per_person}</span>
                  <span className="text-gray-400">/ לאדם</span>
                </div>
              )}
              {attraction.min_age > 0 && (
                <div className="flex items-center gap-1.5">
                  <IconUsers className="w-4 h-4 text-gray-400" />
                  גיל {attraction.min_age}{attraction.max_age < 99 ? `–${attraction.max_age}` : '+'}
                </div>
              )}
              {attraction.opening_hours && (
                <div className="flex items-center gap-1.5">
                  <IconClock className="w-4 h-4 text-gray-400" />
                  {parseHours(attraction.opening_hours)}
                </div>
              )}
              {(attraction.address || attraction.city) && (
                <div className="flex items-center gap-1.5">
                  <IconMapPin className="w-4 h-4 text-gray-400" />
                  {attraction.address || attraction.city}
                </div>
              )}
            </div>

            {/* כפתורי תקשורת */}
            <div className="space-y-2">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: '#25D366' }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.886l6.232-1.638A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.032-1.37l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/></svg>
                  וואטסאפ
                </a>
              )}
              {attraction.phone && (
                <a href={`tel:${attraction.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-gray-600">
                  <IconPhone className="w-4 h-4" />חייג עכשיו
                </a>
              )}
              {attraction.website && (
                <a href={attraction.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-gray-700 border border-gray-200 hover:bg-gray-50">
                  <IconGlobe className="w-4 h-4" />אתר האטרקציה
                </a>
              )}
            </div>

            {/* מפה */}
            {(attraction.address || attraction.city) && (
              <div className="mt-4">
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank" rel="noopener noreferrer"
                  className="relative block rounded-xl overflow-hidden border border-gray-100" style={{ height: '140px' }}>
                  <iframe width="100%" height="140" style={{ border: 0, pointerEvents: 'none', filter: 'grayscale(100%) brightness(1.1)', opacity: 0.85 }}
                    loading="lazy" src={`https://maps.google.com/maps?q=${mapsQuery}&output=embed&z=15&hl=iw`} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold px-4 py-2 rounded-full shadow-lg" style={{ backgroundColor: '#fdfdff', color: '#8B6914' }}>
                      📍 להצגה על המפה
                    </span>
                  </div>
                </a>
                <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-bold text-white bg-blue-600">
                  <IconNavigation className="w-3.5 h-3.5" />נווט לאטרקציה
                </a>
              </div>
            )}
          </div>

          {/* תמונות */}
          <div className="bg-gray-100 rounded-2xl relative overflow-hidden">
            {images.length > 0 ? (
              <>
                <div className="flex overflow-x-auto snap-x snap-mandatory md:block" style={{ scrollbarWidth: 'none' }}>
                  {images.map((url, i) => (
                    <div key={i} className="shrink-0 w-full snap-start md:hidden">
                      <img src={url} alt={attraction.name} className="w-full h-64 object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  {images.map((url, i) => (
                    <img key={i} src={url} alt={attraction.name} loading={i === 0 ? 'eager' : 'lazy'}
                      className="w-full h-auto block max-h-[55vh] object-contain"
                      style={{ display: i === currentImage ? 'block' : 'none' }} />
                  ))}
                  {images.length > 1 && (
                    <>
                      <button onClick={() => setCurrentImage(prev => (prev - 1 + images.length) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10">
                        <IconChevronRight className="w-5 h-5" />
                      </button>
                      <button onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10">
                        <IconChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, i) => (
                          <button key={i} onClick={() => setCurrentImage(i)}
                            className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-4xl">🎯</div>
            )}
            <button onClick={() => setLiked(l => !l)}
              className="absolute top-4 left-4 z-10 bg-white/90 p-2.5 rounded-full shadow-md">
              <IconHeart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          </div>
        </div>

        {/* thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {images.map((url, i) => (
              <button key={i} onClick={() => setCurrentImage(i)}
                className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === currentImage ? 'border-yellow-600' : 'border-transparent'}`}>
                <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}

        {/* תוכן */}
        <div className="max-w-3xl">
          {attraction.description && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{attraction.description}</p>
            </div>
          )}

          {/* סוגי פעילות */}
          {attraction.activity_type?.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">סוגי פעילות</h2>
              <div className="flex flex-wrap gap-2">
                {attraction.activity_type.map(t => (
                  <span key={t} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-full text-sm font-medium border border-yellow-200">
                    {ACTIVITY_LABELS[t] || t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* וידאו */}
          {attraction.video_url && (
            <div className="border-t border-gray-100 pt-6 mb-6">
              <h2 className="font-bold text-gray-900 text-lg mb-4">סרטון</h2>
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={attraction.video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                  className="absolute inset-0 w-full h-full rounded-xl" allowFullScreen />
              </div>
            </div>
          )}

          <ReviewsSection attractionId={attraction.id} />
        </div>

      </div>
    </main>
  )
}
