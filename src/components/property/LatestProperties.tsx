'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { IconStar } from '@/components/icons'

type Property = {
  slug?: string
  id: string
  name: string
  short_description: string
  category: string[]
  region: string
  city: string
  price_per_night: number
  max_guests: number
  avg_rating: number
  instant_book: boolean
  property_images: { url: string }[]
  reviews?: { id: string }[]
  accepts_miluim?: boolean
  has_shelter?: boolean
  phone?: string
}

const REGION_LABELS: Record<string, string> = {
  north: 'צפון', galil_west: 'גליל מערבי', galil_upper: 'גליל עליון',
  galil_lower: 'גליל תחתון', kinneret: 'כנרת', hermon: 'חרמון',
  center: 'מרכז', jerusalem: 'ירושלים', dead_sea: 'ים המלח',
  negev: 'דרום', eilat: 'אילת', golan: 'רמת הגולן',
}

export function LatestProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_images(url, "order"), reviews(id), accepts_miluim, has_shelter, phone')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4)
      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading || properties.length === 0) return null

  return (
    <section className="section-padding bg-white !pt-8" dir="rtl">
      <div className="page-container !max-w-[90rem] !px-3 sm:!px-4">

        {/* כותרת */}
        <div className="flex items-end justify-between mb-6">
          <h2
            className="section-title shimmer-text"
            style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)' }}
          >
            הצימרים הנצפים ביותר
          </h2>
          <Link href="/search" className="text-sm font-semibold text-gold-deep hover:underline hidden sm:block whitespace-nowrap">
            כל הנכסים ←
          </Link>
        </div>

        {/* גריד */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {properties.map((p) => {
            const firstImage = p.property_images?.[0]?.url
            const phone = p.phone || ''
            const waLink = phone ? `https://wa.me/972${phone.replace(/^0/, '').replace(/\D/g, '')}` : 'https://wa.me/'

            return (
              <div
                key={p.id}
                className="group bg-white rounded-2xl overflow-hidden border border-sand-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* תמונה */}
                <Link href={`/${p.slug || p.id}`} className="block flex-shrink-0">
                  <div className="aspect-[3/2] bg-gray-100 relative overflow-hidden">
                    {firstImage ? (
                      <Image
                        src={firstImage}
                        alt={p.name}
                        fill
                        sizes="(max-width:640px) 50vw, (max-width:1024px) 25vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">אין תמונה</div>
                    )}
                    {p.instant_book && (
                      <div className="absolute top-2 right-2">
                        <span
                          className="text-white text-xs font-bold px-2.5 py-1 rounded-lg animate__animated animate__headShake animate__infinite animate__slow"
                          style={{
                            background: 'linear-gradient(135deg, #f5d078 0%, #d4a843 40%, #b8860b 100%)',
                            boxShadow: '0 2px 8px rgba(212,168,67,0.6)',
                            display: 'inline-block',
                          }}
                        >
                          מיידי
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* תוכן */}
                <Link href={`/${p.slug || p.id}`} className="block flex-1 p-3 sm:p-4">
                  {/* שם + דירוג */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3 className="font-bold text-charcoal text-sm sm:text-base group-hover:text-gold-deep transition-colors line-clamp-1 flex-1 text-right">
                      {p.name}
                    </h3>
                    {p.avg_rating > 0 && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <IconStar className="w-3 h-3 sm:w-3.5 sm:h-3.5" filled={true} />
                        <span className="text-xs text-taupe">{p.avg_rating}</span>
                      </div>
                    )}
                  </div>

                  {/* מיקום */}
                  <p className="text-xs text-taupe mb-2 text-right">
                    {p.city || REGION_LABELS[p.region] || p.region}
                  </p>

                  {/* תגיות מיוחדות */}
                  {(p.accepts_miluim || p.has_shelter) && (
                    <div className="flex flex-wrap gap-1 mb-2 justify-end">
                      {p.accepts_miluim && (
                        <span className="text-[10px] font-bold text-gray-600 border border-gray-300 rounded px-1.5 py-0.5">
                          שובר מילואים
                        </span>
                      )}
                      {p.has_shelter && (
                        <span className="text-[10px] font-bold text-gray-600 border border-gray-300 rounded px-1.5 py-0.5">
                          מרחב מוגן
                        </span>
                      )}
                    </div>
                  )}

                  {/* מחיר */}
                  <div className="flex items-baseline gap-1 justify-end">
                    <span className="text-taupe text-xs">/ לילה</span>
                    <span className="font-bold text-charcoal text-sm sm:text-base">₪{p.price_per_night}</span>
                    <span className="text-xs text-taupe">החל מ:</span>
                  </div>
                </Link>

                {/* כפתורי יצירת קשר — מתוקנים */}
                <div className="px-3 pb-3 sm:px-4 sm:pb-4 mt-auto">
                  <div className="flex gap-2">
                    <a
                      href={`tel:${phone}`}
                      onClick={e => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl font-bold text-gray-700 transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f5f0e8 100%)',
                        border: '1px solid #e5e0d5',
                        padding: '8px 4px',
                        fontSize: 'clamp(11px, 2.5vw, 13px)',
                        minHeight: '40px',
                      }}
                    >
                      <span>📞</span>
                      <span>התקשר</span>
                    </a>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl font-bold text-gray-700 transition-all active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0faf4 100%)',
                        border: '1px solid #c3e6cb',
                        padding: '8px 4px',
                        fontSize: 'clamp(11px, 2.5vw, 13px)',
                        minHeight: '40px',
                      }}
                    >
                      <span>💬</span>
                      <span>וואטסאפ</span>
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* כפתור "כל הנכסים" — מובייל בלבד */}
        <div className="mt-6 sm:hidden text-center">
          <Link
            href="/search"
            className="inline-block px-8 py-3 rounded-full font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #C8960C, #8B6914)' }}
          >
            כל הנכסים ←
          </Link>
        </div>
      </div>
    </section>
  )
}
