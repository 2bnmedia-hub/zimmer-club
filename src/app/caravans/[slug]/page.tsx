'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { GenericReviews } from '@/components/GenericReviews'
import { AdminBackButton } from '@/components/AdminBackButton'
import { AdminGenericReviews } from '@/components/AdminGenericReviews'
import { IconMapPin, IconNavigation, IconArrowRight, IconStar, IconHeart, IconChevronLeft, IconChevronRight, IconZap, IconUsers, IconPhone, IconX } from '@/components/icons'
import Image from 'next/image'
import { buildWhatsAppLink } from '@/lib/utils'

const REGION_LABELS: Record<string, string> = {
  north: 'צפון', galil_upper: 'גליל עליון', galil_lower: 'גליל תחתון',
  galil_west: 'גליל מערבי', kinneret: 'כנרת', hermon: 'חרמון',
  golan: 'רמת הגולן', center: 'מרכז', jerusalem: 'ירושלים',
  dead_sea: 'ים המלח', negev: 'דרום', eilat: 'אילת',
}

const TYPE_LABELS: Record<string, string> = {
  auto: 'אוטו קרוואן', trailer: 'קרוואן נגרר', stationed: 'קרוואן ממוקם', truck: 'קרוואן משאית',
}

type Caravan = {
  id: string
  name: string
  slug: string
  short_description: string
  description: string
  caravan_type: string
  region: string
  city: string
  price_per_night: number
  min_nights: number
  max_guests: number
  sleeping_capacity: number
  double_beds: number
  single_beds: number
  manufacture_year: number
  can_relocate: boolean
  instant_book: boolean
  phone: string
  phone2: string
  whatsapp: string
  email: string
  video_url: string
  amenities: string[]
  avg_rating: number
  total_reviews: number
  status: string
}

export default function CaravanPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [caravan, setCaravan] = useState<Caravan | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [galleryExpanded, setGalleryExpanded] = useState(false)
  const lightboxRef = useRef<HTMLDivElement>(null)
  const lightboxCloseRef = useRef<HTMLButtonElement>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    if (images.length <= 1 || galleryExpanded) return
    const interval = setInterval(() => setCurrentImage(prev => (prev + 1) % images.length), 3000)
    return () => clearInterval(interval)
  }, [images, galleryExpanded])

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

  const goToImage = (index: number) => {
    setCurrentImage(index)
    const el = lightboxRef.current
    if (el) el.scrollTo({ left: index * el.offsetWidth, behavior: 'smooth' })
  }

  useEffect(() => {
    async function load() {
      const slugOrId = params.slug as string
      let { data } = await supabase.from('caravans').select('*').eq('slug', slugOrId).single()
      if (!data) {
        const res = await supabase.from('caravans').select('*').eq('id', slugOrId).single()
        data = res.data
      }
      if (!data) { router.push('/caravans'); return }
      // redirect ל-id אם הגיע דרך slug
      if (data.slug && slugOrId === data.slug && /[\u0590-\u05FF]/.test(data.slug)) {
        router.replace(`/caravans/${data.id}`)
        return
      }
      setCaravan(data)
      const { data: imgData } = await supabase.from('caravan_images').select('url').eq('caravan_id', data.id).order('order')
      setImages(imgData?.map((i: any) => i.url) || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">טוען...</div></div>
  if (!caravan) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: caravan.name,
    description: caravan.short_description || caravan.description,
    image: images[0] || '',
    offers: {
      '@type': 'Offer',
      price: caravan.price_per_night,
      priceCurrency: 'ILS',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: caravan.avg_rating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: caravan.avg_rating,
      reviewCount: caravan.total_reviews,
    } : undefined,
    url: `https://www.zimmer.club/caravans/${caravan.id}`,
  }

  const waLink = caravan.whatsapp ? buildWhatsAppLink(caravan.whatsapp, `שלום, אני מעוניין בקרוואן ${caravan.name}`) : null
  const mapsQuery = encodeURIComponent((caravan.city || '') + ', ישראל')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AdminBackButton />
      <main className="min-h-screen bg-white pt-4" dir="rtl">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">

          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <IconArrowRight className="w-4 h-4" />חזרה
          </button>

          <div className="grid grid-cols-1 md:grid-cols-[30%_70%] gap-4 md:gap-6 mb-6 items-start">

            {/* מידע */}
            <div className="order-2 md:order-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{TYPE_LABELS[caravan.caravan_type]} · {caravan.city || REGION_LABELS[caravan.region]}</p>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{caravan.name}</h1>
              {caravan.short_description && <p className="text-sm text-gray-600 mb-4">{caravan.short_description}</p>}

              {caravan.avg_rating > 0 && (
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl w-fit mb-4">
                  <IconStar className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-900">{caravan.avg_rating}</span>
                  <span className="text-xs text-gray-500">({caravan.total_reviews})</span>
                </div>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {caravan.price_per_night > 0 && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">₪{caravan.price_per_night.toLocaleString()}</span>
                    <span className="text-gray-400">/ לילה</span>
                  </div>
                )}
                {caravan.max_guests > 0 && <div className="flex items-center gap-1.5"><IconUsers className="w-4 h-4 text-gray-400" />עד {caravan.max_guests} אורחים</div>}
                {caravan.sleeping_capacity > 0 && <div>🛏 {caravan.sleeping_capacity} מיטות שינה</div>}
                {caravan.manufacture_year > 0 && <div>📅 שנת ייצור: {caravan.manufacture_year}</div>}
                {caravan.can_relocate && <div>🚐 ניתן להצבה בשטח</div>}
                {caravan.instant_book && <div className="flex items-center gap-1"><IconZap className="w-4 h-4" style={{color:'#C4A56B'}} />הזמנה מיידית</div>}
                <div className="flex items-center gap-1.5"><IconMapPin className="w-4 h-4 text-gray-400" />{caravan.city || REGION_LABELS[caravan.region]}</div>
              </div>

              {/* כפתורי תקשורת */}
              <div className="flex gap-2">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{background:'linear-gradient(135deg, #25D366 0%, #128C7E 100%)', boxShadow:'0 4px 12px rgba(37,211,102,0.3)'}}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.826L.057 23.886l6.232-1.638A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.894a9.893 9.893 0 01-5.032-1.37l-.361-.214-3.741.981.999-3.648-.235-.374A9.861 9.861 0 012.106 12C2.106 6.58 6.58 2.106 12 2.106c5.42 0 9.894 4.474 9.894 9.894 0 5.42-4.474 9.894-9.894 9.894z"/></svg>
                    וואטסאפ
                  </a>
                )}
                {caravan.phone && (
                  <a href={`tel:${caravan.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                    style={{background:'linear-gradient(135deg, #C8960C 0%, #8B6914 100%)', boxShadow:'0 4px 12px rgba(139,105,20,0.3)'}}>
                    <IconPhone className="w-4 h-4" color="white" />התקשר
                  </a>
                )}
              </div>

              {/* מפה */}
              {caravan.city && (
                <div className="mt-4">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-gray-100 hover:border-amber-200 transition-colors"
                    style={{height:'140px', background:'linear-gradient(135deg,#f0f4f0 0%,#e8f0e8 50%,#ddeedd 100%)'}}>
                    <div className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center">
                      <IconNavigation className="w-5 h-5" style={{color:'#8B6914'}} />
                    </div>
                    <p className="text-xs font-bold text-gray-700">{caravan.city}</p>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full shadow" style={{backgroundColor:'#fff', color:'#8B6914'}}>📍 פתח בגוגל מפות</span>
                  </a>
                </div>
              )}
            </div>

            {/* תמונות */}
            <div className="order-1 md:order-2 bg-gray-100 rounded-2xl relative overflow-hidden">
              {images.length > 0 ? (
                <>
                  {!galleryExpanded && (
                    <div className="md:hidden grid grid-cols-3 grid-rows-2 gap-1 p-1" style={{ height: 280 }}>
                      <button type="button" onClick={() => { setCurrentImage(0); setGalleryExpanded(true) }}
                        aria-label={`פתח גלריית תמונות, תמונה 1 מתוך ${images.length}`}
                        className="col-span-2 row-span-2 relative rounded-r-xl overflow-hidden">
                        <Image src={images[0]} alt={caravan.name} fill sizes="66vw" className="object-cover" priority />
                      </button>
                      {images.slice(1, 4).map((url, i) => {
                        const idx = i + 1
                        const remaining = images.length - 4
                        const isLastSlot = i === 2
                        return (
                          <button key={idx} type="button" onClick={() => { setCurrentImage(idx); setGalleryExpanded(true) }}
                            aria-label={isLastSlot && remaining > 0 ? `הצג את כל ${images.length} התמונות` : `פתח גלריית תמונות, תמונה ${idx + 1} מתוך ${images.length}`}
                            className={`relative overflow-hidden ${i === 0 ? 'rounded-tl-xl' : ''} ${isLastSlot ? 'rounded-bl-xl' : ''}`}>
                            <Image src={url} alt={caravan.name} fill sizes="33vw" className="object-cover" />
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
                  {galleryExpanded && (
                    <div className="md:hidden fixed inset-0 z-[999997] bg-black flex flex-col" role="dialog" aria-modal="true" aria-label="גלריית תמונות במסך מלא">
                      <button type="button" ref={lightboxCloseRef} onClick={() => setGalleryExpanded(false)}
                        aria-label="סגור גלריית תמונות"
                        className="absolute top-4 right-4 z-10 bg-white/15 text-white p-2.5 rounded-full">
                        <IconX className="w-5 h-5" />
                      </button>
                      {images.length > 1 && (
                        <div className="absolute top-4 left-4 z-10 bg-white/15 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          {currentImage + 1} / {images.length}
                        </div>
                      )}
                      <div ref={lightboxRef} className="flex-1 flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                        style={{ scrollbarWidth: 'none' }}
                        onScroll={(e) => {
                          const el = e.currentTarget
                          const idx = Math.round(el.scrollLeft / el.offsetWidth)
                          setCurrentImage(idx)
                        }}>
                        {images.map((url, i) => (
                          <div key={i} className="shrink-0 w-full h-full relative snap-start">
                            <Image src={url} alt={caravan.name} fill sizes="100vw" className="object-contain" />
                          </div>
                        ))}
                      </div>
                      {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {images.map((_, i) => <button key={i} onClick={() => goToImage(i)} aria-label={`עבור לתמונה ${i + 1}`} className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/40'}`} />)}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="hidden md:block relative w-full" style={{height:'55vh'}}>
                    {images.map((url, i) => (
                      <Image key={i} src={url} alt={caravan.name} fill priority={i === 0}
                        sizes="(max-width: 768px) 100vw, 70vw"
                        className="object-contain"
                        style={{display: i === currentImage ? 'block' : 'none'}} />
                    ))}
                    {images.length > 1 && (
                      <>
                        <button onClick={() => setCurrentImage(prev => (prev - 1 + images.length) % images.length)}
                          aria-label="התמונה הקודמת"
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10">
                          <IconChevronRight className="w-5 h-5" />
                        </button>
                        <button onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}
                          aria-label="התמונה הבאה"
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-md z-10">
                          <IconChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                          {images.map((_, i) => (
                            <button key={i} onClick={() => setCurrentImage(i)}
                              aria-label={`עבור לתמונה ${i + 1}`}
                              className={`w-2 h-2 rounded-full transition-colors ${i === currentImage ? 'bg-white' : 'bg-white/50'}`} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400 text-4xl">🚐</div>
              )}
              <button onClick={() => setLiked(l => !l)} className="absolute top-4 left-4 z-10 bg-white/90 p-2.5 rounded-full shadow-md">
                <IconHeart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
              <div className="absolute top-3 right-3 z-10">
                <span className="bg-white/95 text-xs font-bold px-2.5 py-1.5 rounded-lg" style={{color:'#8B6914'}}>
                  {TYPE_LABELS[caravan.caravan_type]}
                </span>
              </div>
            </div>
          </div>

          {/* thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {images.map((url, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`shrink-0 w-20 h-16 relative rounded-xl overflow-hidden border-2 ${i === currentImage ? 'border-yellow-600' : 'border-transparent'}`}>
                  <Image src={url} alt={`${caravan.name} — תמונה ${i + 1}`} fill sizes="80px" className="object-contain bg-gray-100" />
                </button>
              ))}
            </div>
          )}

          {/* תוכן */}
          <div className="max-w-3xl">
            {caravan.description && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{caravan.description}</p>
              </div>
            )}

            {/* שירותים */}
            {caravan.amenities?.length > 0 && (
              <div className="border-t border-gray-100 pt-6 mb-6">
                <h2 className="font-bold text-gray-900 text-lg mb-4">שירותים ואבזור</h2>
                <div className="flex flex-wrap gap-2">
                  {caravan.amenities.map(a => (
                    <span key={a} className="px-3 py-1.5 bg-yellow-50 text-yellow-800 rounded-full text-sm border border-yellow-200">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* וידאו */}
            {caravan.video_url && (() => {
              const vid = caravan.video_url
              const isYT = vid.includes('youtube.com') || vid.includes('youtu.be')
              const isVimeo = vid.includes('vimeo.com')
              const embedSrc = isYT
                ? vid.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')
                : isVimeo ? vid.replace('vimeo.com/', 'player.vimeo.com/video/') : null
              return (
                <div className="border-t border-gray-100 pt-6 mb-6">
                  <h2 className="font-bold text-gray-900 text-lg mb-4">סרטון</h2>
                  {embedSrc ? (
                    <div className="relative w-full" style={{paddingBottom:'56.25%'}}>
                      <iframe src={embedSrc} className="absolute inset-0 w-full h-full rounded-xl" allowFullScreen />
                    </div>
                  ) : (
                    <a href={vid} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 py-6 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 fill-red-500"><path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 1.77-.13 3.08-.44 3.83-.28.66-.73 1.11-1.39 1.39-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 17c-3.19 0-5.17-.13-5.83-.44-.66-.28-1.11-.73-1.39-1.39-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L4 12c0-1.77.13-3.08.44-3.83.28-.66.73-1.11 1.39-1.39.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 7c3.19 0 5.17.13 5.83.44.66.28 1.11.73 1.39 1.39z"/></svg>
                      <span className="font-bold text-gray-700">לצפייה בסרטון</span>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-gray-400"><path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59L7.76 14.83l1.41 1.41L19 5.41V9h2V3h-7z"/></svg>
                    </a>
                  )}
                </div>
              )
            })()}

            <GenericReviews entityId={caravan.id} table="caravan_reviews" foreignKey="caravan_id" />
              <AdminGenericReviews entityId={caravan.id} table="caravan_reviews" foreignKey="caravan_id" />
          </div>
        </div>
      </main>
    </>
  )
}
